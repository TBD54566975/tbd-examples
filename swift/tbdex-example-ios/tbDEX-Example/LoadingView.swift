import SwiftUI

struct LoadingView: View {

    let message: String?

    init(message: String? = nil) {
        self.message = message
    }

    var body: some View {
        VStack {
            Spacer()
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(1.5, anchor: .center)
            if let message = message {
                Text(message)
                    .padding()
            }
            Spacer()
        }
    }
}

#Preview {
    LoadingView(message: "Loading")
}
