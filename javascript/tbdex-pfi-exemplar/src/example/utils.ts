import { BearerDid, DidDht, PortableDid } from '@web5/dids'
import fs from 'fs/promises'

export async function createOrLoadDid(filename: string, serviceEndpoint: string = 'http://localhost:9000'): Promise<BearerDid> {

  // Check if the file exists
  try {
    const data = await fs.readFile(filename, 'utf-8')
    const portableDid: PortableDid = JSON.parse(data)
    const bearerDid = await DidDht.import({ portableDid })

    return bearerDid
  } catch (error) {
    // If the file doesn't exist, generate a new DID
    if (error.code === 'ENOENT') {
      const bearerDid = await DidDht.create(filename.includes('pfi') && {
        options: {
          services: [
            {
              id: 'pfi',
              type: 'PFI',
              serviceEndpoint: serviceEndpoint
            }]
        }})

      const portableDid = await bearerDid.export()

      await fs.writeFile(filename, JSON.stringify(portableDid, null, 2))
      return bearerDid
    }
    console.error('Error reading from file:', error)
  }
}