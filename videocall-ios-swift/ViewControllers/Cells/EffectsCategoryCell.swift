import UIKit

struct EffectsCategoryCellViewModel: Hashable {
    let title: String
    let isSelected: Bool
    
    init(category: EffectsCategory, isSelected: Bool) {
        self.title = category.title
        self.isSelected = isSelected
    }
}

final class EffectsCategoryCell: ReusableCell {
    @IBOutlet weak var label: UILabel!
    @IBOutlet weak var indicatorView: UIView!

    class func requiredWidth(with viewModel: EffectsCategoryCellViewModel) -> CGFloat {
        let fontAttributes = [NSAttributedString.Key.font: UIFont.interBold(size: 13)]
        let requiredWidth = (viewModel.title.uppercased() as NSString).size(withAttributes: fontAttributes).width.rounded(.up)
        return requiredWidth
    }
    
    func update(with viewModel: EffectsCategoryCellViewModel) {
        label.text = viewModel.title.uppercased()
        indicatorView.isHidden = !viewModel.isSelected
        label.font = viewModel.isSelected ? .interBold(size: 13) : .interRegular(size: 13)
        label.alpha = viewModel.isSelected ? 1 : 0.75
    }
}
