import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  provider: ethers.Provider | null;
  account: string | null;
  isConnected: boolean;
  connectToMetamask: () => Promise<void>;
  // ... any other functions or state variables you want to include
}

// Create the context
const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}

// Create a provider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const newProvider = new ethers.BrowserProvider(window.ethereum as any);
          const accounts = await newProvider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
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

  useEffect(() => {
    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, [account]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsConnected(false);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const generateSignature = async (account: string, message: string) => {
    const response = await fetch('/api/auth/generate_signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({ account, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate signature');
    }

    const data = await response.json();
    console.log(data.data.message, 'message');
    console.log(data.data.signed_message, 'signature');
    return data.data.signed_message;
  };

  const connectToMetamask = async () => {
    if (!window.ethereum) {
      console.log('MetaMask not installed; using read-only defaults');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const message = account;
      const signature = await generateSignature(account as string, message as string);

      if (signature) {
        localStorage.setItem('userSignature', signature);
        localStorage.setItem('userMessage', message);
        setAccount(account);
        setIsConnected(true);
        setProvider(provider);
      } else {
        console.error('Signature generation failed');
        // Set any state needed to indicate the failure
      }
    } catch (error) {
      console.error('Error connecting to MetaMask or generating signature:', error);
    }
  };

  // Provide the context
  return <WalletContext.Provider value={{ provider, account, isConnected, connectToMetamask }}>{children}</WalletContext.Provider>;
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
