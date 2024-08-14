import {DidDht} from '@web5/dids'
import fs from 'fs'

const credentialOffer = JSON.parse(process.argv[2])
const authorizationServerMetadata = JSON.parse(process.argv[3])
const bearerDid = await DidDht.import({portableDid: JSON.parse(fs.readFileSync("./portable-did.json"))})

const tokenRequest = {
  grant_type: 'urn:ietf:params:oauth:grant-type:pre-authorized_code',
  'pre-authorized_code': credentialOffer.grants['urn:ietf:params:oauth:grant-type:pre-authorized_code']['pre-authorized_code'],
  client_id: bearerDid.uri
}

const res = await fetch(authorizationServerMetadata.token_endpoint, {
  method: 'POST',
  headers: {'content-type': 'application/json'},
  body: JSON.stringify(tokenRequest)
})
const body = await res.json()

console.log(JSON.stringify(body, null, 2))
