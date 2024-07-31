import './polyfills.js'

import { Postgres, OfferingRepository } from './db/index.js'
import { Offering } from '@tbdex/http-server'
import { config } from './config.js'
import { promises as fs } from 'fs'

async function main() {

  await Postgres.connect()
  await Postgres.clear()

  try {

    // this is the issuer did (just the URI) that was created in the example/create-issuer.ts file
    const issuerDid = await fs.readFile('issuerDid.txt', 'utf8')

    const offering1 = Offering.create({
      metadata: { from: config.pfiDid.uri },
      data: {
        cancellation: { enabled: false },
        description: 'fake offering 1',
        payoutUnitsPerPayinUnit: '0.0069', // ex. we send 100 dollars, so that means 14550.00 KES
        payin: {
          currencyCode: 'USD',
          methods: [
            {
              kind: 'USD_LEDGER',
              requiredPaymentDetails: {},
            },
          ],
        },
        payout: {
          currencyCode: 'KES',
          methods: [
            {
              kind: 'MOMO_MPESA',
              requiredPaymentDetails: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                title: 'Mobile Money Required Payment Details',
                type: 'object',
                required: ['phoneNumber', 'reason'],
                additionalProperties: false,
                properties: {
                  phoneNumber: {
                    title: 'Mobile money phone number',
                    description: 'Phone number of the Mobile Money account',
                    type: 'string',
                  },
                  reason: {
                    title: 'Reason for sending',
                    description:
                      'To abide by the travel rules and financial reporting requirements, the reason for sending money',
                    type: 'string',
                  },
                },
              },
              estimatedSettlementTime: 10
            },
            {
              kind: 'BANK_FIRSTBANK',
              requiredPaymentDetails: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                title: 'Bank Transfer Required Payment Details',
                type: 'object',
                required: ['accountNumber', 'reason'],
                additionalProperties: false,
                properties: {
                  accountNumber: {
                    title: 'Bank account number',
                    description: 'Bank account of the recipient\'s bank account',
                    type: 'string',
                  },
                  reason: {
                    title: 'Reason for sending',
                    description:
                      'To abide by the travel rules and financial reporting requirements, the reason for sending money',
                    type: 'string',
                  },
                },
              },
              estimatedSettlementTime: 10
            },
          ],
        },

        requiredClaims: {
          id: '7ce4004c-3c38-4853-968b-e411bafcd945',
          input_descriptors: [
            {
              id: 'bbdb9b7c-5754-4f46-b63b-590bada959e0',
              constraints: {
                fields: [
                  {
                    path: ['$.type[*]'],
                    filter: {
                      type: 'string',
                      pattern: '^SanctionCredential$',
                    },
                  },
                  {
                    path: ['$.issuer'],
                    filter: {
                      type: 'string',
                      const: issuerDid.trim() // Use the read issuer DID here
                    }
                  }
                ],
              },
            },
          ],
        },
      },
    })

    const offering2 = Offering.create({
      metadata: { from: config.pfiDid.uri },
      data: {
        cancellation: { enabled: false },
        description: 'USD to USDC wire transfer to stored balance',
        payoutUnitsPerPayinUnit: '1.00',
        payin: {
          currencyCode: 'USD',
          methods: [
            {
              kind: 'WIRE_TRANSFER',
              requiredPaymentDetails: {},
            },
          ],
        },
        payout: {
          currencyCode: 'USDC',
          methods: [
            {
              kind: 'STORED_BALANCE',
              requiredPaymentDetails: {},
              estimatedSettlementTime: 10
            },
          ],
        },
      },
    })

    const offering3 = Offering.create({
      metadata: { from: config.pfiDid.uri },
      data: {
        cancellation: { enabled: false },
        description: 'USDC to USD wire transfer from stored balance',
        payoutUnitsPerPayinUnit: '1.00',
        payin: {
          currencyCode: 'USDC',
          methods: [
            {
              kind: 'STORED_BALANCE',
              requiredPaymentDetails: {},
            },
          ],
        },
        payout: {
          currencyCode: 'USD',
          methods: [
            {
              kind: 'WIRE_TRANSFER',
              requiredPaymentDetails: {},
              estimatedSettlementTime: 10
            },
          ],
        },
      },
    })

    const offering4 = Offering.create({
      metadata: { from: config.pfiDid.uri },
      data: {
        cancellation: { enabled: false },
        description: 'Stored balance (in USDC) to MOMO_MPESA',
        payoutUnitsPerPayinUnit: '0.0069', // ex. we send 100 dollars, so that means 14550.00 KES
        payin: {
          currencyCode: 'USDC',
          methods: [
            {
              kind: 'STORED_BALANCE',
              requiredPaymentDetails: {},
            },
          ],
        },
        payout: {
          currencyCode: 'KES',
          methods: [
            {
              kind: 'MOMO_MPESA',
              requiredPaymentDetails: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                title: 'Mobile Money Required Payment Details',
                type: 'object',
                required: ['phoneNumber', 'reason'],
                additionalProperties: false,
                properties: {
                  phoneNumber: {
                    title: 'Mobile money phone number',
                    description: 'Phone number of the Mobile Money account',
                    type: 'string',
                  },
                  reason: {
                    title: 'Reason for sending',
                    description:
                      'To abide by the travel rules and financial reporting requirements, the reason for sending money',
                    type: 'string',
                  },
                },
              },
              estimatedSettlementTime: 10
            },
          ],
        },
        requiredClaims: {
          id: 'example-claim-3',
          input_descriptors: [
            {
              id: 'example-descriptor-3',
              constraints: {
                fields: [
                  {
                    path: ['$.type[*]'],
                    filter: {
                      type: 'string',
                      pattern: '^SanctionCredential$',
                    },
                  },
                  {
                    path: ['$.issuer'],
                    filter: {
                      type: 'string',
                      const: issuerDid.trim() // Use the read issuer DID here
                    }
                  }
                ],
              },
            },
          ],
        },
      },
    })

    await offering1.sign(config.pfiDid)
    await OfferingRepository.create(offering1)

    await offering2.sign(config.pfiDid)
    await OfferingRepository.create(offering2)

    await offering3.sign(config.pfiDid)
    await OfferingRepository.create(offering3)

    await offering4.sign(config.pfiDid)
    await OfferingRepository.create(offering4)

  } catch (error) {
    console.error('Error reading issuer DID or creating offering:', error)
  }
}

main()
