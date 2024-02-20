import UIKit

struct EffectsGroupCellViewModel: Hashable {
    let title: String
    let isSelected: Bool
}

final class EffectsGroupCell: ReusableCell {
    @IBOutlet weak var label: UILabel!
    
    override var bounds: CGRect {
        didSet {
            layer.cornerRadius = bounds.height / 2
        }
    }

    static func requiredWidth(with viewModel: EffectsGroupCellViewModel) -> CGFloat {
        let padding: CGFloat = 20
        let fontAttributes = [NSAttributedString.Key.font: UIFont.interRegular(size: 13)]
        let requiredWidth = (viewModel.title as NSString).size(withAttributes: fontAttributes).width.rounded(.up) + padding * 2
        return requiredWidth
    }
    
    override func awakeFromNib() {
        super.awakeFromNib()
        layer.borderColor = UIColor.black.cgColor
        layer.cornerCurve = .continuous
    }
    
    func update(with viewModel: EffectsGroupCellViewModel) {
        label.text = viewModel.title
        layer.borderWidth = viewModel.isSelected ? 1 : 0
    }
}
