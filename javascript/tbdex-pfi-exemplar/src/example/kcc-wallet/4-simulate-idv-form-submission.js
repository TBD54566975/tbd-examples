import {DidDht} from '@web5/dids'
import fs from 'fs'

// this script simulates the user going to the HTML form page and submitting their PIIimport {Jwt} from '@web5/credentials'

const idvFormURL = process.argv[2]

const bearerDid = await DidDht.import({portableDid: JSON.parse(fs.readFileSync("./portable-did.json"))})

await fetch(idvFormURL, {
  method: 'POST',
  headers: {'content-type': 'application/json'},
  body: JSON.stringify({
    didUri: bearerDid.uri,
    firstName: 'Joe',
    lastName: 'Shmoe',
    veryPrivateDataBeCareful: 'tractor123'
  })
})
