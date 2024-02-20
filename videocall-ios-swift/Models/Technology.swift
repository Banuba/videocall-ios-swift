enum Technology: Int, CaseIterable {
    case arVideoCall
    
    var title: String {
        switch self {
        case .arVideoCall: return "AR VideoCall"
        }
    }
    
    var categories: [EffectsCategory] {
        switch self {
        case .arVideoCall:
            return [
                EffectsCategory(
                    title: "Background separation",
                    effectsGroups: [
                        EffectsGroup(
                            title: "360 backgrounds",
                            effectsList: [
                                .init(effectName: "360_CubemapEverest_noSound_7c98db1", preview: .templatedIcon(named: "360_backgrounds", letter: "A")),
                            ]
                        ),
                        EffectsGroup(
                            title: "AR Background",
                            effectsList: [
                                .init(effectName: "Regular_Dawn_of_nature_6716e33", preview: .templatedIcon(named: "regular_background", letter: "A")),
                                .init(effectName: "Regular_blur_512984e", preview: .templatedIcon(named: "regular_background", letter: "B")),
                            ]
                        ),
                        EffectsGroup(
                            title: "Animated Background",
                            effectsList: [
                                .init(effectName: "video_BG_Metro_sfx_de62811", preview: .templatedIcon(named: "video_texture_background", letter: "A")),
                                .init(effectName: "video_BG_RainyCafe_6716e33", preview: .templatedIcon(named: "video_texture_background", letter: "B")),
                            ]
                        ),
                    ]
                ),
                EffectsCategory(
                    title: "Lightning and Color",
                    effectsGroups: [
                        EffectsGroup(
                            title: "",
                            effectsList: [
                                .init(effectName: "Sunset_6ff084f", preview: .templatedIcon(named: "color_correction", letter: "A")),
                                .init(effectName: "prequel_VE_543daa6", preview: .templatedIcon(named: "color_correction", letter: "B")),
                            ]
                        ),
                    ]
                ),
                EffectsCategory(
                    title: "Touch Up Filters",
                    effectsGroups: [
                        EffectsGroup(
                            title: "No makeup",
                            effectsList: [
                                .init(effectName: "dialect_9f86b27", preview: .templatedIcon(named: "looks", letter: "A")),
                                .init(effectName: "WhooshBeautyFemale_9f86b27", preview: .templatedIcon(named: "looks", letter: "B")),
                            ]
                        ),
                        EffectsGroup(
                            title: "Makeup",
                            effectsList: [
                                .init(effectName: "clubs_9f86b27", preview: .templatedIcon(named: "lipstick_powder_box", letter: "A")),
                                .init(effectName: "relook_9f86b27", preview: .templatedIcon(named: "lipstick_powder_box", letter: "B")),
                            ]
                        ),
                    ]
                ),
                EffectsCategory(
                    title: "AR Face Masks",
                    effectsGroups: [
                        EffectsGroup(
                            title: "Face morphing",
                            effectsList: [
                                .init(effectName: "Nerd2_59e9dbd", preview: .uniqueIcon(named: "nerd_2")),
                                .init(effectName: "TrollGrandma_f87f5c3", preview: .uniqueIcon(named: "troll_grandma")),
                            ]
                        ),
                        EffectsGroup(
                            title: "Skin animation",
                            effectsList: [
                                .init(effectName: "Graduate_d30bea8", preview: .uniqueIcon(named: "graduate")),
                                .init(effectName: "CartoonOctopus_f87f5c3", preview: .uniqueIcon(named: "cartoon_octopus")),
                            ]
                        ),
                        EffectsGroup(
                            title: "Foreground effects",
                            effectsList: [
                                .init(effectName: "frame1_59e9dbd", preview: .uniqueIcon(named: "frame_1")),
                                .init(effectName: "RainbowBeauty_59e9dbd", preview: .uniqueIcon(named: "rainbow_beauty")),
                            ]
                        ),
                    ]
                )
            ]
        }
    }
}
