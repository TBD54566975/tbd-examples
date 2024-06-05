import SwiftUI
import Web5

struct DidView: View {

    enum DidState {
        case creating
        case created(BearerDID)
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

                NavigationLink(destination: OfferingsView(did: did)) {
                    Text("View Offerings")
                }
                .padding()
            case let .error(error):
                Text("Error creating DID: \(error.localizedDescription)")
            }
        }
        .padding()
        .navigationTitle("DID")
        .task {
            do {
                didState = .created(try createOrLoadDid())
            } catch {
                didState = .error(error)
            }
        }
    }
}

#Preview {
    DidView()
}
