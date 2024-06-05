import type { Database } from './types.js' // this is the Database interface we defined earlier

import log from '../logger.js'

import { Kysely, PostgresDialect } from 'kysely'
import { config } from '../config.js'
import pg from 'pg'

export class PostgresClient {
  pool: pg.Pool
  client: Kysely<Database>

  /**
   * establishes connection to mysql if not already connected
   */
  connect() {
    if (this.pool === undefined) {
      this.pool = new pg.Pool(config.db)

      const dialect = new PostgresDialect({ pool: this.pool })
      this.client = new Kysely<Database>({ dialect, log: ['query'] })
    }
  }

  /**
     * pings mysql to test connection
     */
  // async ping() {
  //   return new Promise<void>((resolve, reject) => {
  //     log.info('connecting to posgres..')

  //     this.pool.getConnection((err, conn) => {
  //       if (err) {
  //         return reject(err)
  //       }

  //       log.info('mysql connection established! pinging mysql...')

  //       conn.query('select 1+1 as test', (err) => {
  //         if (err) {
  //           return reject(err)
  //         } else {
  //           log.info('pong!')
  //           return resolve()
  //         }
  //       })
  //     })
  //   })
  // }
  /**
     * closes all connections to mysql
     */
  close() {
    return new Promise<void>(resolve => {
      // no-op if not connected
      if (!this.pool) {
        return resolve()
      }

      this.pool.end(() => {
        this.pool = undefined
        this.client = undefined

        return resolve()
      })
    })
  }

  /**
     * clears all tables
     */
  async clear() {
    await this.client.deleteFrom('exchange').execute()
    await this.client.deleteFrom('offering').execute()
  }
}

export const Postgres = new PostgresClient()