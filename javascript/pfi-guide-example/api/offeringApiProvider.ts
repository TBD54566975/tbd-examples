import type { OfferingsApi } from '@tbdex/http-server'
import { Offering } from '@tbdex/http-server'
import { dataProvider } from './util/dataProvider.js'

export class _OfferingApiProvider implements OfferingsApi {
  async create(offering: Offering) {
    let result = await dataProvider.insert(
        'offering',
      {
        offeringid: offering.id,
        payoutcurrency: offering.payoutCurrency.currencyCode,
        payincurrency: offering.payinCurrency.currencyCode,
        offering: JSON.stringify(offering)
      });
  }

  async getOffering(opts: {id: string}): Promise<Offering> {
    const [ result ] =  await dataProvider.queryForOffering('offering', opts.id);

    if (!result) {
      return undefined
    }

    return Offering.factory(result.offering)

  }

  async getOfferings(): Promise<Offering[]> {
    const results =  await dataProvider.getOfferings('offering');

    const offerings: Offering[] = []
    for (let result of results) {
      const offering = Offering.factory(result.offering)
      offerings.push(offering)
    }

    return offerings
  }
}

export const OfferingApiProvider = new _OfferingApiProvider()