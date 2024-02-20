struct EffectsCategory: Equatable {
    let title: String
    let effectsGroups: [EffectsGroup]
    
    init(title: String, effectsGroups: [EffectsGroup]) {
        self.title = title
        self.effectsGroups = effectsGroups
    }
}
