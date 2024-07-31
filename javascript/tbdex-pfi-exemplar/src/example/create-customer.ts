import { createOrLoadDid } from './utils.js'
import fs from 'fs'
//
// Create a did for Alice, who is the customer of the PFI in this case.
//

// this will effectively be alices wallet:
const alice = await createOrLoadDid('alice.json')

// write did to aliceDid.txt
console.log('DID for alice:', alice.uri)
fs.writeFileSync('aliceDid.txt', alice.uri)