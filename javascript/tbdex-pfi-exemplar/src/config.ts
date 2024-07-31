import type { PoolConfig } from 'pg'

import type { LogLevelDesc } from 'loglevel'
import fs from 'node:fs'

import 'dotenv/config'
import { BearerDid } from '@web5/dids'
import { createOrLoadDid } from './example/utils.js'

export type Environment = 'local' | 'staging' | 'production'
const host = process.env['HOST'] || 'http://localhost:9000'
export type Config = {
  env: Environment
  logLevel: LogLevelDesc
  host: string;
  port: number;
  db: PoolConfig
  pfiDid: BearerDid
  allowlist: string[]
}

export const config: Config = {
  env      : (process.env['ENV'] as Environment) || 'local',
  logLevel : (process.env['LOG_LEVEL'] as LogLevelDesc) || 'info',
  host: host,
  port     : parseInt(process.env['PORT'] || '9000'),
  db: {
    host     : process.env['SEC_DB_HOST'] || 'localhost',
    port     : parseInt(process.env['SEC_DB_PORT'] || '5432'),
    user     : process.env['SEC_DB_USER'] || 'postgres',
    password : process.env['SEC_DB_PASSWORD'] || 'tbd',
    database : process.env['SEC_DB_NAME'] || 'mockpfi'
  },
  pfiDid: await createOrLoadDid('pfi.json', host),
  allowlist: JSON.parse(process.env['SEC_ALLOWLISTED_DIDS'] || '[]')
}

fs.writeFileSync('pfiDid.txt', config.pfiDid.uri)





