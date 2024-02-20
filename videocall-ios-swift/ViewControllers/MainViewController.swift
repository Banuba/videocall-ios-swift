import UIKit
import AVFoundation
import BNBSdkApi

protocol MainScreenProtocol: AnyObject {
    var effectsCategoriesCollectionView: UICollectionView! { get }
    var effectsGroupsCollectionView: UICollectionView! { get }
    var effectsCollectionView: UICollectionView! { get }
    
    var localVideoView: EffectPlayerView! { get }
    var remoteVideoView: UIView! { get }
    
    func presentNoCameraAccessView()
    func setLoadingEffect(_ isLoading: Bool)
}

class MainViewController: UIViewController, MainScreenProtocol, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    @IBOutlet weak var localVideoView: EffectPlayerView!
    @IBOutlet weak var remoteVideoView: UIView!

    @IBOutlet weak var effectsCollectionView: UICollectionView!
    @IBOutlet weak var effectsCategoriesCollectionView: UICollectionView!
    @IBOutlet weak var effectsGroupsCollectionView: UICollectionView!
    @IBOutlet weak var effectsCollectionViewBottomConstraint: NSLayoutConstraint!
    
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
    
    @IBOutlet weak var switchCameraButton: UIButton!
    
    private var viewModel: MainScreenViewModel!
    private var didCheckCameraAccess = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        viewModel = MainScreenViewModel(view: self)
       
        effectsCategoriesCollectionView.registerReusableCell(EffectsCategoryCell.self)
        effectsGroupsCollectionView.registerReusableCell(EffectsGroupCell.self)
        effectsCollectionView.registerReusableCell(EffectPreviewCell.self)
        
        localVideoView.layer.cornerRadius = 4
        localVideoView.layer.borderWidth = 2
        localVideoView.layer.borderColor = UIColor(red: 238, green: 242, blue: 247).withAlphaComponent(0.75).cgColor
        localVideoView.clipsToBounds = true
        
        viewModel.viewDidLoad()
    }
    
    override func viewIsAppearing(_ animated: Bool) {
        super.viewIsAppearing(animated)
        
        if !didCheckCameraAccess {
            viewModel.requestCameraPermissionIfNeeded()
            didCheckCameraAccess = true
        }
    }
    
    override func viewSafeAreaInsetsDidChange() {
        super.viewSafeAreaInsetsDidChange()
        // Add additional bottom padding on devices without Face ID
        if view.safeAreaInsets.bottom == 0 {
            effectsCollectionViewBottomConstraint.constant = 16
        }
    }
    
    // MARK: - MainViewProtocol
    
    func presentNoCameraAccessView() {
        let noCameraViewController = NoCameraAccessViewController()
        noCameraViewController.modalPresentationStyle = .currentContext
        present(noCameraViewController, animated: true, completion: nil)
    }
    
    func setLoadingEffect(_ isLoading: Bool) {
        if isLoading {
            activityIndicator.startAnimating()
        } else {
            activityIndicator.stopAnimating()
        }
    }
        
    // MARK: - Actions

    @IBAction func switchCamera(_ sender: UIButton) {
        viewModel.switchCamera()
    }
    
    @IBAction func resetEffect(_ sender: UIButton) {
        viewModel.resetEffect()
    }
    
    @IBAction func muteEffect(_ sender: UIButton) {
        viewModel.muteEffect()
    }
    
    // MARK: - UICollectionViewDelegateFlowLayout
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        if collectionView === effectsCollectionView {
            return viewModel.sizeForEffectPreviewCell()
        }
        if collectionView === effectsCategoriesCollectionView {
            return viewModel.sizeForEffectsCategoryCell(at: indexPath)
        }
        if collectionView === effectsGroupsCollectionView {
            return viewModel.sizeForEffectsGroupCell(at: indexPath)
        }
        fatalError("Unknown UICollectionView")
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        if collectionView === effectsCategoriesCollectionView {
            return viewModel.insetsForEffectsCategoriesCollectionView()
        }
        if collectionView === effectsGroupsCollectionView {
            return viewModel.insetsForEffectsGroupsCollectionView()
        }
        if collectionView === effectsCollectionView {
            return viewModel.insetsForEffectsPreviewsCollectionView()
        }
        fatalError("Unknown UICollectionView")
    }

    // MARK: - UICollectionViewDelegate
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        if collectionView === effectsCategoriesCollectionView {
            viewModel.didSelectEffectsCategory(with: indexPath, animateSelection: true)
        }
        if collectionView === effectsGroupsCollectionView {
            viewModel.didSelectEffectsGroup(with: indexPath, animateSelection: true)
        }
        if collectionView === effectsCollectionView {
            viewModel.didSelectEffect(with: indexPath, animateSelection: true)
        }
    }
}
