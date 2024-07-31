import {
  TbdexHttpClient,
  Rfq,
  Quote,
  Order,
  OrderStatus,
  Close,
} from '@tbdex/http-client'
import { createOrLoadDid } from './utils.js'
import { BearerDid } from '@web5/dids'
import fs from 'fs'


// load pfiDid from pfiDid.txt
const pfiDid = fs.readFileSync('pfiDid.txt', 'utf-8').trim()

const signedCredential = fs.readFileSync('signedCredential.txt', 'utf-8').trim()

// Connect to the PFI and get the list of offerings (offerings are resources - anyone can ask for them)
const offerings = await TbdexHttpClient.getOfferings({ pfiDid: pfiDid })
console.log('got offerings:', JSON.stringify(offerings, null, 2))


// Load alice's private key to sign RFQ
const alice = await createOrLoadDid('alice.json')

const [balances] = await TbdexHttpClient.getBalances({ pfiDid: pfiDid, did: alice })
console.log('got balances:', JSON.stringify(balances, null, 2))

// lets make a deposit
let offering = offerings[1]
console.log('deposit offering', offering)
const rfq = Rfq.create({
  metadata: { from: alice.uri, to: pfiDid },
  data: {
    offeringId: offerings[1].id,
    payin: {
      kind: 'WIRE_TRANSFER',
      amount: '100.00',
      paymentDetails: {},
    },
    payout: {
      kind: 'STORED_BALANCE',
      paymentDetails: {},
    },
    claims: [signedCredential],
  },
})

await rfq.sign(alice)

try {
  await TbdexHttpClient.createExchange(rfq)
} catch (error) {
  console.log('Can\'t create:', error)
}
console.log('sent RFQ: ', JSON.stringify(rfq, null, 2))

let quote

// Wait for Quote message to appear in the exchange
while (!quote) {
  const exchange = await TbdexHttpClient.getExchange({
    pfiDid: pfiDid,
    did: alice,
    exchangeId: rfq.exchangeId
  })

  quote = exchange.find(msg => msg instanceof Quote)

  if (!quote) {
    // Wait 2 seconds before making another request
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}

//
//
// All interaction with the PFI happens in the context of an exchange.
// This is where for example a quote would show up in result to an RFQ:
const exchange = await TbdexHttpClient.getExchange({
  pfiDid: pfiDid,
  did: alice,
  exchangeId: rfq.exchangeId
})

console.log('got exchange:', JSON.stringify(exchange, null, 2))

// Place an order against that quote:
const order = Order.create({
  metadata: {
    from: alice.uri,
    to: pfiDid,
    exchangeId: quote.exchangeId
  },
})
await order.sign(alice)
await TbdexHttpClient.submitOrder(order)
console.log('Sent order: ', JSON.stringify(order, null, 2))

await pollForStatus(order, pfiDid, alice)



/*
   * This is a very simple polling function that will poll for the status of an order.
   */
async function pollForStatus(order: Order, pfiDid: string, did: BearerDid) {
  let close: Close
  while (!close) {
    const exchange = await TbdexHttpClient.getExchange({
      pfiDid: pfiDid,
      did: did,
      exchangeId: order.exchangeId
    })

    for (const message of exchange) {
      if (message instanceof OrderStatus) {
        console.log('we got a new order status')
        const orderStatus = message as OrderStatus
        console.log('orderStatus', JSON.stringify(orderStatus, null, 2))
      } else if (message instanceof Close) {
        console.log('we have a close message')
        close = message as Close
        console.log('close', JSON.stringify(close, null, 2))
        return close
      }
    }
  }
}

const [end_balances] = await TbdexHttpClient.getBalances({ pfiDid: pfiDid, did: alice })
console.log('starting balances:', JSON.stringify(balances, null, 2))
console.log('end balances:', JSON.stringify(end_balances, null, 2))

