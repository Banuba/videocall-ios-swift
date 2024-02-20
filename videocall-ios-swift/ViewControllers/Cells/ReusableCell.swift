import UIKit

class ReusableCell: UICollectionViewCell {
    static var reuseIdentifier: String { String(describing: self) }
    static var nib: UINib { UINib(nibName: reuseIdentifier, bundle: nil) }
}
