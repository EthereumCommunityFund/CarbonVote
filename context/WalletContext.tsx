import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/components/ui/use-toast';
import { WalletContextType } from 'types'

// Create the context
const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

// Create a provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasChangedAccount, sethasChangedAccount] = useState(false);
  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const newProvider = new ethers.BrowserProvider(window.ethereum as any);
          const accounts = await newProvider.listAccounts();
          console.log(accounts, 'accounts');
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
            localStorage.setItem('account', accounts[0].address);
            setIsConnected(true);
            setProvider(newProvider);
          }
        } catch (error) {
          console.error('An error occurred while connecting to the wallet:', error);
        }
      } else {
        console.error('MetaMask is not detected in the browser');
      }
    };

    init();
  }, []);

  interface EthereumWindow extends Window {
    ethereum?: {
      request: ({ method }: { method: string }) => Promise<void>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }

  useEffect(() => {
    const ethereumWindow = window as EthereumWindow;
    ethereumWindow.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      ethereumWindow.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [account]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      sethasChangedAccount(true);
      localStorage.setItem('account', accounts[0]);
    }
  };

  const connectToMetamask = async () => {
    if (!window.ethereum) {
      console.log('MetaMask not installed; using read-only defaults');
      toast({
        title: 'Error',
        description: 'You need to install Metamask, please try again',
        variant: 'destructive',
      });
      return;
    }
    if (isConnecting) {
      console.log('Already connecting to MetaMask, please wait.');
      return;
    }
    setIsConnecting(true);
    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum as any);
      const newSigner = await newProvider.getSigner();
      const newAccount = await newSigner.getAddress();
      setSigner(newSigner);
      setAccount(newAccount);
      setProvider(newProvider);
      setIsConnected(true);
      localStorage.setItem('account', newAccount);
    } catch (error) {
      console.error('Error connecting to MetaMask or generating signature:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Provide the context
  return <WalletContext.Provider value={{ provider, signer, account, isConnected, connectToMetamask, hasChangedAccount }}>{children}</WalletContext.Provider>;
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};