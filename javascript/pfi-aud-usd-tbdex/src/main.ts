import './polyfills.js'
import { OfferingRepository } from './offerings.js'
import { Rfq, Order } from '@tbdex/http-server'
import { Quote, OrderStatus, Close, OrderStatusEnum } from '@tbdex/http-server'
import log from './logger.js'
import { config } from './config.js'
import { HttpServerShutdownHandler } from './http-shutdown-handler.js'
import { TbdexHttpServer } from '@tbdex/http-server'
import { requestCredential } from './credential-issuer.js'
import { NextFunction } from 'express-serve-static-core'
import { InMemoryExchangesApi } from './exchanges.js'

console.log('PFI DID: ', config.pfiDid.uri)

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

const ExchangeRepository = new InMemoryExchangesApi()
const httpApi = new TbdexHttpServer({
  exchangesApi: ExchangeRepository,
  offeringsApi: OfferingRepository,
  pfiDid: config.pfiDid.uri,
})

function snooper() {
  return function(req: Request, res: Response, next: NextFunction) {
    console.log('snooper' + req.url)
    return next()
  }
}
httpApi.api.use(snooper())
// TODO: Remove this when spec clarified if should post to /exchanges... or exchanges.../rfq
function redirectPostToRfq() {
  return function(req, res, next) {
    // Check if the request is a POST to /exchanges/:exchangeId
    if (req.method === 'POST' && req.url.match(/^\/exchanges\/\w+$/)) {
      // Modify the request URL to redirect to /exchanges/:exchangeId/rfq
      req.url = req.url + '/rfq'
      console.log('Redirected: ' + req.url)
    }
    // Proceed to the next middleware
    return next()
  }
}
httpApi.api.use(redirectPostToRfq())

