import type { Database } from './types.js'
import * as mysql2 from 'mysql2'

import log from '../logger.js'
import { Kysely, MysqlDialect } from 'kysely'
import { config } from '../config.js'

// export class MysqlClient {
//   pool: mysql2.Pool
//   client: Kysely<Database>

//   constructor() {
//     this.connect()
//   }

//   /**
//    * establishes connection to mysql if not already connected
//    */
//   connect() {
//     if (this.pool === undefined) {
//       this.pool = mysql2.createPool(config.db)

//       const dialect = new MysqlDialect({ pool: this.pool })
//       this.client = new Kysely<Database>({ dialect, log: ['query'] })
//     }
//   }

//   /**
//    * pings mysql to test connection
//    */
//   async ping() {
//     return new Promise<void>((resolve, reject) => {
//       log.info('connecting to mysql..')

//       this.pool.getConnection((err, conn) => {
//         if (err) {
//           return reject(err)
//         }

//         log.info('mysql connection established! pinging mysql...')

//         conn.query('select 1+1 as test', (err) => {
//           if (err) {
//             return reject(err)
//           } else {
//             log.info('pong!')
//             return resolve()
//           }
//         })
//       })
//     })
//   }
//   /**
//    * closes all connections to mysql
//    */
//   close() {
//     return new Promise<void>(resolve => {
//       // no-op if not connected
//       if (!this.pool) {
//         return resolve()
//       }

//       this.pool.end(() => {
//         this.pool = undefined
//         this.client = undefined

//         return resolve()
//       })
//     })
//   }

//   /**
//    * clears all tables
//    */
//   async clear() {
//     await this.client.deleteFrom('Exchange').execute()
//     await this.client.deleteFrom('Offering').execute()
//   }
// }

// export const Mysql = new MysqlClient()