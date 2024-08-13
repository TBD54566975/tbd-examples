# KCC Issuance Snippet

This is a snippet to illustrate issuing a [Known Customer Credential](https://github.com/TBD54566975/known-customer-credential) using Web5.


> [!NOTE]
> 
> This example focuses solely on issuing the KCC. If you'd like an example that shows the entire Identity Verification (IDV) flow, see the [kcc-prototype-exemplar](https://github.com/TBD54566975/tbd-examples/tree/main/javascript/kcc-prototype-exemplar)

# Pre-reqs
1. [Create DID for Issuer](https://developer.tbd.website/docs/web5/decentralized-identifiers/how-to-create-did)
2. Obtain/create DID URI for Customer
3. [Install `web5/credentials`](https://www.npmjs.com/package/@web5/credentials)

# Create Verifiable Credential (VC)

```js
const known_customer_credential = await VerifiableCredential.create({
    issuer: issuerBearerDid.uri, // Issuer's DID URI
    subject: customerDidUri, // Customer's DID URI 
    expirationDate: '2026-05-19T08:02:04Z',
    data: {
      countryOfResidence: "US", // 2 letter country code
      tier: "Gold" // optional KYC tier
    },
    credentialSchema: {
      id: "https://vc.schemas.host/kcc.schema.json", // URL to the schema used
      type: "JsonSchema", // Format type of the schema used for the KCC
    },
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

## Output

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
    "id": "urn:uuid:202b2093-fc6f-4e68-8947-aa359da1c756",
    "issuer": "did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6Ijk5TjFQSFdxVzR0aU44ampFTmpxZ3RXZVdZcWt6YXJVeWN1WFcyNktlelEiLCJraWQiOiJmN05yTElSa0VEMWJxUEExMEliM202RExveG54VldtZ0VyeVlWS0tzbU5VIiwiYWxnIjoiRWREU0EifQ",
    "issuanceDate": "2024-08-13T21:15:03Z",
    "credentialSubject": {
      "id": "did:dht:qaybjm8droimytjg69x5y74zwj77q7b538gp4ad7djn5m19zh4qy",
      "countryOfResidence": "US",
      "tier": "Gold"
    },
    "expirationDate": "2026-05-19T08:02:04Z",
    "credentialSchema": {
      "id": "https://vc.schemas.host/kcc.schema.json",
      "type": "JsonSchema"
    },
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

# Sign VC

```js
const credential_token = await known_customer_credential.sign({
  did: issuerBearerDid, // Issuer's Bearer DID
});
```


## Output

`eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDpqd2s6ZXlKamNuWWlPaUpGWkRJMU5URTVJaXdpYTNSNUlqb2lUMHRRSWl3aWVDSTZJams1VGpGUVNGZHhWelIwYVU0NGFtcEZUbXB4WjNSWFpWZFpjV3Q2WVhKVmVXTjFXRmN5Tmt0bGVsRWlMQ0pyYVdRaU9pSm1OMDV5VEVsU2EwVkVNV0p4VUVFeE1FbGlNMjAyUkV4dmVHNTRWbGR0WjBWeWVWbFdTMHR6YlU1Vklpd2lZV3huSWpvaVJXUkVVMEVpZlEjMCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vdzNpZC5vcmcvdmMvc3RhdHVzLWxpc3QvMjAyMS92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImlkIjoidXJuOnV1aWQ6MjAyYjIwOTMtZmM2Zi00ZTY4LTg5NDctYWEzNTlkYTFjNzU2IiwiaXNzdWVyIjoiZGlkOmp3azpleUpqY25ZaU9pSkZaREkxTlRFNUlpd2lhM1I1SWpvaVQwdFFJaXdpZUNJNklqazVUakZRU0ZkeFZ6UjBhVTQ0YW1wRlRtcHhaM1JYWlZkWmNXdDZZWEpWZVdOMVdGY3lOa3RsZWxFaUxDSnJhV1FpT2lKbU4wNXlURWxTYTBWRU1XSnhVRUV4TUVsaU0yMDJSRXh2ZUc1NFZsZHRaMFZ5ZVZsV1MwdHpiVTVWSWl3aVlXeG5Jam9pUldSRVUwRWlmUSIsImlzc3VhbmNlRGF0ZSI6IjIwMjQtMDgtMTNUMjE6MTU6MDNaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZGh0OnFheWJqbThkcm9pbXl0amc2OXg1eTc0endqNzdxN2I1MzhncDRhZDdkam41bTE5emg0cXkiLCJjb3VudHJ5T2ZSZXNpZGVuY2UiOiJVUyIsInRpZXIiOiJHb2xkIn0sImV4cGlyYXRpb25EYXRlIjoiMjAyNi0wNS0xOVQwODowMjowNFoiLCJjcmVkZW50aWFsU2NoZW1hIjp7ImlkIjoiaHR0cHM6Ly92Yy5zY2hlbWFzLmhvc3Qva2NjLnNjaGVtYS5qc29uIiwidHlwZSI6Ikpzb25TY2hlbWEifSwiZXZpZGVuY2UiOlt7ImtpbmQiOiJkb2N1bWVudF92ZXJpZmljYXRpb24iLCJjaGVja3MiOlsicGFzc3BvcnQiLCJ1dGlsaXR5X2JpbGwiXX0seyJraW5kIjoic2FuY3Rpb25fc2NyZWVuaW5nIiwiY2hlY2tzIjpbIlBFUCJdfV19LCJuYmYiOjE3MjM1ODM3MDMsImp0aSI6InVybjp1dWlkOjIwMmIyMDkzLWZjNmYtNGU2OC04OTQ3LWFhMzU5ZGExYzc1NiIsImlzcyI6ImRpZDpqd2s6ZXlKamNuWWlPaUpGWkRJMU5URTVJaXdpYTNSNUlqb2lUMHRRSWl3aWVDSTZJams1VGpGUVNGZHhWelIwYVU0NGFtcEZUbXB4WjNSWFpWZFpjV3Q2WVhKVmVXTjFXRmN5Tmt0bGVsRWlMQ0pyYVdRaU9pSm1OMDV5VEVsU2EwVkVNV0p4VUVFeE1FbGlNMjAyUkV4dmVHNTRWbGR0WjBWeWVWbFdTMHR6YlU1Vklpd2lZV3huSWpvaVJXUkVVMEVpZlEiLCJzdWIiOiJkaWQ6ZGh0OnFheWJqbThkcm9pbXl0amc2OXg1eTc0endqNzdxN2I1MzhncDRhZDdkam41bTE5emg0cXkiLCJpYXQiOjE3MjM1ODM3MDMsImV4cCI6MTc3OTE3NzcyNH0.MnIOas2NRUUeDWMAUUKvzADfYzBo9ZLjarjJIfiBgynnvHPKa3OaTBOfoA77ro7V5imTj1lXdAsBu9CNNUX2Dg`

