# CarbonVote 🗳️

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Spin a Hardhat node:

```bash
npm run start-node
# or
yarn start-node
# or
pnpm start-node
# or
bun start-node
```

Deploy contracts to the node:

```bash
npm run deploy_contracts
# or
yarn deploy_contracts
# or
pnpm deploy_contracts
# or
bun deploy_contracts
```

Make sure to create an `.env` file following `.env.template`.

Add Local Testnet to Metamask with:
- ID: `1337`
- RPC: `http://127.0.0.1:8545/`


To run Ceramic locally you will need to install it like this:

Setup Ceramic locallyfollowing one of the options listed in [the Ceramic docs](https://developers.ceramic.network/docs/composedb/set-up-your-environment).

and then run it with this command:

```
ceramic daemon
```

For development purposes you can check options at:

```
ceramic --help
```