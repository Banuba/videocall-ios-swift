import UIKit

extension UICollectionView {
    func registerReusableCell(_ cell: ReusableCell.Type) {
        register(cell.nib, forCellWithReuseIdentifier: cell.reuseIdentifier)
    }
}
