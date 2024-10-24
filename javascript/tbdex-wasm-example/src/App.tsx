import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import {
  Rfq,
  CreateRfqData,
  Quote,
  Order,
  OrderInstructions,
  Close,
  BearerDid,
  getOfferings,
  createExchange,
  submitOrder,
  getExchange,
  Exchange,
  PortableDid,
  Message,
  GetExchangeResponseBody,
} from '@tbdex/sdk';

function App() {
  const [didUri, setDidUri] = useState(
    'did:dht:ysyokwn6mxnzihgnhkkesjig8cdb3r94eq8abp3a7e935y4s3c4y'
  );
  
  const [verifiableCredential, setVerifiableCredential] = useState(
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJFZERTQSIsImtpZCI6ImRpZDpkaHQ6eXN5b2t3bjZteG56aWhnbmhra2VzamlnOGNkYjNyOTRlcThhYnAzYTdlOTM1eTRzM2M0eSMwIn0.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJpZCI6InVybjp2Yzp1dWlkOjRiOTUwOWE4LTQwMjgtNDRkOC05OGE0LWRiODg1MjhmNjY4YyIsInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJTYW5jdGlvbkNyZWRlbnRpYWwiXSwiaXNzdWVyIjoiZGlkOmRodDp5c3lva3duNm14bnppaGduaGtrZXNqaWc4Y2RiM3I5NGVxOGFicDNhN2U5MzV5NHMzYzR5IiwiaXNzdWFuY2VEYXRlIjoiMjAyNC0wNy0wMlQwNDoyNDoxNC4yNzYzMjUrMDA6MDAiLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZGh0OjFmczVobnhzZ3R4Z2RyNHd6cWkzOGNuajQ2YjF3aGhuOTRvandvNjZnOGhzYzVidDNmZ3kifX0sImlzcyI6ImRpZDpkaHQ6eXN5b2t3bjZteG56aWhnbmhra2VzamlnOGNkYjNyOTRlcThhYnAzYTdlOTM1eTRzM2M0eSIsImp0aSI6InVybjp2Yzp1dWlkOjRiOTUwOWE4LTQwMjgtNDRkOC05OGE0LWRiODg1MjhmNjY4YyIsInN1YiI6ImRpZDpkaHQ6MWZzNWhueHNndHhnZHI0d3pxaTM4Y25qNDZiMXdoaG45NG9qd282Nmc4aHNjNWJ0M2ZneSIsIm5iZiI6MTcxOTg5NDI1NCwiaWF0IjoxNzE5ODk0MjU0fQ.c4ws9jR28jElo_uaW9l5OTL-IPMx4JxWl4De7l_BTk0qNhcFlRtR-U0b9087CUOdpNu25XGZzn-R_EVImRGgCw'
  );

  const [progressMessages, setProgressMessages] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateProgress = (message: string) => {
    setProgressMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleButtonClick = async () => {
    setIsRunning(true);
    setProgressMessages([]);

    try {
      const walletPortableDid: PortableDid = {
        uri: "did:dht:1fs5hnxsgtxgdr4wzqi38cnj46b1whhn94ojwo66g8hsc5bt3fgy",
        document: {
          id: "did:dht:1fs5hnxsgtxgdr4wzqi38cnj46b1whhn94ojwo66g8hsc5bt3fgy",
          verificationMethod: [{
            id: "did:dht:1fs5hnxsgtxgdr4wzqi38cnj46b1whhn94ojwo66g8hsc5bt3fgy#0",
            type: "JsonWebKey",
            controller: "did:dht:1fs5hnxsgtxgdr4wzqi38cnj46b1whhn94ojwo66g8hsc5bt3fgy",
            publicKeyJwk: {
              crv: "Ed25519",
              kty: "OKP",
              x: "kW2-CfY0XmGTVLurk7BJ14Mqc4L-oJpD3jH5ZmwxyUw",
              kid: "ezoEr4cxqaYa9eOA3YkvCL1kw9yUuCYl3KMKO79sIbI",
              alg: "EdDSA"
            }
          }],
          authentication: [
            "did:dht:1fs5hnxsgtxgdr4wzqi38cnj46b1whhn94ojwo66g8hsc5bt3fgy#0"
          ],
          assertionMethod: [
            "did:dht:1fs5hnxsgtxgdr4wzqi38cnj46b1whhn94ojwo66g8hsc5bt3fgy#0"
          ],
          capabilityDelegation: [
            "did:dht:1fs5hnxsgtxgdr4wzqi38cnj46b1whhn94ojwo66g8hsc5bt3fgy#0"
          ],
          capabilityInvocation: [
            "did:dht:1fs5hnxsgtxgdr4wzqi38cnj46b1whhn94ojwo66g8hsc5bt3fgy#0"
          ]
        },
        privateKeys: [{
          crv: "Ed25519",
          d: "jVOdpSIN-DhddW_XVnDipukuzu6-8zieXQtkECZYJ04",
          kty: "OKP",
          x: "kW2-CfY0XmGTVLurk7BJ14Mqc4L-oJpD3jH5ZmwxyUw",
          kid: "ezoEr4cxqaYa9eOA3YkvCL1kw9yUuCYl3KMKO79sIbI",
          alg: "EdDSA"
        }]
      };

      const walletBearerDid = BearerDid.fromPortableDID(walletPortableDid);
      await runHappyPathFlow(didUri, verifiableCredential, walletBearerDid, updateProgress);
    } catch (error: any) {
      console.error("Error:", JSON.stringify(error));
      updateProgress(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="App">
      <h1>Happy Path Flow</h1>
      
      <div>
        <label>DID URI:</label>
        <input
          type="text"
          value={didUri}
          onChange={(e) => setDidUri(e.target.value)}
        />
      </div>
      
      <div>
        <label>Verifiable Credential:</label>
        <textarea
          value={verifiableCredential}
          onChange={(e) => setVerifiableCredential(e.target.value)}
          rows={5}
        />
      </div>
      
      <button onClick={handleButtonClick} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Execute Happy Path Flow'}
      </button>
      
      <div className="progress">
        <h2>Progress:</h2>
        <ul>
          {progressMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

async function runHappyPathFlow(
  pfiDidUri: string,
  verifiableCredential: string,
  walletBearerDid: BearerDid,
  updateProgress: (message: string) => void
) {
  updateProgress('~ Running Happy Path Flow ~');

  try {
    // Step 1: Fetch offerings
    updateProgress('1. Fetching offerings...');
    const offerings = await getOfferings(pfiDidUri);
    
    if (!offerings || offerings.length === 0) {
      throw new Error('No offerings available.');
    }
    
    const offeringId = offerings[0].metadata.id;
    updateProgress(`Successfully fetched offering ID: ${offeringId}`);

    // Step 2: Create exchange (RFQ)
    updateProgress('2. Creating exchange...');
    const createRfqData: CreateRfqData = {
      claims: [verifiableCredential],
      offeringId,
      payin: {
        amount: '101',
        kind: 'USD_LEDGER',
        paymentDetails: null,
      },
      payout: {
        kind: 'MOMO_MPESA',
        paymentDetails: {
          phoneNumber: '867-5309',
          reason: 'cause',
        },
      },
    };

    const rfq: Rfq = Rfq.create(pfiDidUri, walletBearerDid.did.uri, createRfqData);
    await rfq.sign(walletBearerDid);
    await rfq.verify();

    // TODO: Fix WASM black hole
    // await createExchange(rfq);
    const createExchangeRequestBody = { message: JSON.parse(rfq.toJSONString()) };
    await axios.post('http://localhost:8082/exchanges', createExchangeRequestBody);

    const exchangeId = rfq.metadata.exchangeId;
    updateProgress(`Created exchange with ID: ${exchangeId}`);

    // Step 3: Wait for Quote
    updateProgress('3. Waiting for Quote...');
    let quote: Quote | undefined;
    while (!quote) {
      await delay(500);
      const exchange = await fetchExchangeData(pfiDidUri, walletBearerDid, exchangeId);
      quote = exchange.quote;
    }
    updateProgress(`Received quote with ID: ${quote.metadata.id}`);

    // Step 4: Submit Order
    updateProgress('4. Submitting order...');
    const order = Order.create(pfiDidUri, walletBearerDid.did.uri, exchangeId);
    await order.sign(walletBearerDid);
    await order.verify();
    
    const submitOrderRequestBody = { message: JSON.parse(order.toJSONString()) };

    // TODO: Fix WASM black hole
    // await submitOrder(order);
    await axios.put(`http://localhost:8082/exchanges/${exchangeId}`, submitOrderRequestBody);
    updateProgress(`Order submitted with ID: ${order.metadata.id}`);

    // Step 5: Wait for Order Instructions
    updateProgress('5. Waiting for Order Instructions...');
    let orderInstructions: OrderInstructions | undefined;
    while (!orderInstructions) {
      await delay(500);
      const exchange = await fetchExchangeData(pfiDidUri, walletBearerDid, exchangeId);
      orderInstructions = exchange.orderInstructions;
    }
    updateProgress(`Received order instructions with ID: ${orderInstructions.metadata.id}`);

    // Step 6: Wait for Order Status: PAYOUT_SETTLED
    updateProgress('6. Waiting for Order Status: PAYOUT_SETTLED...');
    let payoutSettled = false;
    while (!payoutSettled) {
      await delay(500);
      const exchange = await fetchExchangeData(pfiDidUri, walletBearerDid, exchangeId);
      const orderStatuses = exchange.orderStatuses || [];

      for (const orderStatus of orderStatuses) {
        if (orderStatus.data.status === 'PAYOUT_SETTLED') {
          payoutSettled = true;
          break;
        }
      }
    }
    updateProgress('Order status PAYOUT_SETTLED confirmed.');

    // Step 7: Wait for Close
    updateProgress('7. Waiting for Close...');
    let close: Close | undefined;
    while (!close) {
      await delay(500);
      const exchange = await fetchExchangeData(pfiDidUri, walletBearerDid, exchangeId);
      close = exchange.close;
    }

    updateProgress(`Exchange closed with ID: ${close.metadata.id}, Success: ${close.data.success}`);
    updateProgress('Exchange completed successfully!');
  } catch (error: any) {
    updateProgress(`Error during Happy Path Flow: ${error.message}`);
    throw error;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchExchangeData(
  pfiDidUri: string,
  walletBearerDid: BearerDid,
  exchangeId: string
): Promise<Exchange> {
  try {
    const exchange = await getExchange(pfiDidUri, walletBearerDid, exchangeId);
    return exchange as Exchange;
  } catch (error) {
    console.error('Error fetching exchange data:', error);
    throw error;
  }
}

export default App;