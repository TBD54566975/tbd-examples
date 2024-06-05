# kcc-proto-exemplar

This is a simple implementation to illustrate the [known-customer-credential](https://github.com/TBD54566975/known-customer-credential) specification in code form.

# Guide

## 0. Setup & create `did:dht`'s for `issuer/` and `wallet/`

```shell
(cd idv-vendor; npm i);
(cd issuer; npm i; node 0-create-did-dht.js);
(cd wallet; npm i; node 0-create-did-dht.js);
```

## 1. Start servers for `issuer/` & `idv-vendor/`

```shell
cd idv-vendor; node server.js
```

And then in a different shell (or feel free to manage background processes)

```shell
cd issuer; node server.js
```

## 2. Execute `wallet/` scripts to orchestrate KCC flow

The scripts in this stage are provided to illustrate the sequential ordering of the KCC flow, and in practice roughly follow a GUI UX.

```shell
(cd wallet; ./full-flow.sh)
```

You can also step through each call in the sequence one-by-one (view `wallet/full-flow.sh` for more info).

# Notes

- The `KnownCustomerCredential` format is dummy, not the actual VC
- The IDV Vendor's form may be an iframe within an HTML resource hosted by the issuer
- We don't support `vp_token` here
- We aren't currently performing any nonce verfication within the issuer
- We use `@web5/credentials` for our JWT signing & verification, but any JWT solution will suffice
  - Known issue (non-conformant with the kcc spec) with respect to JWS `typ` header in the `access_token` and the `proof.jwt`