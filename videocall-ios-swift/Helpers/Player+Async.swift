import BNBSdkCore
import BNBSdkApi

extension Player {
    @discardableResult
    func loadEffect(_ name: String) async -> BNBEffect? {
        await withCheckedContinuation {
            let effect = load(effect: name, sync: true)
            $0.resume(returning: effect)
        }
    }
}

