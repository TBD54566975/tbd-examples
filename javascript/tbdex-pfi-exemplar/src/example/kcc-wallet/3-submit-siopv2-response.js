import {Jwt} from '@web5/credentials'
import {DidDht} from '@web5/dids'
import fs from 'fs'

const bearerDid = await DidDht.import({portableDid: JSON.parse(fs.readFileSync("./portable-did.json"))})
const siopv2Request = JSON.parse(process.argv[2])

const siopv2Response = {
  id_token: await Jwt.sign({
    signerDid: bearerDid,
    payload: {
      iss: bearerDid.uri,
      sub: bearerDid.uri,
      aud: siopv2Request.client_id,
      nonce: siopv2Request.nonce,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 60), // plus 30 minutes
    }
  })
}

const res = await fetch(siopv2Request.response_uri, {
  method: 'POST',
  headers: {'content-type': 'application/json'},
  body: JSON.stringify(siopv2Response)
})
const body = await res.json()

console.log(JSON.stringify(body, null, 2))
