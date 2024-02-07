import UIKit
import BNBSdkApi
import AgoraRtcKit

class ViewController: UIViewController {
    
    @IBOutlet weak var remoteVideo: UIView!
    @IBOutlet weak var localVideo: EffectPlayerView!
    
    private var agoraKit: AgoraRtcEngineKit!
    private var player: Player!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        localVideo.layoutIfNeeded()
        
        // Initialize Agora engine
        initializeAgoraEngine()
        
        // Setup Agora video/audio streams and enable external video source
        setupVideo()
        
        // Configure video/audio and join to the Agora channel
        joinChannel()
        
        // Create the effect `Player`
        player = Player()
        
        // Create a PixelBuffer output, where `Player` will present frames
        let outputPixelBuffer = PixelBuffer(onPresent: { [weak self] (pixelBuffer) -> Void in
            // Push CVPixelBuffer into the Agora engine
            self?.pushPixelBufferIntoAgoraKit(pixelBuffer: pixelBuffer!)
        })
        
        // Create a camera device in front facing mode and HD resolution
        let cameraDevice = CameraDevice(
            cameraMode: .FrontCameraSession,
            captureSessionPreset: .hd1280x720
        )
        
        // Use `CameraDevice` as an `Player` input
        player.use(input: Camera(cameraDevice: cameraDevice))
        
        // Use `View` and `PixelBuffer` as an `Player` outputs
        player.use(outputs: [localVideo, outputPixelBuffer])
        
        // Start camera frames forwarding
        cameraDevice.start()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        // Disable effect sounds to avoid conflicts with microphone.
        player.volume = 0.0
        
        // Load effect from the `effects` folder
        _ = player.load(effect: "TrollGrandma")
    }
    
    private func pushPixelBufferIntoAgoraKit(pixelBuffer: CVPixelBuffer) {
        let videoFrame = AgoraVideoFrame()
        // Video format = 12 means iOS texture (CVPixelBufferRef)
        videoFrame.format = 12
        videoFrame.time = CMTimeMakeWithSeconds(NSDate().timeIntervalSince1970, preferredTimescale: 1000)
        videoFrame.textureBuf = pixelBuffer
        agoraKit.pushExternalVideoFrame(videoFrame)
    }
    
    private func initializeAgoraEngine() {
        agoraKit = AgoraRtcEngineKit.sharedEngine(withAppId: agoraAppID, delegate: self)
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
        agoraKit.joinChannel(byToken: agoraClientToken, channelId: agoraChannelId, uid: 0, mediaOptions: option)
        UIApplication.shared.isIdleTimerDisabled = true
    }
}

extension ViewController: AgoraRtcEngineDelegate {    
    func rtcEngine(_ engine: AgoraRtcEngineKit, didJoinedOfUid uid: UInt, elapsed: Int) {
        let videoCanvas = AgoraRtcVideoCanvas()
        videoCanvas.uid = uid
        videoCanvas.view = remoteVideo
        videoCanvas.renderMode = .hidden
        agoraKit.setupRemoteVideo(videoCanvas)
    }
}

