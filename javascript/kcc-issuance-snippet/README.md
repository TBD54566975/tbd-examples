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
    "id": "urn:uuid:b5940592-6f27-4e29-87ce-ab0de30e1570",
    "issuer": "did:jwk:eyJjcnYiOiJFZDI1NTE5Iiwia3R5IjoiT0tQIiwieCI6IlFZYzc0cVh3b1cySVhfcUwxTmV2SE1md0taR0hLNU5jRjYyTHZabDgwbUEiLCJraWQiOiJPaU1LME0zY3htMEhBdVN2aVB3SmhMWFBZZkEyY3BqLS0zeDZqeGV4cmdFIiwiYWxnIjoiRWREU0EifQ",
    "issuanceDate": "2024-08-13T22:48:01Z",
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

`eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDpqd2s6ZXlKamNuWWlPaUpGWkRJMU5URTVJaXdpYTNSNUlqb2lUMHRRSWl3aWVDSTZJbEZaWXpjMGNWaDNiMWN5U1ZoZmNVd3hUbVYyU0UxbWQwdGFSMGhMTlU1alJqWXlUSFphYkRnd2JVRWlMQ0pyYVdRaU9pSlBhVTFMTUUwelkzaHRNRWhCZFZOMmFWQjNTbWhNV0ZCWlprRXlZM0JxTFMwemVEWnFlR1Y0Y21kRklpd2lZV3huSWpvaVJXUkVVMEVpZlEjMCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vdzNpZC5vcmcvdmMvc3RhdHVzLWxpc3QvMjAyMS92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImlkIjoidXJuOnV1aWQ6YjU5NDA1OTItNmYyNy00ZTI5LTg3Y2UtYWIwZGUzMGUxNTcwIiwiaXNzdWVyIjoiZGlkOmp3azpleUpqY25ZaU9pSkZaREkxTlRFNUlpd2lhM1I1SWpvaVQwdFFJaXdpZUNJNklsRlpZemMwY1ZoM2IxY3lTVmhmY1V3eFRtVjJTRTFtZDB0YVIwaExOVTVqUmpZeVRIWmFiRGd3YlVFaUxDSnJhV1FpT2lKUGFVMUxNRTB6WTNodE1FaEJkVk4yYVZCM1NtaE1XRkJaWmtFeVkzQnFMUzB6ZURacWVHVjRjbWRGSWl3aVlXeG5Jam9pUldSRVUwRWlmUSIsImlzc3VhbmNlRGF0ZSI6IjIwMjQtMDgtMTNUMjI6NDg6MDFaIiwiY3JlZGVudGlhbFN1YmplY3QiOnsiaWQiOiJkaWQ6ZGh0OmVmNXJvc3o2OGVvcm5qcjE4dTNxaW9mbTNzNTF1dHVoMTRmeHMzdHl5ejM1Z2ZiZjc1M28iLCJjb3VudHJ5T2ZSZXNpZGVuY2UiOiJVUyIsInRpZXIiOiJHb2xkIiwianVyaXNkaWN0aW9uIjp7ImNvdW50cnkiOiJVUyJ9fSwiZXhwaXJhdGlvbkRhdGUiOiIyMDI2LTA1LTE5VDA4OjAyOjA0WiIsImNyZWRlbnRpYWxTY2hlbWEiOnsiaWQiOiJodHRwczovL3ZjLnNjaGVtYXMuaG9zdC9rY2Muc2NoZW1hLmpzb24iLCJ0eXBlIjoiSnNvblNjaGVtYSJ9LCJldmlkZW5jZSI6W3sia2luZCI6ImRvY3VtZW50X3ZlcmlmaWNhdGlvbiIsImNoZWNrcyI6WyJwYXNzcG9ydCIsInV0aWxpdHlfYmlsbCJdfSx7ImtpbmQiOiJzYW5jdGlvbl9zY3JlZW5pbmciLCJjaGVja3MiOlsiUEVQIl19XX0sIm5iZiI6MTcyMzU4OTI4MSwianRpIjoidXJuOnV1aWQ6YjU5NDA1OTItNmYyNy00ZTI5LTg3Y2UtYWIwZGUzMGUxNTcwIiwiaXNzIjoiZGlkOmp3azpleUpqY25ZaU9pSkZaREkxTlRFNUlpd2lhM1I1SWpvaVQwdFFJaXdpZUNJNklsRlpZemMwY1ZoM2IxY3lTVmhmY1V3eFRtVjJTRTFtZDB0YVIwaExOVTVqUmpZeVRIWmFiRGd3YlVFaUxDSnJhV1FpT2lKUGFVMUxNRTB6WTNodE1FaEJkVk4yYVZCM1NtaE1XRkJaWmtFeVkzQnFMUzB6ZURacWVHVjRjbWRGSWl3aVlXeG5Jam9pUldSRVUwRWlmUSIsInN1YiI6ImRpZDpkaHQ6ZWY1cm9zejY4ZW9ybmpyMTh1M3Fpb2ZtM3M1MXV0dWgxNGZ4czN0eXl6MzVnZmJmNzUzbyIsImlhdCI6MTcyMzU4OTI4MSwiZXhwIjoxNzc5MTc3NzI0fQ.p6oDjUcLVWEFT5LwiDwGjQ5G4cXYVoTdeJv5NJnDN0N49NAIUF7VkyTG13hWdkHT376gamrru0BIkWrU-i99Aw`

