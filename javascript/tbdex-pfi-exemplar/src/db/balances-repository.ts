import type { BalancesApi, Quote } from '@tbdex/http-server'
import { Balance } from '@tbdex/http-server'
import { config } from '../config.js'

let available = '1000'

export class _BalancesRepository implements BalancesApi {
  async getBalances({ requesterDid }): Promise<Balance[]> {
    console.log('getBalances for:', requesterDid)
    const bal = Balance.create({
      data: {
        currencyCode: 'USDC',
        available: available,
      },
      metadata: {
        from: config.pfiDid.uri,
      }
    })
    return [bal]
  }

  withdraw(quote: Quote) {
    // subtract this from available
    available = (parseFloat(available) - parseFloat(quote.data.payout.total)).toString()
  }

  deposit(quote: Quote) {
    // add this to available
    available = (parseFloat(available) + parseFloat(quote.data.payin.total)).toString()
  }
}

export const BalancesRepository = new _BalancesRepository()