import SwiftUI
import tbDEX
import Web5

struct OfferingsView: View {
    
    enum OfferingState {
        case loading
        case loaded([Offering])
        case error(Error)
    }

    let did: BearerDID

    init(did: BearerDID) {
        self.did = did
    }

    @State var offeringState: OfferingState = .loading

    var body: some View {
        VStack {
            switch offeringState {
            case .loading:
                LoadingView(message: "Fetching Offerings")
            case let .loaded(offerings):
                OfferingsListView(did: did, offerings: offerings)
            case .error(let error):
                Text("Failed to fetch offerings: \(error.localizedDescription)")
            }
        }
        .navigationTitle("Offerings")
        .task {
            Task {
                do {
                    offeringState = .loaded(try await getOfferings())
                } catch {
                    offeringState = .error(error)
                }
            }
        }
    }
}

struct OfferingsListView: View {
    
    let did: BearerDID
    let offerings: [Offering]

    @State var ongoingExchange: Bool = false

    var body: some View {
        List {
            ForEach(offerings, id: \.metadata.id) { offering in
                VStack(alignment: .leading, spacing: 10) {
                    VStack(alignment: .leading) {
                        HStack {
                            Text("1 \(offering.data.payin.currencyCode)")
                            Text("→")
                            Text("\(offering.data.payoutUnitsPerPayinUnit) \(offering.data.payout.currencyCode)")
                        }
                        Text(offering.data.description)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    HStack {
                        Spacer()
                        if ongoingExchange {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                        } else {
                            Button("Run Example Exchange") {
                                Task {
                                    defer { ongoingExchange = false }

                                    ongoingExchange = true
                                    do {
                                        try await exampleExchange(offering: offering, did: did)
                                    } catch {
                                        print("Error during example exchange: \(error)")
                                    }
                                }
                            }
                        }
                        Spacer()
                    }
                }
            }
        }
    }
}
