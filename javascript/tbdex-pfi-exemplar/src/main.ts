import './polyfills.js'

import type { Rfq, Order, Close } from '@tbdex/http-server'

import log from './logger.js'
import { config } from './config.js'
import {
  Postgres,
  ExchangeRepository,
  OfferingRepository,
  BalancesRepository,
} from './db/index.js'
import { HttpServerShutdownHandler } from './http-shutdown-handler.js'
import { TbdexHttpServer } from '@tbdex/http-server'
import { DidDht } from '@web5/dids'
import { BearerDid } from '@web5/dids'
import { createOrLoadDid } from './example/utils.js'
import { VerifiableCredential } from '@web5/credentials'

await Postgres.connect()

/**
 * Republish the server DID to ensure it is fresh
 */
async function republish() {
  await DidDht.publish({'did': config.pfiDid})
  console.log('republished PFI DID')
}
republish()

// and it may be a good idea to republish the server DID every hour
setInterval(republish, 3600000)



process.on('unhandledRejection', (reason: any, promise) => {
  log.error(
    `Unhandled promise rejection. Reason: ${reason}. Promise: ${JSON.stringify(promise)}. Stack: ${reason.stack}`,
  )
})

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception:', err.stack || err)
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

const httpApi = new TbdexHttpServer({
  exchangesApi: ExchangeRepository,
  offeringsApi: OfferingRepository,
  balancesApi: BalancesRepository,
  pfiDid: config.pfiDid.uri,
})

httpApi.onCreateExchange(async (ctx, rfq) => {
  await ExchangeRepository.addMessage({ message: rfq as Rfq })
})

httpApi.onSubmitOrder(async (ctx, order) => {
  await ExchangeRepository.addMessage({ message: order as Order })
})

httpApi.onSubmitClose(async (ctx, close) => {
  await ExchangeRepository.addMessage({ message: close as Close })
})

httpApi.api.post('/get-vc', async function(req, res) {
  const issuer : BearerDid = await createOrLoadDid('issuer.json')

  // Create a sanctions credential so that the PFI knows that Alice is legit.
  const vc = await VerifiableCredential.create({
    type    : 'SanctionCredential',
    issuer  : issuer.uri,
    subject : req.body.did,
    data    : {
      'beep': 'boop'
    }
  })

  const vcJwt = await vc.sign({ did: issuer})
  res.send(vcJwt)
})

const server = httpApi.listen(config.port, () => {
  log.info(`Mock PFI listening on port ${config.port}`)
})

console.log('PFI DID FROM SERVER: ', config.pfiDid.uri)

httpApi.api.get('/', (req, res) => {
  res.send(
    'Please use the tbdex protocol to communicate with this server or a suitable library: https://github.com/TBD54566975/tbdex-protocol',
  )
})

const httpServerShutdownHandler = new HttpServerShutdownHandler(server)

function gracefulShutdown() {
  httpServerShutdownHandler.stop(async () => {
    log.info('http server stopped.')

    log.info('closing Postgres connections')
    await Postgres.close()

    process.exit(0)
  })
}
