# KCC Issuance Snippet

This is a snippet to illustrate issuing a [Known Customer Credential](https://github.com/TBD54566975/known-customer-credential) using Web5.


> [!NOTE]
> 
> This example focuses solely on issuing the KCC. If you'd like an example that shows the entire Identity Verification (IDV) flow, see the [kcc-prototype-exemplar](https://github.com/TBD54566975/tbd-examples/tree/main/javascript/kcc-prototype-exemplar).

## Pre-reqs
1. [Create DID for Issuer](https://developer.tbd.website/docs/web5/decentralized-identifiers/how-to-create-did)
2. Obtain/create DID URI for Customer
3. [Install `web5/credentials`](https://www.npmjs.com/package/@web5/credentials)

## Create Verifiable Credential (VC)

```js
import { VerifiableCredential } from "@web5/credentials";

const known_customer_credential = await VerifiableCredential.create({
    issuer: issuerBearerDid.uri, // Issuer's DID URI
    subject: customerDidUri, // Customer's DID URI 
    expirationDate: '2026-05-19T08:02:04Z',
    data: {
      countryOfResidence: "US", // 2 letter country code
      tier: "Gold", // optional KYC tier
      jurisdiction: { 
        country: "US" // optional 2 letter country code where IDV was performed
      }
    },
    credentialSchema: [
      {
        id: "https://vc.schemas.host/kcc.schema.json", // URL to the schema used
        type: "JsonSchema", // Format type of the schema used for the KCC
      }
    ],
    // (optional) Evidence describing the due diligence performed to verify the identity of the known customer
    evidence: [
      {
        "kind": "document_verification",
        "checks": ["passport", "utility_bill"]
      },
      {
        "kind": "sanction_screening",
        "checks": ["PEP"]
      }
    ]
  });
```

### Output: VC JSON

```json
{
  "vcDataModel": {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://w3id.org/vc/status-list/2021/v1"
    ],
    "type": [
      "VerifiableCredential"
    ],
    "id": "urn:uuid:815639d2-f0f8-4f54-b25e-6b90ef5e7348",
    "issuer": "did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6IklSVzN1bTRhSmMtUkJLTnE5RENmNk9sY284dldfbWRlTXFOVmFjVURacmMiLCJraWQiOiJtbDVRUTBSUC1CdEk4Rm9tbUo1QVpSQWlGeGNsSkNhUVNkZDlDLW9tbFp3IiwiYWxnIjoiRWREU0EifQ",
    "issuanceDate": "2024-08-14T01:50:42Z",
    "credentialSubject": {
      "id": "did:dht:ef5rosz68eornjr18u3qiofm3s51utuh14fxs3tyyz35gfbf753o",
      "countryOfResidence": "US",
      "tier": "Gold",
      "jurisdiction": {
        "country": "US"
      }
    },
    "expirationDate": "2026-05-19T08:02:04Z",
    "credentialSchema": [
      {
        "id": "https://vc.schemas.host/kcc.schema.json",
        "type": "JsonSchema"
      }
    ],
    "evidence": [
      {
        "kind": "document_verification",
        "checks": [
          "passport",
          "utility_bill"
        ]
      },
      {
        "kind": "sanction_screening",
        "checks": [
          "PEP"
        ]
      }
    ]
  }
}
```

## Sign VC

```js
const credential_token = await known_customer_credential.sign({
  did: issuerBearerDid, // Issuer's Bearer DID
});
```


### Output: JWT

`eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDpqd2s6ZXlKamNuWWlPaUpGWkRJMU5URTVJaXdpYTNSNUlqb2lUMHRRSWl3aWVDSTZJa2xTVnpOMWJUUmhTbU10VWtKTFRuRTVSRU5tTms5c1kyODRkbGRmYldSbFRYRk9WbUZqVlVSYWNtTWlMQ0pyYVdRaU9pSnRiRFZSVVRCU1VDMUNkRWs0Um05dGJVbzFRVnBTUVdsR2VHTnNTa05oVVZOa1pEbERMVzl0YkZwM0lpd2lZV3huSWpvaVJXUkVVMEVpZlEjMCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vdzNpZC5vcmcvdmMvc3RhdHVzLWxpc3QvMjAyMS92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImlkIjoidXJuOnV1aWQ6ODE1NjM5ZDItZjBmOC00ZjU0LWIyNWUtNmI5MGVmNWU3MzQ4IiwiaXNzdWVyIjoiZGlkOmp3azpleUpqY25ZaU9pSkZaREkxTlRFNUlpd2lhM1I1SWpvaVQwdFFJaXdpZUNJNklrbFNWek4xYlRSaFNtTXRVa0pMVG5FNVJFTm1OazlzWTI4NGRsZGZiV1JsVFhGT1ZtRmpWVVJhY21NaUxDSnJhV1FpT2lKdGJEVlJVVEJTVUMxQ2RFazRSbTl0YlVvMVFWcFNRV2xHZUdOc1NrTmhVVk5rWkRsRExXOXRiRnAzSWl3aVlXeG5Jam9pUldSRVUwRWlmUSIsImlzc3VhbmNlRGF0ZSI6IjIwMjQtMDgtMTRUMDE6NTA6NDJaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZGh0OmVmNXJvc3o2OGVvcm5qcjE4dTNxaW9mbTNzNTF1dHVoMTRmeHMzdHl5ejM1Z2ZiZjc1M28iLCJjb3VudHJ5T2ZSZXNpZGVuY2UiOiJVUyIsInRpZXIiOiJHb2xkIiwianVyaXNkaWN0aW9uIjp7ImNvdW50cnkiOiJVUyJ9fSwiZXhwaXJhdGlvbkRhdGUiOiIyMDI2LTA1LTE5VDA4OjAyOjA0WiIsImNyZWRlbnRpYWxTY2hlbWEiOlt7ImlkIjoiaHR0cHM6Ly92Yy5zY2hlbWFzLmhvc3Qva2NjLnNjaGVtYS5qc29uIiwidHlwZSI6Ikpzb25TY2hlbWEifV0sImV2aWRlbmNlIjpbeyJraW5kIjoiZG9jdW1lbnRfdmVyaWZpY2F0aW9uIiwiY2hlY2tzIjpbInBhc3Nwb3J0IiwidXRpbGl0eV9iaWxsIl19LHsia2luZCI6InNhbmN0aW9uX3NjcmVlbmluZyIsImNoZWNrcyI6WyJQRVAiXX1dfSwibmJmIjoxNzIzNjAwMjQyLCJqdGkiOiJ1cm46dXVpZDo4MTU2MzlkMi1mMGY4LTRmNTQtYjI1ZS02YjkwZWY1ZTczNDgiLCJpc3MiOiJkaWQ6andrOmV5SmpjbllpT2lKRlpESTFOVEU1SWl3aWEzUjVJam9pVDB0UUlpd2llQ0k2SWtsU1Z6TjFiVFJoU21NdFVrSkxUbkU1UkVObU5rOXNZMjg0ZGxkZmJXUmxUWEZPVm1GalZVUmFjbU1pTENKcmFXUWlPaUp0YkRWUlVUQlNVQzFDZEVrNFJtOXRiVW8xUVZwU1FXbEdlR05zU2tOaFVWTmtaRGxETFc5dGJGcDNJaXdpWVd4bklqb2lSV1JFVTBFaWZRIiwic3ViIjoiZGlkOmRodDplZjVyb3N6Njhlb3JuanIxOHUzcWlvZm0zczUxdXR1aDE0ZnhzM3R5eXozNWdmYmY3NTNvIiwiaWF0IjoxNzIzNjAwMjQyLCJleHAiOjE3NzkxNzc3MjR9.yI1_oRmxWZXlLGEOF7vlU0fPSdB7pfacxphGeUtdbIZMMKTylO7pSazA0HSGMZgutrn4eaok7-tn8MiF319kDw`