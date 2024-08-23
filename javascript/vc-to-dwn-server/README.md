# Customer VC to DWN Server

## DIF/TBD Hackathon KCC Challege
This project implements a DWN server that facilitates the storage of Verifiable Credentials (VCs) in Decentralized Web Nodes (DWNs).

### Prerequisites

- Node.js (version 20 or higher recommended)
- npm (comes with Node.js)

### Installation

Clone the repository:
```bash
git clone https://github.com/TBD54566975/customer-vc-to-dwn
cd customer-vc-to-dwn
```

Install dependencies:
```bash
npm install
```

### Running the Server
Start the server with:
```bash
npm run start
```
The server will run on **http://localhost:5001** .

### Functionality
- Creates and manages Decentralized Identifiers (DIDs) for customer DWN
- Implements a protocol for storing and managing VCs in DWNs
- Store protocol on server
- Provides an authorization mechanism for issuers to store credentials in a customer's DWN
- Persists DIDs across server restarts


