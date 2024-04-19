import UIKit

struct EffectPreviewCellViewModel: Hashable {
    let preview: EffectPreview
    let isSelected: Bool
}

class EffectPreviewCell: ReusableCell {
    static let cellSize = CGSize(width: 70, height: 70)
    
    @IBOutlet weak var selectionBorder: UIView!
    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var letterLabel: UILabel!
    @IBOutlet weak var letterCenterYConstraint: NSLayoutConstraint!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        letterLabel.text = nil
        letterCenterYConstraint.constant = -15.5
        
        selectionBorder.layer.cornerRadius = EffectPreviewCell.cellSize.width / 2
        selectionBorder.layer.borderColor = UIColor.white.cgColor
        selectionBorder.layer.borderWidth = 1.5
    }
    
    override func prepareForReuse() {
        super.prepareForReuse()
        
        imageView.image = nil
        imageView.backgroundColor = nil
        imageView.layer.borderColor = nil
        imageView.layer.cornerRadius = 0
        imageView.layer.borderWidth = 0
        letterLabel.text = nil
    }
    
    func update(with viewModel: EffectPreviewCellViewModel) {
        switch viewModel.preview {
        case let .uniqueIcon(named):
            imageView.image = UIImage(named: named)
        case let .color(hex):
            imageView.backgroundColor = UIColor(rgb: hex)
            imageView.layer.borderColor = UIColor.white.cgColor
            imageView.layer.borderWidth = 2
            imageView.layer.cornerRadius = imageView.bounds.width / 2
        case let .templatedIcon(named, letter):
            imageView.image = UIImage(named: named)
            letterLabel.text = String(letter)
        case .none:
            break
        }
        
        selectionBorder.isHidden = !viewModel.isSelected
    }
}
