import { Message, Close, Order, OrderStatus, Quote, ExchangesApi, Rfq, Parser, Exchange, OrderStatusEnum } from '@tbdex/http-server'
import type { MessageModel, MessageKind, GetExchangesFilter } from '@tbdex/http-server'
import { Postgres } from './postgres.js'
import { config } from '../config.js'
import { BalancesRepository } from './balances-repository.js'

class _ExchangeRepository implements ExchangesApi {

  async getExchanges(opts: { filter: GetExchangesFilter }): Promise<Exchange[]> {
    // TODO: try out GROUP BY! would do it now, just unsure what the return structure looks like
    const exchangeIds = opts.filter.from?.length ? opts.filter.from : []

    if (exchangeIds.length == 0) {
      return await this.getAllExchanges()
    }

    const exchanges: Exchange[] = []
    for (let id of exchangeIds) {
      console.log('calling id', id)
      // TODO: handle error property
      try {
        const exchange = await this.getExchange({ id })
        if (exchange.messages.length) exchanges.push(exchange)
        else console.error(`Could not find exchange with exchangeId ${id}`)
      } catch (err) {
        console.error(err)
      }
    }

    return exchanges
  }

  async getAllExchanges(): Promise<Exchange[]> {
    const results = await Postgres.client.selectFrom('exchange')
      .select(['message'])
      .orderBy('createdat', 'asc')
      .execute()

    return this.composeMessages(results)
  }

  async getExchange(opts: { id: string }): Promise<Exchange | undefined> {
    const results = await Postgres.client.selectFrom('exchange')
      .select(['message'])
      .where(eb => eb.and({
        exchangeid: opts.id,
      }))
      .orderBy('createdat', 'asc')
      .execute()

    const messages = await this.composeMessages(results)

    return messages[0] ?? undefined
  }

  private async composeMessages(results: { message: MessageModel }[]): Promise<Exchange[]> {
    const exchangeMap: Map<string, Exchange> = new Map()

    for (let result of results) {
      const message = await Parser.parseMessage(result.message)
      const exchangeId = message.metadata.exchangeId

      if (!exchangeMap.get(exchangeId)) {
        exchangeMap.set(exchangeId, new Exchange())
      }

      try {
        exchangeMap.get(exchangeId).addNextMessage(message)
      } catch (error) {
        console.error(`Error adding message to exchange ${exchangeId}:`, error)
      }
    }

    return Array.from(exchangeMap.values())
  }

