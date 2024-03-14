import UIKit
import AVFoundation
import BNBSdkApi
import BNBSdkCore
import AgoraRtcKit

final class MainScreenViewModel: NSObject, AgoraRtcEngineDelegate {
    unowned var view: MainScreenProtocol

    private var selectedEffect: EffectConfig
    private var effectsDataSource: UICollectionViewDiffableDataSource<Int, EffectPreviewCellViewModel>!
    
    private let player: Player
    private let cameraDevice: CameraDevice
    private let agoraKit: AgoraRtcEngineKit!
    
    init(view: MainScreenProtocol) {
        self.view = view
        
        selectedEffect = EffectsFactory.arVideoCallEffects.first!
        
        player = Player()

        // Create a camera device in front facing mode and HD resolution
        cameraDevice = CameraDevice(
            cameraMode: .FrontCameraSession,
            captureSessionPreset: .hd1280x720
        )

        agoraKit = AgoraRtcEngineKit.sharedEngine(withAppId: agoraAppID, delegate: nil)
        
        super.init()
        
        agoraKit.delegate = self
        
        // Create a PixelBuffer output, where `Player` will present frames
        let outputPixelBuffer = PixelBuffer(onPresent: { [weak self] (pixelBuffer) -> Void in
            // Push CVPixelBuffer into the Agora engine
            self?.pushPixelBufferIntoAgoraKit(pixelBuffer: pixelBuffer!)
        })
        
        // Use `CameraDevice` as an `Player` input
        player.use(input: Camera(cameraDevice: cameraDevice))
        
        // Use `View` and `PixelBuffer` as an `Player` outputs
        player.use(outputs: [view.localVideoView, outputPixelBuffer])
    }
    
    func viewDidLoad() {
        setupDataSource()
    }
    
    func switchCamera() {
        cameraDevice.switchMode()
    }
    
    func toggleEffectSoundVolume() {
        player.volume = player.volume.isZero ? 1 : 0
    }
        
    // MARK: - Effect selection handling
    
    func didSelectEffect(with indexPath: IndexPath) {
        let newEffect = EffectsFactory.arVideoCallEffects[indexPath.item]
        guard newEffect != selectedEffect else { return }
        selectedEffect = newEffect
        
        applyUpdatedEffectPreviewModels()
        
        Task {
            await loadEffect(newEffect)
        }
        
        view.effectsCollectionView.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: true)
    }
    
    private func setupDataSource() {
        effectsDataSource = UICollectionViewDiffableDataSource(
            collectionView: view.effectsCollectionView,
            cellProvider: { (collectionView, indexPath, model) ->
                UICollectionViewCell? in
                let cell = collectionView.dequeueReusableCell(
                    withReuseIdentifier: EffectPreviewCell.reuseIdentifier,
                    for: indexPath
                ) as? EffectPreviewCell
                cell?.update(with: model)
                return cell
            })
        
        applyUpdatedEffectPreviewModels()
    }
        
    private func applyUpdatedEffectPreviewModels() {
        var snapshot = NSDiffableDataSourceSnapshot<Int, EffectPreviewCellViewModel>()
        snapshot.appendSections([0])
        let models = EffectsFactory.arVideoCallEffects.map {
            EffectPreviewCellViewModel(preview: $0.preview, isSelected: $0 == selectedEffect)
        }
        snapshot.appendItems(models)
        effectsDataSource.apply(snapshot, animatingDifferences: false)
    }
    
    // MARK: - Camera access check

    func requestCameraPermissionIfNeeded() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] (granted) in
                DispatchQueue.main.async {
                    self?.requestCameraPermissionIfNeeded()
                }
            }
        case .authorized:
            Task { @MainActor in
                // Start camera frames forwarding
                cameraDevice.start()

                // Load initially selected mask
                await loadEffect(selectedEffect)
                
                // Setup Agora video/audio streams and enable external video source
                setupVideo()
                
                // Configure video/audio and join to the Agora channel
                joinChannel()
            }
        default:
            view.presentNoCameraAccessView()
        }
    }
    
    // MARK: - Effect loading
    
    @MainActor
    private func loadEffect(_ config: EffectConfig) async {
        view.setLoadingEffect(true)
        await player.loadEffect(config.effectName)
        view.setLoadingEffect(false)
    }
    
    // MARK: - AgoraRtcEngineDelegate
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinedOfUid uid: UInt, elapsed: Int) {
        let videoCanvas = AgoraRtcVideoCanvas()
        videoCanvas.uid = uid
        videoCanvas.view = view.remoteVideoView
        videoCanvas.renderMode = .hidden
        agoraKit.setupRemoteVideo(videoCanvas)
    }
    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didOccurError errorCode: AgoraErrorCode) {
        print("❌ AgoraRtcEngineKit Error: \(errorCode)")
    }
    
    // MARK: - AgoraKit interoperation
    
    private func pushPixelBufferIntoAgoraKit(pixelBuffer: CVPixelBuffer) {
        let videoFrame = AgoraVideoFrame()
        // Video format = 12 means iOS texture (CVPixelBufferRef)
        videoFrame.format = 12
        videoFrame.time = CMTimeMakeWithSeconds(NSDate().timeIntervalSince1970, preferredTimescale: 1000)
        videoFrame.textureBuf = pixelBuffer
        agoraKit.pushExternalVideoFrame(videoFrame)
    }

    private func setupVideo() {
        agoraKit.enableVideo()
        agoraKit.enableAudio()
        
        // Enable external video source
        agoraKit.setExternalVideoSource(true, useTexture: true, sourceType: .videoFrame)
        
        agoraKit.setChannelProfile(.liveBroadcasting)
        agoraKit.setClientRole(.broadcaster)

        agoraKit.setVideoEncoderConfiguration(
            AgoraVideoEncoderConfiguration(
                size: AgoraVideoDimension1280x720,
                frameRate: .fps30,
                bitrate: AgoraVideoBitrateStandard,
                orientationMode: .adaptative,
                mirrorMode: .enabled
            )
        )
    }
    
    private func joinChannel() {
        let option = AgoraRtcChannelMediaOptions()
        option.publishCustomAudioTrack = false
        option.publishCustomVideoTrack = true
        
        agoraKit.setDefaultAudioRouteToSpeakerphone(true)
        agoraKit.joinChannel(
            byToken: agoraClientToken,
            channelId: agoraChannelId,
            uid: 0,
            mediaOptions: option,
            joinSuccess: { _, _, _ in
                print("✅ Successfuly connected to channel")
            }
        )
        UIApplication.shared.isIdleTimerDisabled = true
    }
}
