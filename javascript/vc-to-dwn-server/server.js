import express from 'express';
import { Web5 } from '@web5/api';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors';
import { webcrypto } from "node:crypto";

// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const app = express();
const port = 5001;

// File to store and persist customer DID
const DID_FILE = path.join(process.cwd(), 'did.json');

let did;
let web5;

// Protocol Definition
const vcProtocolDefinition = {
    protocol: 'https://vc-to-dwn.tbddev.org/vc-protocol',
    published: true,
    types: {
        credential: {
            schema: "https://vc-to-dwn.tbddev.org/vc-protocol/schema/credential",
            dataFormats: ['application/vc+jwt']
        },
        issuer: {
            schema: "https://vc-to-dwn.tbddev.org/vc-protocol/schema/issuer",
            dataFormats: ['text/plain']
        },
        judge: {
            schema: "https://vc-to-dwn.tbddev.org/vc-protocol/schema/judge",
            dataFormats: ['text/plain']
        }
    },
    structure: {
        issuer: {
            $role: true,
        },
        judge: {
            $role: true,
        },
        credential: {
            $actions: [
                {
                    role: 'issuer',
                    can: ['create']
                },
                {
                    role: 'judge',
                    can: ['query', 'read']
                },
            ],
        }
    }
};

// does protocol exist already? 
const queryProtocol = async (web5, did = null) => {
    const message = {
        filter: {
            protocol: vcProtocolDefinition.protocol,
        },
    };

    return did
        ? await web5.dwn.protocols.query({ from: did, message })
        : await web5.dwn.protocols.query({ message });
};

// install protocol
const installProtocol = async (web5) => {
    const { protocol, status } = await web5.dwn.protocols.configure({
        message: {
            definition: vcProtocolDefinition,
        },
    });
    console.log("Protocol installed locally", status);
    return { protocol, status };
};


const configureProtocol = async (web5, did) => {
    console.log('Configuring protocol...');

    const { protocols: localProtocol, status: localStatus } = await queryProtocol(web5);
    console.log('Local protocol:', localStatus.code === 202 ? 'Found' : 'Not found');
    // if protocol is not found on DWN then install it on local DWN and remote DWN.
    if (localStatus.code !== 202 || localProtocol.length === 0) {
        const { protocol } = await installProtocol(web5);
        const sendStatus = await protocol.send(did);
        console.log("Installing protocol on remote DWN", sendStatus);
    } else {
        console.log("Protocol already installed");
    }
};


async function loadOrCreateDID() {
    try {
        const data = await fs.readFile(DID_FILE, 'utf8');
        const savedData = JSON.parse(data);
        did = savedData.did;
        console.log('Loaded existing DID:', did);

        // Ensure to connect using the existing DID
        const { web5: existingWeb5 } = await Web5.connect({
            connectedDid: did,
            password: 'placeholder-password',
            didCreateOptions: {
                dwnEndpoints: ['https://dwn.gcda.xyz']
              },
              registration: {
                onSuccess: () => {
                 console.log('Registration successful')
                },
                onFailure: (error) => {
                    console.error('Registration failed', error)
                },
              },
        });

        web5 = existingWeb5;

    } catch (error) {
        console.log(error);
        console.log('Creating new DID...');
        const { web5: newWeb5, did: newDID } = await Web5.connect({
            password: 'placeholder-password',
            didCreateOptions: {
                dwnEndpoints: ['https://dwn.gcda.xyz']
              },
              registration: {
                onSuccess: () => {
                 console.log('Registration successful')
                },
                onFailure: (error) => {
                    console.error('Registration failed', error)
                },
              },
        });
        web5 = newWeb5;
        did = newDID;

        // Store the new DID to file to persist DID
        await fs.writeFile(DID_FILE, JSON.stringify({ did }), 'utf8');
        console.log('New DID created and saved:', did);
    }
    return { web5, did };
}

const createRoleRecord = async (web5, roleDid, roleType) => {
    console.log(`Attempting to authorize ${roleDid} to store credential in Customer's DWN as a ${roleType}`);
    try {
        const { record, status } = await web5.dwn.records.create({
            message: {
                dataFormat: 'text/plain',
                protocol: vcProtocolDefinition.protocol,
                protocolPath: roleType,
                schema: vcProtocolDefinition.types[roleType].schema,
                recipient: roleDid,
            },
        });

        if (status.code === 404) {
            // Handle the 404 status explicitly
            console.error(`Error during role record creation for ${roleDid} as a ${roleType}: ${status}`);
            throw new Error(`Error during role record creation for ${roleDid} as a ${roleType}: ${status}`);
        }

        const { status: recordSendStatus } = await record.send(did);
        console.log(`Granted ${roleDid} authorization to the Customer's local DWN as a ${roleType}:`, status);
        console.log(`Role record sent to Customer's remote DWN with status:`, recordSendStatus);
        return { record, status };
    } catch (error) {
        console.error(`Error during role record creation for ${roleDid} as a ${roleType}:`, error);
        throw error;
    }
};

