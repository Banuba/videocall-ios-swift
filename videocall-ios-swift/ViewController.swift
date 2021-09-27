import UIKit
import BanubaSdk
import AgoraRtcKit

class ViewController: UIViewController {
    
    @IBOutlet weak var remoteVideo: UIView!
    @IBOutlet weak var localVideo: EffectPlayerView!
    
    private var agoraKit: AgoraRtcEngineKit!
    private var sdkManager = BanubaSdkManager()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initializeAgoraEngine()
        setupVideo()
        setupLocalVideo()
        joinChannel()
        localVideo.layoutIfNeeded()
        sdkManager.setup(configuration: EffectPlayerConfiguration(renderMode: .video))
        sdkManager.setRenderTarget(view: localVideo, playerConfiguration: nil)
        sdkManager.output?.startForwardingFrames(handler: { (pixelBuffer) -> Void in
            self.pushPixelBufferIntoAgoraKit(pixelBuffer: pixelBuffer)
        })
    }
    
    override func viewWillAppear(_ animated: Bool) {
        sdkManager.input.startCamera()
        _ = sdkManager.loadEffect("TrollGrandma")
        sdkManager.startEffectPlayer()
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
        agoraKit.setExternalVideoSource(true, useTexture: false, pushMode: true)
        agoraKit.enableVideo()
    }
    
    private func setupLocalVideo() {
        let videoCanvas = AgoraRtcVideoCanvas()
        videoCanvas.uid = 0
        videoCanvas.view = localVideo
        videoCanvas.renderMode = .hidden
        agoraKit.setupLocalVideo(videoCanvas)
    }
    
    private func joinChannel() {
        agoraKit.setDefaultAudioRouteToSpeakerphone(true)
        agoraKit.joinChannel(byToken: agoraClientToken, channelId: agoraChannelId, info: nil, uid: 0)
        UIApplication.shared.isIdleTimerDisabled = true
    }
}

extension ViewController: AgoraRtcEngineDelegate {
    func rtcEngine(_ engine: AgoraRtcEngineKit, firstRemoteVideoDecodedOfUid uid:UInt, size:CGSize, elapsed:Int) {
        let videoCanvas = AgoraRtcVideoCanvas()
        videoCanvas.uid = uid
        videoCanvas.view = remoteVideo
        videoCanvas.renderMode = .hidden
        agoraKit.setupRemoteVideo(videoCanvas)
    }
}

