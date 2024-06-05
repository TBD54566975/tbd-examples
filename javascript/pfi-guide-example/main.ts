import './polyfills.js'
import './seed-offerings.js'

import type { Rfq, Order, Close } from '@tbdex/http-server'

import log from './logger.js'
import { config } from './config.js'
import { ExchangeApiProvider, OfferingApiProvider } from './api/index.js'
import { HttpServerShutdownHandler } from './http-shutdown-handler.js'
import { TbdexHttpServer } from '@tbdex/http-server'

// Housekeeping for the server

process.on('unhandledRejection', (reason: any, promise) => {
    log.error(`Unhandled promise rejection. Reason: ${reason}. Promise: ${JSON.stringify(promise)}. Stack: ${reason.stack}`)
})
  
process.on('uncaughtException', err => {
    log.error('Uncaught exception:', (err.stack || err))
})
  
// triggered by ctrl+c with no traps in between
process.on('SIGINT', async () => {
    log.info('exit signal received [SIGINT]. starting graceful shutdown')

    gracefulShutdown()
})
  
// triggered by docker, tiny etc.
process.on('SIGTERM', async () => {
    log.info('exit signal received [SIGTERM]. starting graceful shutdown')

    gracefulShutdown()
})

// Set up TbdexHttpServer to be configured to handel ExchangesApi and OfferingApi Messages

const httpApi = new TbdexHttpServer({ exchangesApi: ExchangeApiProvider, offeringsApi: OfferingApiProvider })

httpApi.submit('rfq', async (ctx, rfq) => {
  await ExchangeApiProvider.addMessage({ message: rfq as Rfq })
})

httpApi.submit('order', async (ctx, order) => {
  await ExchangeApiProvider.addMessage({ message: order as Order })
})

httpApi.submit('close', async (ctx, close) => {
  await ExchangeApiProvider.addMessage({ message: close as Close })
})

const server = httpApi.listen(config.port, () => {
  log.info(`Mock PFI listening on port ${config.port}`)
})

console.log('PFI DID: ', config.did.id)
console.log('PFI DID KEY: ', JSON.stringify(config.did.privateKey))
console.log('PFI KID: ', config.did.kid)

httpApi.api.get('/', (req, res) => {
  res.send('Please use the tbdex protocol to communicate with this server or a suitable library: https://github.com/TBD54566975/tbdex-protocol')
})

const httpServerShutdownHandler = new HttpServerShutdownHandler(server)


function gracefulShutdown() {
  httpServerShutdownHandler.stop(async () => {
    process.exit(0)
  })
}