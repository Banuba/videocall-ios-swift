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
        initializeAgoraEngine()
        setupVideo()
        //setupLocalVideo()
        joinChannel()
        localVideo.layoutIfNeeded()

        player = Player()

        let outputPixelBuffer = PixelBuffer(onPresent: { (pixelBuffer) -> Void in
            self.pushPixelBufferIntoAgoraKit(pixelBuffer: pixelBuffer!)
        })

        let cameraDevice = CameraDevice(
            cameraMode: .FrontCameraSession,
            captureSessionPreset: .hd1280x720
        )
        cameraDevice.start()

        player.use(input: Camera(cameraDevice: cameraDevice), outputs: [localVideo, outputPixelBuffer])
    }
    
    override func viewWillAppear(_ animated: Bool) {
        player.effectPlayer.effectManager()?.setEffectVolume(0)
        _ = player.load(effect: "TrollGrandma")
    }
    
    private func pushPixelBufferIntoAgoraKit(pixelBuffer: CVPixelBuffer) {
        let videoFrame = AgoraVideoFrame()
        //Video format = 12 means iOS texture (CVPixelBufferRef)
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
        agoraKit.setExternalVideoSource(true, useTexture: true, sourceType: .videoFrame)
        
        // set live broadcaster mode
        agoraKit.setChannelProfile(.liveBroadcasting)
        // set myself as broadcaster to stream video/audio
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
    
    private func setupLocalVideo() {
        let videoCanvas = AgoraRtcVideoCanvas()
        videoCanvas.uid = 0
        videoCanvas.view = localVideo
        videoCanvas.renderMode = .hidden
        agoraKit.setupLocalVideo(videoCanvas)
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
        // the view to be binded
        videoCanvas.view = remoteVideo
        videoCanvas.renderMode = .hidden
        agoraKit.setupRemoteVideo(videoCanvas)
    }
}