// Route to authorize an issuer to store a credential in the Customer's DWN
app.get('/authorize', async (req, res) => {
    const { issuerDid } = req.query;

    if (!issuerDid) {
        return res.status(400).json({
            error: 'issuerDid is required as a query parameter',
            hint: 'Please provide issuerDid in the query string, e.g., /authorize?issuerDid=did:example:1234'
        });
    }

    console.log('Received issuerDidURI:', issuerDid);

    try {
        // First, check if the issuer already has a record
        const currentRecords = await web5.dwn.records.query({
            message: {
                filter: {
                    recipient: issuerDid,
                },
            },
        });

        if (currentRecords.records.length > 0) {
            // If the record already exists, return an appropriate message
            return res.json({
                message: "Authorization already exists for this issuer.",
                status: currentRecords.status
            });
        }

        // If no record exists, create a new role record for the issuer
        console.log(`No existing authorization found for ${issuerDid}. Creating a new role to grant auth...`);
        const { record, status } = await createRoleRecord(web5, issuerDid, 'issuer');

        console.log(`Role created to grant ${issuerDid} authorization with status:`, status);

        // Return the result of the role record creation
        return res.json({
            message: `Granted ${issuerDid} authorization to store a credential in the Customer's DWN:.`,
            status
        });

    } catch (error) {
        console.error(`Failed to process issuerDid ${issuerDid}:`, error);
        return res.status(500).json({
            error: 'Failed to process issuer DID.',
            details: error.message,
        });
    }
});

app.get('/authorize-judge', async (req, res) => {
    const { judgeDid } = req.query;

    if (!judgeDid) {
        return res.status(400).json({
            error: 'judgeDid is required as a query parameter',
            hint: 'Please provide judgeDid in the query string, e.g., /authorize-judge?judgeDid=did:example:1234'
        });
    }

    console.log('Received judgeDidUri:', judgeDid);

    try {
        // First, check if the issuer already has a record
        const currentRecords = await web5.dwn.records.query({
            message: {
                filter: {
                    recipient: judgeDid,
                },
            },
        });

        if (currentRecords.records.length > 0) {
            // If the record already exists, return an appropriate message
            return res.json({
                message: "Authorization already exists for this issuer.",
                status: currentRecords.status
            });
        }

        // If no record exists, create a new role record for the judge
        console.log(`No existing authorization found for ${judgeDid}. Creating a new role to grant auth...`);
        const { record, status } = await createRoleRecord(web5, judgeDid, 'judge');

        console.log(`Role created to grant ${judgeDid} authorization with status:`, status);

        // Return the result of the role record creation
        return res.json({
            message: `Granted ${judgeDid} authorization to store a credential in the Customer's DWN:.`,
            status
        });

    } catch (error) {
        console.error(`Failed to process judgeDid ${judgeDid}:`, error);
        return res.status(500).json({
            error: 'Failed to process issuer DID.',
            details: error.message,
        });
    }
});



app.get('/', (req, res) => {
    res.status(200).send(`
        <h1>Welcome to the Customer's DWN Server</h1>
        <p>Your goal is to store a Known Customer Credential(KCC) in the Customer's DWN</p>
        <p>The Customer's DID is: ${did}</p>
        <p>Use the following links to help you access data:</p>
        <ul>
            <li><a href="/vc-protocol">View the protocol definition</a></li>
            <li><a href="/authorize">Authorize an issuer</a></li>
        </ul>
    `);
});

// Route to serve the pretty-printed protocol definition
app.get('/vc-protocol', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(vcProtocolDefinition, null, 2));
});

async function initializeServer() {
    try {
        const { web5: loadedWeb5, did: loadedDid } = await loadOrCreateDID();
        web5 = loadedWeb5;
        did = loadedDid;
        await configureProtocol(web5, did);
        console.log('Server initialization complete');

    } catch (error) {
        console.error('Error initializing server:', error);
        process.exit(1);
    }
}

// Initialize server on startup
initializeServer();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.set('json spaces', 2)