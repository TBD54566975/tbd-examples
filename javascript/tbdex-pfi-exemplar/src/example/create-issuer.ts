import { createOrLoadDid } from './utils.js'
import fs from 'fs'
//
// We need to create an issuer, which will issue VCs to the customer, and is trusted by the PFI.
//
const issuer = await createOrLoadDid('issuer.json')


console.log('\nIssuer did:', issuer.uri)
// write issuer.uri to issuer.txt
fs.writeFileSync('issuerDid.txt', issuer.uri)

console.log(`

now run:

> npm run seed-offerings 

to seed the PFI with the list of offerings along with this sanctions issuer did.

This will ensure that the PFI will trust SanctionsCredentials issued by this issuer for RFQs against those offerings.
`)




