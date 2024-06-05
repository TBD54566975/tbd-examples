import type { LogLevelDesc } from 'loglevel'
import fs from 'fs/promises'

import 'dotenv/config'

import { BearerDid, DidDht, PortableDid } from '@web5/dids'


export type Environment = 'local' | 'staging' | 'production'

export type Config = {
  env: Environment;
  logLevel: LogLevelDesc;
  host: string;
  port: number;
  pfiDid: BearerDid;
  allowlist: string[];
  pinPaymentsKey: string;
}

export const config: Config = {
  env: (process.env['ENV'] as Environment) || 'local',
  logLevel: (process.env['LOG_LEVEL'] as LogLevelDesc) || 'info',
  host: process.env['HOST'] || 'http://localhost:9000',
  port: parseInt(process.env['PORT'] || '9000'),
  pfiDid: await createOrLoadDid('pfi.json'),
  pinPaymentsKey: process.env['SEC_PIN_PAYMENTS_SECRET_KEY'],
  allowlist: JSON.parse(process.env['SEC_ALLOWLISTED_DIDS'] || '[]'),
}




async function createOrLoadDid(filename: string): Promise<BearerDid> {

    console.log('Creating new did for server...')
    const bearerDid = await DidDht.create({
      options: {
        services: [
          {
            id: 'pfi',
            type: 'PFI',
            serviceEndpoint: process.env['HOST'] || 'http://localhost:9000',
          },
        ],
      },
    })
    const portableDid = await bearerDid.export()
    await fs.writeFile(filename, JSON.stringify(portableDid, null, 2))
    return bearerDid
  
}