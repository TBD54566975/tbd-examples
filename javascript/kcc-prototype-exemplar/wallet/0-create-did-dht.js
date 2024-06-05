import {DidDht} from "@web5/dids"
import fs from "fs"

const bearerDid = await DidDht.create()
const portableDid = await bearerDid.export()

fs.writeFileSync("./portable-did.json", JSON.stringify(portableDid, null, 2))
