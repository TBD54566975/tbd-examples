import {DidDht} from '@web5/dids'
import fs from 'fs'
import { Jwt } from '@web5/credentials'

const issuerDidURi = process.argv[2]
const credentialIssuerMetadata = JSON.parse(process.argv[3])
const accessTokenResponse = JSON.parse(process.argv[4])
const bearerDid = await DidDht.import({portableDid: JSON.parse(fs.readFileSync("./portable-did.json"))})

const claims = {
  iss: bearerDid.uri,
  aud: issuerDidURi,
  iat: Math.floor(Date.now() / 1000),
  nonce: accessTokenResponse.c_nonce
}
// TODO the JWS 'typ' header won't be properly set
const proofJwt = await Jwt.sign({signerDid: bearerDid, payload: claims})

const res = await fetch(credentialIssuerMetadata.credential_endpoint, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'authorization': `Bearer ${accessTokenResponse.access_token}`
  },
  body: JSON.stringify({
    format: 'jwt_vc_json',
    proof: {
      proof_type: 'jwt',
      jwt: proofJwt
    }
  })
})
const body = await res.json()

console.log(JSON.stringify(body, null, 2) + '\n')

const {payload} = await Jwt.verify({jwt: body.credential})
console.log(JSON.stringify(payload.vc, null, 2))
