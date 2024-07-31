# Example tbDEX implementation
This is a starter kit for building a **Participating Financial Institution (PFI)**
gateway to provide liquidity services on the
**[tbDEX](https://developer.tbd.website/projects/tbdex/) network**. You can fork
this and use it (or use it as inspiration!). Contains mock implementations of
some features of a PFI, as well as a **Verifiable Credential (VC)** issuer using a
**Decentralized Identifier (DID)**.

Mock TypeScript PFI implementation for example purposes using:

* [@tbdex/http-server](https://www.npmjs.com/package/@tbdex/http-server)
* PostgreSQL as underlying DB


## Running in codesandbox
You can run try this example in codesandbox, or locally.

To run in codesandbox, use the link below and then open a terminal. Then
continue on from the preparing server section below.

<a href="https://githubbox.com/TBD54566975/tbdex-pfi-exemplar">Open sandbox</a>


### Local Development Prerequisites

* [`node`/`npm`](#node-and-npm)
* [`docker`](#docker)
* [`dbmate`](#dbmate)

#### `node` and `npm`
This project is using `node v20.3.1` and `npm >=v7.0.0`. You can verify your
`node` and `npm` installation via the terminal:

```bash
$ node --version
v20.3.1
$ npm --version
9.6.7
```

If you don't have `node` installed, feel free to choose whichever installation
approach you feel the most comfortable with.

We recommend using `nvm` (aka node version manager) since it allows you to run
multiple versions of `node` and select the appropriate runtime for your
specific project via `nvm use`. This ensures what you're running locally
matches what we've tested against ourselves. Follow installation instructions
for `nvm` [here](https://github.com/nvm-sh/nvm?tab=readme-ov-file#about).

Once you have installed `nvm`, install the desired node version with `nvm
install`, defined in the `.nvmrc` file in the root of the project.

#### Docker
Docker is used to spin up a local PostgreSQL container. Most major platforms
are supported and you can find the installation instructions
[here](https://docs.docker.com/engine/install/) .

#### `dbmate`
`dbmate` is used to run database migrations.

Follow these [install
instructions](https://github.com/amacneil/dbmate?tab=readme-ov-file#installation)
based on your OS' package manager.

## Preparing the server database (one time)
> [!IMPORTANT]
> Make sure you have all the [prerequisites](#development-prerequisites)

1. Clone the repo and `cd` into the project directory
2. `./db/scripts/start-pg` from your command line to start a `psql` container
3. `./db/scripts/migrate` to perform database setup or migrations
   * This only needs to be done once and then whenever changes are made in
     `db/migrations`.
4. `npm install` to install all project dependencies
5. `cp .env.example .env`.
   * This is where you can set any necessary environment variables.
     `.env.example` contains all environment variables that you _can_ set.

## Running end-to-end PFI tutorial
In this tutorial we will set up an issuer to issue Sanction Check VCs, as well
as create a customer called "Alice" to interact with the PFI server.

### Step 1: Local development is setup
Ensure [prerequisites](#local-development-prerequisites) are installed and
check the database [prepared and
running](#preparing-the-server-database-one-time)).

### Step 2: Create a VC issuer
```bash
npm run example-create-issuer
```

Creates a new VC issuer, which will be needed by the PFI.

> [!NOTE]
>`issuer.json` stores the private key info for the issuer, `issuerDid.txt` has the public DID which will be trusted by the PFI. 

### Step 3: Configure the PFI database with offerings and VC issuer

```bash
npm run seed-offerings
```
Prepares the PFI with the issuer DID and the offerings it will provide, and what issuer it will trust for the VC.

### Step 4: Create the identity for customer "Alice"
```bash
npm run example-create-customer
```
Create a new "customer" DID (customer is called Alice, think of it as her
wallet). **Take note of her DID which will be used in the next step**.

> [!NOTE]
> Alice's private wallet info is stored in `alice.json`, and her public DID is in `aliceDid.txt`

### Step 5: Issue a sanctions check VC to "Alice"
Issue the credential to Alice, which ensures Alice is a non-sanctioned
individual. Use the DID from in Step 4. **Take note of the signed VC that is
returned.**

```bash
npm run example-issue-credential
```

### Step 6: Run the PFI server
Run the server (or restart it) in another terminal window:

```bash
npm run server
```

> [!NOTE]
> (optional) If you want to run this over a network, please set HOST environment to an appropriate name that clients can connect to, as this will be set in the PFIs did as a `serviceEndpoint` (otherwise it defaults to http://localhost:9000)

### Step 7: Run a tbDEX exchange
Run a tbDEX transaction (or exchange):


```bash
npm run example-e2e-exchange
```

You will see the server print out the
interaction between the customer and the PFI. This will look up offers, ask for
a quote, place an order, and finally check for status.

Each interaction happens in the context of an "Exchange" which is a record of
the interaction between the customer and the PFI.

This PFI has support for "stored balances", to try this out: 

```bash
npm run example-stored-balance
```

This uses the special "STORED_BALANCE" payin and payout offerings to add/remove/send funds from the PFI's stored balance.


## Implementing a PFI

### The PFI server
Start the server with
```bash
npm run server
```

The server business logic (such as it is!) is in `src/main.ts` which you can
see, doesn't do a lot, but it is something you can start with. Also look in
`src/db/exchange-repository.ts` which out of the box has some simple built in
functionality.

For server implementers `_ExchangeRepository` is an interesting class to
lookup: `getExchange` or `getExchanges` is how order statuses and quotes can be
exposed to the client.

Some interesting example parts of the code are `getOfferings` which returns
what offers the PFI currently has, and `rfq` which creates a message to send to
the PFI to request a quote for a particular offering (with the issuer saying
that the customer 'Alice' is not a sanctioned individual). `getExchanges` shows
the current state of the interaction between Alice and the PFI.

`seed-offerings.ts` also sets up the PFI with the offerings and requirements
for the client to be able to make a request for a quote.

You also should use a non-ephemeral DID (using the `env` vars config as
described above).


## DB stuff
Contains sections that highlight convenience scripts that'll help start a
PostgreSQL, create/run migration scripts, and a `psql` shell that's useful for
debugging.

### Convenience Scripts
| Script                       | Description                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| `./db/scripts/start-pg`   | Starts dockerized `psql` if it isn't already running.                                      |
| `./db/scripts/stop-pg`    | Stops dockerized `psql` if it is running. Passing `-rm` will delete the container as well. |
| `./db/scripts/use-pg`     | Drops you into a `psql` shell.                                                             |
| `./db/scripts/new-migration` | Creates a new migration file.                                                             |
| `./db/scripts/migrate`       | Runs DB migrations.                                                                       |

### Migration files
Migration files live in the `db/migrations` directory. This is where all of our
database schemas live.

#### Adding a migration file
To create a new migration file, run the following command from the command
line:

```bash
./db/scripts/new-migration replace_with_file_name
```

This will generate a barebones migration template file for you.

> [!NOTE]
> The above example assumes you're in the root directory of the project.
> adjust the path to the script if you're not in the root.

> [!TIP]
> for `replace_with_file_name`, our convention is `<action>_<tblname>_table`
> (e.g. if you're wanting to create a migration file to create a `quotes` table
> it would be `create_quotes_table.sql` as the filename. `dbmate` prefixes these
> with a timestamp so they can be applied linearly.

#### Running migrations
Migrations can be applied by running `./db/scripts/migrate` from the command
line.

#### Running Manual Queries & Debugging
From the command line, run:
```bash
./db/scripts/use-pg
```

This will drop you into an interactive db session.

## Configuration
Configuration can be set using environment variables. Defaults are set in
`src/config.ts`.

## Project Resources
| Resource                                   | Description                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| [CODEOWNERS](./CODEOWNERS)                 | Outlines the project lead(s)                                                   |
| [CODE\_OF\_CONDUCT.md](./CODE_OF_CONDUCT.md) | Expected behavior for project contributors, promoting a welcoming environment |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Developer guide to build, test, run, access CI, chat, discuss, file issues     |
| [GOVERNANCE.md](./GOVERNANCE.md)           | Project governance                                                             |
| [LICENSE](./LICENSE)                       | Apache License, Version 2.0                                                    |
