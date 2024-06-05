import SwiftUI
import Web5

struct DidView: View {

    enum DidState {
        case creating
        case created(Did)
        case error(Error)
    }

    @State var didState: DidState = .creating

    var body: some View {
        VStack {
            switch didState {
            case .creating:
                LoadingView(message: "Creating DID")
            case let .created(did):
                Text(did.uri)
            case let .error(error):
                Text("Error creating DID: \(error.localizedDescription)")
            }
        }
        .padding()
        .task {
            do {
                didState = .created(try createDid())
            } catch {
                didState = .error(error)
            }
        }
    }
}

#Preview {
    DidView()
}
