# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev              # Start Next.js development server
npm run start-node       # Start local Hardhat node for blockchain development
npm run deploy_contracts # Deploy smart contracts to local node
npm run go              # Deploy contracts + start dev server (full setup)
```

### Production
```bash
npm run build           # Build for production
npm run start           # Start production server
```

### Smart Contracts
```bash
npm run test-contracts  # Run Hardhat tests for smart contracts
```

### Code Quality
```bash
npm run lint            # Run ESLint with auto-fix
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
```

## Architecture Overview

**CarbonVote 2** is a decentralized voting platform built with Next.js that enables blockchain-based voting with privacy-preserving authentication. The system supports multiple credential verification methods and zero-knowledge proof voting via Zupass.

### Tech Stack
- **Frontend**: Next.js 14 (Pages Router), React 18, TypeScript, Tailwind CSS
- **Blockchain**: Wagmi 2.x + Viem, RainbowKit, Ethers.js, Hardhat for contracts
- **State**: React Query for server state, Zustand for client state
- **Database**: Supabase (PostgreSQL) with typed schemas
- **Authentication**: Zupass (zero-knowledge), multiple credential providers

### Smart Contract Architecture
- `VotingContract.sol`: Main contract for poll creation and vote recording
- `VotingOption.sol`: Individual voting options as separate contracts
- Server-side signature verification for vote validation
- Protocol Guild member verification with hardcoded allowlist

### Key Directories
- `/components/`: UI components organized by feature (poll/, create/, ui/, etc.)
- `/pages/api/`: Backend API routes for authentication, polls, credentials
- `/utils/`: Shared utilities for blockchain, time, validation
- `/carbonvote-contracts/`: Hardhat project for smart contracts
- `/types/`: TypeScript type definitions

### Authentication Flow
Multiple credential systems supported:
- **Zupass**: Zero-knowledge proof tickets for anonymous voting
- **POAP**: Event attendance verification
- **Gitcoin Passport**: Identity verification
- **Protocol Guild**: Ethereum staking membership
- **Ethereum Holdings**: Token/ETH balance verification

### Development Setup
1. Copy `.env.template` to `.env` and configure required variables
2. Start local blockchain: `npm run start-node`
3. Deploy contracts: `npm run deploy_contracts`
4. Start development: `npm run dev`
5. Configure MetaMask: Network ID 1337, RPC http://127.0.0.1:8545/

### State Management Patterns
- **React Query**: Server state, caching, and API calls
- **Zustand**: Form persistence and client-side state
- **React Context**: Wallet connection and authentication state
- **Local Storage**: Session persistence across page reloads

### Component Patterns
- UI components in `/components/ui/` follow Radix UI patterns
- Poll-related components in `/components/poll/` handle voting logic
- Credential components in `/components/poll/credential/` manage authentication
- Form components use React Hook Form with Joi validation

### Environment Variables Required
```env
PRIVATE_KEY=                        # Wallet private key for contract deployment
POAP_API_KEY=                      # POAP verification API
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous key
JWT_SECRET=                        # JWT signing secret
NEXT_PUBLIC_INFURA_URL_DEVELOPMENT= # Infura endpoint for development
NEXT_PUBLIC_INFURA_URL_PRODUCTION=  # Infura endpoint for production
```

### Testing
- Smart contracts: Use `npm run test-contracts` for Hardhat tests
- Frontend: No testing framework currently configured
- Always run `npm run lint` before committing changes

### Key Features to Understand
- **Frames Integration**: Farcaster frames for social media voting
- **Real-time Results**: Live vote counting and visualization
- **Anonymous Voting**: Semaphore protocol integration via Zupass
- **Multiple Vote Types**: EthCount, Protocol_Guild, credential-based voting
- **Rich Text Editing**: EditorJS integration for poll descriptions