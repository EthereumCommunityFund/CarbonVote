import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Button from './ui/buttons/Button';
import { useUserPassportContext } from '@/context/PassportContext';

// Extend window type to include ethereum
declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & {
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
    };
  }
}

export const HeaderComponent = () => {
  const { signIn } = useUserPassportContext();
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error('MetaMask is not detected in the browser');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    window.ethereum?.on?.('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log('Please connect to MetaMask.');
      setAccount(null);
      setIsConnected(false);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  };

  const connectToMetamask = async () => {
    if (window.ethereum && window.ethereum.request) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        checkIfWalletIsConnected();
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
      }
    } else {
      console.error('MetaMask is not detected in the browser');
    }
  };

  return (
    <div className="bg-grayBackground flex w-full h-20 justify-end items-center p-5">
      <Button className="outline-none h-10 items-center rounded-md" onClick={signIn}>
        Zupass Connect
      </Button>
      <Button onClick={connectToMetamask}>{isConnected ? 'Connected' : 'Wallet Connect'}</Button>
    </div>
  );
};

export default HeaderComponent;
