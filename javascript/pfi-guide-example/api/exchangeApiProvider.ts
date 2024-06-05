import { Close, MessageKind, MessageKindClass, Order, OrderStatus, Quote, ExchangesApi, Rfq, GetExchangesFilter, MessageModel } from '@tbdex/http-server'
import { Message } from '@tbdex/http-server'

import { dataProvider } from './util/dataProvider.js'
import { config } from '../config.js'

class _ExchangeApiProvider implements ExchangesApi {

  async getExchanges(opts: { filter: GetExchangesFilter }): Promise<MessageKindClass[][]> {
    
  }

  async getAllExchanges(): Promise<MessageKindClass[][]> {
    
  }

  async getExchange(opts: { id: string }): Promise<MessageKindClass[]> {
    
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
    
  }

  async getClose(opts: { exchangeId: string }): Promise<Close> {
    return await this.getMessage({ exchangeId: opts.exchangeId, messageKind: 'order' }) as Close
  }

  async getMessage(opts: { exchangeId: string, messageKind: MessageKind }) {
    const result = await dataProvider.queryForMessage('exchange', opts.exchangeId, opts.messageKind);

    if (result) {
      return Message.fromJson(result.message)
    }
  }

  async addMessage(opts: { message: MessageKindClass }) {
    const { message } = opts
    const subject = aliceMessageKinds.has(message.kind) ? message.from : message.to

    const result = await dataProvider.insert(
        'exchange',
      {
        exchangeid: message.exchangeId,
        messagekind: message.kind,
        messageid: message.id,
        subject,
        message: JSON.stringify(message)
      });

    if (message.kind == 'rfq') {
      const quote = Quote.create(
        {
          metadata: {
            from: config.did.id,
            to: message.from,
            exchangeId: message.exchangeId
          },
          data: {
            expiresAt: new Date(2024, 4, 1).toISOString(),
            payin: {
              currencyCode: 'BTC',
              amountSubunits: '1000'
            },
            payout: {
              currencyCode: 'KES',
              amountSubunits: '123456789'
            }
          }
        }
      )
      await quote.sign(config.did.privateKey, config.did.kid)
      this.addMessage({ message: quote as Quote})
    }

    if (message.kind == 'order') {
      const orderStatus = OrderStatus.create(
        {
          metadata: {
            from: config.did.id,
            to: message.from,
            exchangeId: message.exchangeId
          },
          data: {
            orderStatus: 'COMPLETED'
          }
        }
      )
      await orderStatus.sign(config.did.privateKey, config.did.kid)
      this.addMessage({ message: orderStatus as OrderStatus})
    }
  }
}

const aliceMessageKinds = new Set(['rfq', 'order'])

export const ExchangeApiProvider = new _ExchangeApiProvider()