  async getRfq(opts: { exchangeId: string }): Promise<Rfq> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'rfq' }) as Rfq
  }



  async getQuote(opts: { exchangeId: string }): Promise<Quote> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'quote' }) as Quote
  }

  async getOrder(opts: { exchangeId: string }): Promise<Order> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'order' }) as Order
  }

  async getOrderStatuses(opts: { exchangeId: string }): Promise<OrderStatus[]> {
    const results = await Postgres.client.selectFrom('exchange')
      .select(['message'])
      .where(eb => eb.and({
        exchangeid: opts.exchangeId,
        messagekind: 'orderstatus'
      }))
      .execute()

    const orderStatuses: OrderStatus[] = []

    for (let result of results) {
      const orderStatus = await Parser.parseMessage(result.message) as OrderStatus
      orderStatuses.push(orderStatus)
    }

    return orderStatuses
  }

  async getClose(opts: { exchangeId: string }): Promise<Close> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'close' }) as Close
  }

  async getMessage(opts: { exchangeId: string, messageKind: MessageKind }) {
    const result = await Postgres.client.selectFrom('exchange')
      .select(['message'])
      .where(eb => eb.and({
        exchangeid: opts.exchangeId,
        messagekind: opts.messageKind
      }))
      .limit(1)
      .executeTakeFirst()

    if (result) {
      return await Parser.parseMessage(result.message)
    }
  }


  async addMessage(opts: { message: Message }) {
    const { message } = opts
    const subject = aliceMessageKinds.has(message.kind) ? message.from : message.to

    const result = await Postgres.client.insertInto('exchange')
      .values({
        exchangeid: message.exchangeId,
        messagekind: message.kind,
        messageid: message.id,
        subject,
        message: JSON.stringify(message)
      })
      .execute()

    console.log(`Add ${message.kind} Result: ${JSON.stringify(result, null, 2)}`)

    if (message.kind == 'rfq') {
      const rfq = message as Rfq
      let quote: Quote
      if (rfq.data.payin.kind == 'STORED_BALANCE' && rfq.data.payout.kind == 'WIRE_TRANSFER') {
        quote = await this.createQuoteForWithdrawal(rfq)
      }
      if (rfq.data.payin.kind == 'WIRE_TRANSFER' && rfq.data.payout.kind == 'STORED_BALANCE') {
        quote = await this.createQuoteForDeposit(rfq)
      }
      else {
        quote = await this.createBtcToKesQuote(rfq)
      }
      this.addMessage({ message: quote as Quote})
    }

    if (message.kind == 'order') {
      let orderStatus = OrderStatus.create({
        metadata: {
          from: config.pfiDid.uri,
          to: message.from,
          exchangeId: message.exchangeId
        },
        data: {
          status: OrderStatusEnum.PayinPending
        }
      })
      await orderStatus.sign(config.pfiDid)
      this.addMessage({ message: orderStatus as OrderStatus})

      const quote = await this.getQuote({ exchangeId: message.exchangeId })
      if (quote.data.payout.currencyCode == 'STORED_BALANCE') {
        BalancesRepository.deposit(quote)
      } else if (quote.data.payin.currencyCode == 'STORED_BALANCE') {
        BalancesRepository.withdraw(quote)
      }

      await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay

      // simulate order completion
      orderStatus = OrderStatus.create({
        metadata: {
          from: config.pfiDid.uri,
          to: message.from,
          exchangeId: message.exchangeId
        },
        data: {
          status: OrderStatusEnum.PayoutSettled
        }
      })
      await orderStatus.sign(config.pfiDid)
      this.addMessage({ message: orderStatus as OrderStatus})

      // finally close the exchange
      const close = Close.create({
        metadata: {
          from: config.pfiDid.uri,
          to: message.from,
          exchangeId: message.exchangeId
        },
        data: {
          reason: 'Order fulfilled',
          success: true
        }
      })
      await close.sign(config.pfiDid)
      this.addMessage({ message: close as Close })
    }
  }


  /**
   * Creates a quote for a deposit into the PFI as a stored balance.
   */
  private async createQuoteForDeposit(rfq: Rfq) {
    const quote = Quote.create({
      metadata: {
        from: config.pfiDid.uri,
        to: rfq.from,
        exchangeId: rfq.exchangeId
      },
      data: {
        expiresAt: new Date(new Date().getTime() + 60 * 60000).toISOString(),
        payoutUnitsPerPayinUnit: '1',
        payin: {
          currencyCode: 'WIRE_TRANSFER',
          subtotal: rfq.data.payin.amount,
          total: rfq.data.payin.amount
        },
        payout: {
          currencyCode: 'STORED_BALANCE',
          subtotal: rfq.data.payin.amount,
          total: rfq.data.payin.amount
        }
      }
    })
    await quote.sign(config.pfiDid)
    return quote

  }

  /**
   * Creates a quote for a withdrawal from the PFI stored balance.
   */
  private async createQuoteForWithdrawal(rfq: Rfq) {
    const quote = Quote.create({
      metadata: {
        from: config.pfiDid.uri,
        to: rfq.from,
        exchangeId: rfq.exchangeId
      },
      data: {
        expiresAt: new Date(new Date().getTime() + 60 * 60000).toISOString(),
        payoutUnitsPerPayinUnit: '1',
        payin: {
          currencyCode: 'STORED_BALANCE',
          subtotal: rfq.data.payin.amount,
          total: rfq.data.payin.amount

        },
        payout: {
          currencyCode: 'WIRE_TRANSFER',
          subtotal: rfq.data.payin.amount,
          total: rfq.data.payin.amount
        }
      }
    })
    await quote.sign(config.pfiDid)
    return quote
  }

  /**
   * Creates a quote for a BTC to KES (Kenyan Shilling) exchange.
   */
  private async createBtcToKesQuote(rfq: Rfq) {
    const quote = Quote.create({
      metadata: {
        from: config.pfiDid.uri,
        to: rfq.from,
        exchangeId: rfq.exchangeId
      },
      data: {
        expiresAt: new Date(new Date().getTime() + 60 * 60000).toISOString(),
        payoutUnitsPerPayinUnit: '123456.789',
        payin: {
          currencyCode: 'BTC',
          subtotal: '1000.00',
          total: '1000.00'
        },
        payout: {
          currencyCode: 'KES',
          subtotal: '123456789.00',
          total: '123456789.00'
        }
      }
    })
    await quote.sign(config.pfiDid)
    return quote
  }
}

const aliceMessageKinds = new Set(['rfq', 'order'])

export const ExchangeRepository = new _ExchangeRepository()