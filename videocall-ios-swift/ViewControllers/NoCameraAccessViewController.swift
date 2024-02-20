import UIKit

class NoCameraAccessViewController: UIViewController {
    @IBOutlet weak var allowCameraAccessButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        allowCameraAccessButton.layer.cornerRadius = 21.0
    }
    
    @IBAction func allowCameraAccessButtonTapped(_ sender: Any) {
        let settingsUrl = URL(string: UIApplication.openSettingsURLString)
        if let url = settingsUrl {
            if UIApplication.shared.canOpenURL(url) {
                UIApplication.shared.open(url, options: [:], completionHandler: nil)
            }
        }
    }
    
    @IBAction func backButtonTapped(_ sender: Any) {
        dismiss(animated: true)
    }
}
