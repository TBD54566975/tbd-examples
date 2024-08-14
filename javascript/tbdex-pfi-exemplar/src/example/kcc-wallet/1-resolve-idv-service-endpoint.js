import {DidDht} from '@web5/dids'

const didUri = process.argv[2]

const resolution = await DidDht.resolve(didUri)
if (resolution.didResolutionMetadata.error) {
  console.error(`Resolution failed ${JSON.stringify(resolution.didResolutionMetadata, null, 2)}`)
  process.exit(1)
}

const idvService = resolution.didDocument.service.find(x => x.type === "IDV")
console.log(idvService.serviceEndpoint)
