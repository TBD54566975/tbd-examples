import Foundation
import TypeID
import tbDEX
import Web5


// Creates or loads a `BearerDID` from disk
func createOrLoadDid() throws -> BearerDID {
    let userDefaultsKey = "did"

    if let existingDIDData = UserDefaults.standard.value(forKey: userDefaultsKey) as? Data,
       let portableDID = try? JSONDecoder().decode(PortableDID.self, from: existingDIDData) {
        // Existing DID exists on disk, use it
        let did = try DIDJWK.import(portableDID: portableDID)

        // Print it to console
        print("Loaded DID: \(did.uri)")

        return did
    } else {
        // Create a new DID
        let did = try DIDJWK.create(
            keyManager: InMemoryKeyManager(),
            options: .init(algorithm: .ed25519)
        )

        // Save it to disk
        let portableDID = try did.export()
        UserDefaults.standard.setValue(try JSONEncoder().encode(portableDID), forKey: userDefaultsKey)

        // Print it to console
        print("Created DID: \(did.uri)")

        return did
    }
}

/// Fetches offerings from the PFI
func getOfferings() async throws -> [Offering] {
    return try await tbDEXHttpClient.getOfferings(pfiDIDURI: pfiDIDURI)
}

/// Run an example exchange between the client and PFI
func exampleExchange(offering: Offering, did: BearerDID) async throws {
    print("Creating RFQ...")

    // Create an RFQ
    var rfq = try RFQ(
        to: offering.metadata.from,
        from: did.uri,
        data: .init(
            offeringId: offering.metadata.id,
            payin: .init(
                amount: "1.00",
                kind: "USD_LEDGER"
            ),
            payout: .init(
                kind: "MOMO_MPESA",
                paymentDetails: [
                    "phoneNumber": "1234567890",
                    "reason": "just cause"
                ]
            ),
            claims: [claim]
        )
    )

    // exchangeID is set by the first message in an exchange, which is the RFQ in this case (Offering is a Resource,
    // which is why we do not use that ID).
    let exchangeID = rfq.metadata.id.rawValue

    // Sign the RFQ
    try rfq.sign(did: did)

    // Send the RFQ
    try await tbDEXHttpClient.createExchange(rfq: rfq)

    print("Sent RFQ, waiting for Quote")

    // Poll exchanges every 1 second to check for a Quote
    var quote: Quote!
    while quote == nil {
        let exchanges = try await tbDEXHttpClient.getExchanges(pfiDIDURI: pfiDIDURI, requesterDID: did)
        for exchange in exchanges {
            guard let lastMessageInExchange = exchange.last else { continue }

            if case .quote(let q) = lastMessageInExchange, q.metadata.exchangeID == exchangeID {
                quote = q
                break
            }
        }

        if quote == nil {
            print("No Quote yet, sleeping for 1 second")
            try await Task.sleep(nanoseconds: 1_000_000_000)
        }
    }

    print("Got Quote! Making Order")

    // Got the Quote, now make an Order out of it
    var order = Order(
        from: did.uri,
        to: pfiDIDURI,
        exchangeID: exchangeID,
        data: .init()
    )

    // Sign the Order
    try order.sign(did: did)

    // Send the Order
    try await tbDEXHttpClient.submitOrder(order: order)

    print("Sent Order, waiting for Close")

    // Poll exchanges every 1 second to check for an Close
    var close: Close!
    while close == nil {
        let exchanges = try await tbDEXHttpClient.getExchanges(pfiDIDURI: pfiDIDURI, requesterDID: did)
        for exchange in exchanges {
            guard let lastMessageInExchange = exchange.last else { continue }

            switch lastMessageInExchange {
            case .orderStatus(let o):
                if o.metadata.exchangeID == exchangeID {
                    print("Order Status: \(o.data.orderStatus)")
                }
            case .close(let c):
                if c.metadata.exchangeID == exchangeID {
                    close = c
                }
            default:
                // We only care for OrderStatus and Close, ignore the rest
                continue
            }
        }

        if close == nil {
            print("No Close yet, sleeping for 1 second")
            try await Task.sleep(nanoseconds: 1_000_000_000)
        }
    }

    print("Exchange Closed! Reason: \(close.data.reason ?? "No reason provided")")
}
