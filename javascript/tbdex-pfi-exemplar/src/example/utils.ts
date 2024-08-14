import { BearerDid, DidDht, PortableDid } from '@web5/dids'
import fs from 'fs/promises'

export async function createOrLoadDid(filename: string, serviceEndpoint: string = 'http://localhost:9000'): Promise<BearerDid> {

  try {
    // Attempt to read the existing DID from the file
    const data = await fs.readFile(filename, 'utf-8')
    const portableDid: PortableDid = JSON.parse(data)
    const bearerDid = await DidDht.import({ portableDid })

    return bearerDid

  } catch (error) {
    // If the file doesn't exist, create a new DID
    if (error.code === 'ENOENT') {
      const services = []

      // Include PFI service if filename includes 'pfi'
      if (filename.includes('pfi')) {
        services.push({
          id: 'pfi',
          type: 'PFI',
          serviceEndpoint: serviceEndpoint,
        })
      }

      // Include IDV service if filename includes 'issuer'
      if (filename.includes('issuer')) {
        services.push({
          id: 'identity-verification-1',
          type: 'IDV',
          serviceEndpoint: 'http://localhost:3001/siopv2/auth-request',
        })
      }

      const options = services.length > 0 ? { options: { services } } : undefined
      const bearerDid = await DidDht.create(options)

      const portableDid = await bearerDid.export()
      await fs.writeFile(filename, JSON.stringify(portableDid, null, 2))

      return bearerDid

    } else {
      // Handle any other errors
      console.error('Error reading from file:', error)
    }
  }
}