// provide the quote
httpApi.onCreateExchange(async (ctx, rfq: Rfq) => {
  console.log('RFQ', JSON.stringify(rfq, null, 2))
  await ExchangeRepository.addMessage(rfq)
  const offering = await OfferingRepository.getOffering({
    id: rfq.data.offeringId,
  })
  // rfq.payinSubunits is USD - but as a string, convert this to a decimal and multiple but our terrible exchange rate
  // convert to a string, with 2 decimal places
  const terribleExchangeRate = 1.1
  const payout = (
    parseFloat(rfq.data.payin.amount) * terribleExchangeRate
  ).toFixed(2)

  if (
    rfq.data.payin.kind == 'CREDIT_CARD' &&
    offering.data.payin.currencyCode == 'USD' &&
    offering.data.payout.currencyCode == 'AUD'
  ) {
    const quote = Quote.create({
      metadata: {
        from: config.pfiDid.uri,
        to: rfq.from,
        exchangeId: rfq.exchangeId,
        protocol: '1.0'
      },
      data: {
        expiresAt: new Date(2028, 4, 1).toISOString(),
        payoutUnitsPerPayinUnit: terribleExchangeRate.toString(),
        payin: {
          currencyCode: 'USD',
          subtotal: rfq.data.payin.amount,
          total: rfq.data.payin.amount
        },
        payout: {
          currencyCode: 'AUD',
          subtotal: payout,
          total: payout
        },
      },
    });
    await quote.sign(config.pfiDid)
    await ExchangeRepository.addMessage(quote)
  }
})
// When the customer accepts the order
httpApi.onSubmitOrder(async (ctx, order: Order) => {
  console.log('order requested')
  await ExchangeRepository.addMessage(order)
  // first we will charge the card
  // then we will send the money to the bank account

  const quote = await ExchangeRepository.getQuote({
    exchangeId: order.exchangeId,
  })
  const rfq = await ExchangeRepository.getRfq({
    exchangeId: order.exchangeId,
  })

  const payinAmount =
    '' + Math.round(parseFloat(quote.data.payin.subtotal) * 100)

  let response = await fetch('https://test-api.pinpayments.com/1/charges', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(config.pinPaymentsKey + ':').toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: payinAmount,
      currency: 'USD',
      description: 'For remittances',
      ip_address: '203.192.1.172',
      email: 'test@testing.com',
      'card[number]': rfq.privateData.payin.paymentDetails['cc_number'],
      'card[expiry_month]': rfq.privateData.payin.paymentDetails['expiry_month'],
      'card[expiry_year]': rfq.privateData.payin.paymentDetails['expiry_year'],
      'card[cvc]': rfq.privateData.payin.paymentDetails['cvc'],
      'card[name]': rfq.privateData.payin.paymentDetails['name'],
      'card[address_line1]': 'Nunya',
      'card[address_city]': 'Bidnis',
      'card[address_country]': 'USA',
      'metadata[OrderNumber]': '123456',
      'metadata[CustomerName]': 'Roland Robot',
    }),
  })
  let data = await response.json()
  await updateOrderStatus(rfq, OrderStatusEnum.PayinPending)
  if (response.ok) {
    console.log('Charge created successfully. Token:', data.response.token)
  } else {
    console.error('Failed to create charge. Error:', data)
    await close(rfq, 'Failed to create charge.')
    return
  }

  // now transfer the the money to the bank account as AUD
  // first create a reipient and get the recipient token
  response = await fetch('https://test-api.pinpayments.com/1/recipients', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(config.pinPaymentsKey + ':').toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: 'roland@pinpayments.com',
      name: 'Mr Roland Robot',
      'bank_account[name]': rfq.privateData.payout.paymentDetails['accountName'],
      'bank_account[bsb]': rfq.privateData.payout.paymentDetails['bsbNumber'],
      'bank_account[number]':
      rfq.privateData.payout.paymentDetails['accountNumber'],
    }),
  })

  data = await response.json()
  if (data.response && data.response.token) {
    console.log('Recipient created successfully. Token:', data.response.token)
  } else {
    console.log('Unable to create recipient')
    console.log(data)
    await close(rfq, 'Failed to create recipient.')
    return
  }

  const recipientToken = data.response.token
  console.log('recipient token:', recipientToken)

  await updateOrderStatus(rfq, OrderStatusEnum.PayoutPending)
  // multiply payout by 100 for API and make it an integer
  // payout is in AUD cents
  //
  // convert quote.data.payout.total to a decimal
  const payoutAmount =
    '' + Math.round(parseFloat(quote.data.payout.total) * 100)

  response = await fetch('https://test-api.pinpayments.com/1/transfers', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' + Buffer.from(config.pinPaymentsKey + ':').toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      amount: payoutAmount,
      currency: quote.data.payout.currencyCode,
      description: 'For remittances',
      recipient: recipientToken,
    }),
  })
  data = await response.json()
  if (data.response && data.response.status == 'succeeded') {
    console.log('------>Transfer succeeded!!')
    await updateOrderStatus(rfq, OrderStatusEnum.PayoutSettled)
    await close(rfq, 'SUCCESS')
  } else {
    await updateOrderStatus(rfq, OrderStatusEnum.PayoutFailed)
    await close(rfq, 'Failed to create transfer.')
  }
  console.log('all DONE')
})
httpApi.onSubmitClose(async (ctx, close) => {
  await ExchangeRepository.addMessage(close)
})
const server = httpApi.listen(config.port, () => {
  log.info(`Mock PFI listening on port ${config.port}`)
})
httpApi.api.get('/', (req, res) => {
  res.send(
    'Please use the tbdex protocol to communicate with this server or a suitable library: https://github.com/TBD54566975/tbdex-protocol',
  )
})
// This is just for example convenience. In the real world this would be discovered by other means.
httpApi.api.get('/did', (req, res) => {
  res.send(config.pfiDid.uri)
})
// A very low fi implementation of a credential issuer - will just check they are not sanctioned.
// In the real world this would be done via OIDC4VC or similar.
// In this case a check could be done on each transaction so a VC could be optional, but it makes the example richer to have it stored in the client (html) and sent with the RFQ.
httpApi.api.get('/vc', async (req, res) => {
  const credentials = await requestCredential(
    req.query.name as string,
    req.query.country as string,
    req.query.did as string,
  )
  res.send(credentials)
})
const httpServerShutdownHandler = new HttpServerShutdownHandler(server)
function gracefulShutdown() {
  httpServerShutdownHandler.stop(async () => {
    log.info('http server stopped.')
    process.exit(0)
  })
}
async function updateOrderStatus(rfq: Rfq, status: OrderStatusEnum) {
  console.log(
    '----------->>>>>>>>>                         -------->Updating status',
    status,
  )
  const orderStatus = OrderStatus.create({
    metadata: {
      from: config.pfiDid.uri,
      to: rfq.from,
      exchangeId: rfq.exchangeId,
    },
    data: {
      status,
    },
  })
  await orderStatus.sign(config.pfiDid)
  await ExchangeRepository.addMessage(orderStatus)
}
async function close(rfq: Rfq, reason: string) {
  console.log('closing exchange ', reason)
  const close = Close.create({
    metadata: {
      from: config.pfiDid.uri,
      to: rfq.from,
      exchangeId: rfq.exchangeId,
    },
    data: {
      reason: reason,
    },
  })
  await close.sign(config.pfiDid)
  await ExchangeRepository.addMessage(close)
}
