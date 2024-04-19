import UIKit
import AVFoundation
import BNBSdkApi

protocol MainScreenProtocol: AnyObject {
    var effectsCollectionView: UICollectionView! { get }
    var localVideoView: EffectPlayerView! { get }
    var remoteVideoView: UIView! { get }
    
    func presentNoCameraAccessAlert()
    func setLoadingEffect(_ isLoading: Bool)
}

class MainViewController: UIViewController, MainScreenProtocol, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    @IBOutlet weak var localVideoView: EffectPlayerView!
    @IBOutlet weak var remoteVideoView: UIView!
    @IBOutlet weak var effectsCollectionView: UICollectionView!
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
    @IBOutlet weak var switchCameraButton: UIButton!
    
    private var viewModel: MainScreenViewModel!
    private var didCheckCameraAccess = false
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        viewModel = MainScreenViewModel(view: self)
       
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
    
    // MARK: - MainViewProtocol
    
    func presentNoCameraAccessAlert() {
        let alert = UIAlertController(
            title: "No access to camera",
            message: "Allow access to \"Camera\" in Settings to continue",
            preferredStyle: .alert
        )
        alert.addAction(
            .init(
                title: "Open Settings",
                style: .default,
                handler: { _ in
                    if let url = URL(string: UIApplication.openSettingsURLString), UIApplication.shared.canOpenURL(url) {
                        UIApplication.shared.open(url, options: [:], completionHandler: nil)
                    }
                }
            )
        )
        alert.addAction(
            .init(
                title: "Back",
                style: .cancel
            )
        )
        present(alert, animated: true)
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
    
    @IBAction func muteEffect(_ sender: UIButton) {
        viewModel.toggleEffectSoundVolume()
    }
    
    // MARK: - UICollectionViewDelegateFlowLayout
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        EffectPreviewCell.cellSize
    }
    
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, insetForSectionAt section: Int) -> UIEdgeInsets {
        let cellWidth = EffectPreviewCell.cellSize.width
        let cvWidth = effectsCollectionView.bounds.width
        let inset = (cvWidth - cellWidth) / 2
        return .init(top: 0, left: inset, bottom: 0, right: inset)
    }

    // MARK: - UICollectionViewDelegate
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        viewModel.didSelectEffect(with: indexPath)
    }
}
