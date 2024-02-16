'use client'
import React, { ReactNode } from 'react';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const envChains: any = process.env.NODE_ENV === 'production' ? [mainnet] : [sepolia];

const { chains, publicClient } = configureChains(
  envChains,
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID ?? "" }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Carbon Vote',
  projectId: "1788a86d4024b19767768854c7b23b97",
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

interface WalletProviderProps {
  children: ReactNode;
}

// Create a provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  return <WagmiConfig config={wagmiConfig}>
    <RainbowKitProvider chains={chains}>
      {children}
    </RainbowKitProvider>
  </WagmiConfig>
};