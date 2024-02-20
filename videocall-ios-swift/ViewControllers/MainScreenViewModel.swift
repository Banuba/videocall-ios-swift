import UIKit
import AVFoundation
import BNBSdkApi
import BNBSdkCore
import AgoraRtcKit

final class MainScreenViewModel: NSObject, AgoraRtcEngineDelegate {
    unowned var view: MainScreenProtocol

    private var selectedTechnology: Technology
    private var selectedCategory: EffectsCategory
    private var selectedGroup: EffectsGroup
    private var selectedEffect: EffectConfig
    
    private var categoriesDataSource: UICollectionViewDiffableDataSource<Int, EffectsCategoryCellViewModel>!
    private var groupsDataSource: UICollectionViewDiffableDataSource<Int, EffectsGroupCellViewModel>!
    private var effectsDataSource: UICollectionViewDiffableDataSource<Int, EffectPreviewCellViewModel>!
    
    private let player: Player
    private let cameraDevice: CameraDevice
    private let agoraKit: AgoraRtcEngineKit!
    
    init(view: MainScreenProtocol) {
        self.view = view
        
        selectedTechnology = .arVideoCall
        selectedCategory = selectedTechnology.categories.first!
        selectedGroup = selectedCategory.effectsGroups.first!
        selectedEffect = selectedGroup.effectsList.first!
        
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
        setupDataSources()
    }
    
    func switchCamera() {
        cameraDevice.switchMode()
    }
    
    func muteEffect() {
        player.volume = 0.0
    }
    
    func resetEffect() {
        Task {
            await loadEffect(selectedEffect)
        }
    }
    
    // MARK: - Cell sizes and insets
    
    func sizeForEffectPreviewCell() -> CGSize {
        EffectPreviewCell.cellSize
    }
    
    func sizeForEffectsCategoryCell(at indexPath: IndexPath) -> CGSize {
        guard let vm = categoriesDataSource.itemIdentifier(for: indexPath) else { return .zero }
        let height = view.effectsCategoriesCollectionView.bounds.height
        let width = EffectsCategoryCell.requiredWidth(with: vm)
        return CGSize(width: width, height: height)
    }
    
    func sizeForEffectsGroupCell(at indexPath: IndexPath) -> CGSize {
        guard let vm = groupsDataSource.itemIdentifier(for: indexPath) else { return .zero }
        let height: CGFloat = 40
        let width = EffectsGroupCell.requiredWidth(with: vm)
        return CGSize(width: width, height: height)
    }
    
    func insetsForEffectsCategoriesCollectionView() -> UIEdgeInsets {
        let lastIndex = selectedTechnology.categories.count - 1
        guard let firstVM = categoriesDataSource.itemIdentifier(for: .zero),
              let lastVM = categoriesDataSource.itemIdentifier(for: .init(item: lastIndex, section: 0)) else {
            return .zero
        }
        let firstCellWidth = EffectsCategoryCell.requiredWidth(with: firstVM)
        let lastCellWidth = EffectsCategoryCell.requiredWidth(with: lastVM)
        
        let cvWidth = view.effectsCategoriesCollectionView.bounds.width
        let leftInset = (cvWidth - firstCellWidth) / 2
        let rightInset = (cvWidth - lastCellWidth) / 2
        return .init(top: 0, left: leftInset, bottom: 0, right: rightInset)
    }
    
    func insetsForEffectsGroupsCollectionView() -> UIEdgeInsets {
        let lastIndex = selectedCategory.effectsGroups.count - 1
        guard let firstVM = groupsDataSource.itemIdentifier(for: .zero),
              let lastVM = groupsDataSource.itemIdentifier(for: .init(item: lastIndex, section: 0)) else {
            return .zero
        }
        let firstCellWidth = EffectsGroupCell.requiredWidth(with: firstVM)
        let lastCellWidth = EffectsGroupCell.requiredWidth(with: lastVM)
        
        let cvWidth = view.effectsGroupsCollectionView.bounds.width
        let leftInset = (cvWidth - firstCellWidth) / 2
        let rightInset = (cvWidth - lastCellWidth) / 2
        return .init(top: 0, left: leftInset, bottom: 0, right: rightInset)
    }
    
