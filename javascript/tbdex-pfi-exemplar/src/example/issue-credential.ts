import { BearerDid } from '@web5/dids'
import { createOrLoadDid } from './utils.js'
import { VerifiableCredential } from '@web5/credentials'
import fs from 'fs'

// get the did from the command line parameter or load from aliceDid.txt
const customerDid = process.argv[2] || fs.readFileSync('aliceDid.txt', 'utf-8').trim()

const issuer : BearerDid = await createOrLoadDid('issuer.json')

//
// At this point we can check if the user is sanctioned or not and decide to issue the credential.
// (ssh... ok lets just say we did and continue on....)
//

//
// Create a sanctions credential so that the PFI knows that Alice is legit.
//
const vc = await VerifiableCredential.create({
  type    : 'SanctionCredential',
  issuer  : issuer.uri,
  subject : customerDid,
  data    : {
    'beep': 'boop'
  }
})

const vcJwt = await vc.sign({ did: issuer})

console.log('The verifiable credential:\n\n', vcJwt)
// write credential to file

console.log('\n\nThis has been written to signedCredential.txt')
fs.writeFileSync('signedCredential.txt', vcJwt)



