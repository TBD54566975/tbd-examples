# Example tbdex remittance for USD to AUD

This is an example remittance PFI implementation using the tbdex protocol which uses a real payment API.

This example will:

* Show a plain HTML and vanilla javascript client page that captures a credit card, creates a DID and requests a Verifiable Credential.
* A server which does an "OFAC" check on the customer and issues a verifiable credential only if they are not on the OFAC list.
* A tbdex protocol implementation that will charge the customer's credit card in USD and remit AUD as required to specified bank account.

See [index.html](src/didpay-client/index.html) for the client code and [main.ts](src/main.ts) for the liquidity node code (server).

NOTE: this is not using market rates, or anything sensible, and is not intended to showcase all regulatory requirements that must be fulfilled. This is for illustrative purposes only, not production use.
For a more general exemplar for a PFI liquidity node, please take a look at: https://github.com/TBD54566975/tbdex-pfi-exemplar/ (which also includes a database, this one does not).

![image](https://github.com/TBD54566975/example-pfi-aud-usd-tbdex/assets/14976/6db08cbb-c0f0-4881-a120-214c33a60443)


# Development Prerequisites

## `node` and `npm`
This project is using `node v20.3.1` and `npm >=v7.0.0`. You can verify your `node` and `npm` installation via the terminal:

```
$ node --version
v20.3.1
$ npm --version
9.6.7
```

If you don't have `node` installed, feel free to choose whichever installation approach you feel the most comfortable with. If you don't have a preferred installation method, we recommend using `nvm` (aka node version manager). `nvm` allows you to install and use different versions of node. It can be installed by running `brew install nvm` (assuming that you have homebrew)

Once you have installed `nvm`, install the desired node version with `nvm install vX.Y.Z`.


## Step 0: Setup server

(this is a step you only need to do once).

> 💡 Make sure you have all the [prerequisites](#development-prerequisites)

Go to [pin payments](https://pinpayments.com/) sign up and get a test api secret key, then `export SEC_PIN_PAYMENTS_SECRET_KEY=(secret key here)` (or you can use a .env file).

## Step 1: Run liquidity node (server)

Run the server (or restart it) in another terminal window:

`npm run server`

## Step 2: Run client app (browser)

Open `src/didpay-client/index.html` in a browser and try it out!

# Implementing a PFI

The business logic for the PFI is mainly in [main.ts](src/main.ts) and the offerings as specified in [offerings.ts](src/offerings.ts). Poke around!

Each interaction happens in the context of an "Exchange" which is a record of the interaction between the customer and the PFI.


# Configuration
Configuration can be set using environment variables. Defaults are set in `src/config.ts`



# Project Resources

| Resource                                   | Description                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                   |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues     |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                             |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                    |

<img width="400" alt="Screenshot 2023-11-25 at 8 48 29 am" src="https://github.com/TBD54566975/example-aud-usd-pfi/assets/14976/2f86b963-b63e-4f68-a277-a0b5882d7385">