    func insetsForEffectsPreviewsCollectionView() -> UIEdgeInsets {
        let cellWidth = EffectPreviewCell.cellSize.width
        let cvWidth = view.effectsCollectionView.bounds.width
        let inset = (cvWidth - cellWidth) / 2
        return .init(top: 0, left: inset, bottom: 0, right: inset)
    }
    
    // MARK: - Effect selection handling
    
    func didSelectEffectsCategory(with indexPath: IndexPath, animateSelection: Bool) {
        let newCategory = selectedTechnology.categories[indexPath.row]
        guard newCategory != selectedCategory else { return }
        selectedCategory = newCategory
        
        applyUpdatedCategoriesViewModels()
        
        view.effectsCategoriesCollectionView.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: animateSelection)
        didSelectEffectsGroup(with: .zero, animateSelection: false)
    }
    
    func didSelectEffectsGroup(with indexPath: IndexPath, animateSelection: Bool) {
        let newGroup = selectedCategory.effectsGroups[indexPath.item]
        guard newGroup != selectedGroup else { return }
        selectedGroup = newGroup
        
        applyUpdatedGroupsViewModels()
        
        if selectedCategory.effectsGroups.count > 1 {
            view.effectsGroupsCollectionView.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: animateSelection)
        }
        didSelectEffect(with: .zero, animateSelection: false)
    }
    
    func didSelectEffect(with indexPath: IndexPath, animateSelection: Bool) {
        let newEffect = selectedGroup.effectsList[indexPath.item]
        guard newEffect != selectedEffect else { return }
        selectedEffect = newEffect
        
        applyUpdatedEffectPreviewModels()
        
        Task {
            await loadEffect(newEffect)
        }
        
        if selectedGroup.effectsList.count > 1 {
            view.effectsCollectionView.scrollToItem(at: indexPath, at: .centeredHorizontally, animated: animateSelection)
        }
    }
    
    private func setupDataSources() {
        categoriesDataSource = UICollectionViewDiffableDataSource(
            collectionView: view.effectsCategoriesCollectionView,
            cellProvider: { (collectionView, indexPath, viewModel) ->
                UICollectionViewCell? in
                let cell = collectionView.dequeueReusableCell(
                    withReuseIdentifier: EffectsCategoryCell.reuseIdentifier,
                    for: indexPath
                ) as? EffectsCategoryCell
                cell?.update(with: viewModel)
                return cell
            })
        groupsDataSource = UICollectionViewDiffableDataSource(
            collectionView: view.effectsGroupsCollectionView,
            cellProvider: { (collectionView, indexPath, viewModel) ->
                UICollectionViewCell? in
                let cell = collectionView.dequeueReusableCell(
                    withReuseIdentifier: EffectsGroupCell.reuseIdentifier,
                    for: indexPath
                ) as? EffectsGroupCell
                cell?.update(with: viewModel)
                return cell
            })
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
        
        applyUpdatedCategoriesViewModels()
        applyUpdatedGroupsViewModels()
        applyUpdatedEffectPreviewModels()
    }
    
    private func applyUpdatedCategoriesViewModels() {
        var snapshot = NSDiffableDataSourceSnapshot<Int, EffectsCategoryCellViewModel>()
        snapshot.appendSections([0])
        let models = selectedTechnology.categories.map {
            EffectsCategoryCellViewModel(category: $0, isSelected: $0 == selectedCategory)
        }
        snapshot.appendItems(models)
        categoriesDataSource.apply(snapshot, animatingDifferences: false)
    }
    
    private func applyUpdatedGroupsViewModels() {
        var snapshot = NSDiffableDataSourceSnapshot<Int, EffectsGroupCellViewModel>()
        snapshot.appendSections([0])
        let models = selectedCategory.effectsGroups.map {
            EffectsGroupCellViewModel(title: $0.title, isSelected: $0 == selectedGroup)
        }
        if models.count > 1 {
            snapshot.appendItems(models)
        }
        groupsDataSource.apply(snapshot, animatingDifferences: false)
    }
    
    private func applyUpdatedEffectPreviewModels() {
        var snapshot = NSDiffableDataSourceSnapshot<Int, EffectPreviewCellViewModel>()
        snapshot.appendSections([0])
        let models = selectedGroup.effectsList.map {
            EffectPreviewCellViewModel(preview: $0.preview, isSelected: $0 == selectedEffect)
        }
        if models.count > 1 {
            snapshot.appendItems(models)
        }
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
