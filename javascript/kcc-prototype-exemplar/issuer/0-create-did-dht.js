import {DidDht} from "@web5/dids"
import fs from "fs"

const bearerDid = await DidDht.create({
  options: {
    services: [
      {
        id              : 'identity-verification-1',
        type            : 'IDV',
        serviceEndpoint : 'http://localhost:3001/siopv2/auth-request',
      }
    ]
  }
})
const portableDid = await bearerDid.export()

fs.writeFileSync("./portable-did.json", JSON.stringify(portableDid, null, 2))
