'use client';
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import React, { ReactNode } from 'react';
import { createPublicClient } from 'viem';
import { WagmiProvider, createConfig, fallback, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IS_PROD } from '@/src/constants';

const queryClient = new QueryClient();

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, walletConnectWallet, rainbowWallet],
    },
  ],
  {
    appName: 'Carbon Vote',
    projectId: '1788a86d4024b19767768854c7b23b97',
    walletConnectParameters: {
      qrModalOptions: {
        themeVariables: {
          '--wcm-z-index': '9999999',
        },
      },
    },
  }
);

const selectedChain = !IS_PROD ? sepolia : mainnet;

const RPC_CONFIG = {
  [sepolia.id]: fallback(
    [
      http(process.env.NEXT_PUBLIC_INFURA_URL_DEVELOPMENT as string),
      http('/api/rpc'),
    ],
    { retryCount: 3 }
  ),
  [mainnet.id]: fallback(
    [http(process.env.NEXT_PUBLIC_INFURA_URL_PRODUCTION), http('/api/rpc')],
    { retryCount: 3 }
  ),
} as const;

export const config = createConfig({
  chains: [selectedChain],
  transports: {
    [sepolia.id]: RPC_CONFIG[sepolia.id],
    [mainnet.id]: RPC_CONFIG[mainnet.id],
  },
  connectors,
  ssr: true,
});

export const client = createPublicClient({
  chain: selectedChain,
  transport: RPC_CONFIG[selectedChain.id],
});

interface WalletProviderProps {
  children: ReactNode;
}

// Create a provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
