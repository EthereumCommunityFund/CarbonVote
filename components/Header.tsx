import { useUserPassportContext } from '@/context/PassportContext';
import Button from './ui/buttons/Button';
import Image from 'next/image';
import { Label } from './ui/Label';
import { BoltIcon } from './icons';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

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
    <div className="bg-white flex w-full h-16 justify-between items-center p-5 rounded-3xl">
      <div className="flex gap-1.5 items-center">
        <Image src={'/images/carbonvote.png'} width={30} height={30} alt={'Carbonvote'} />
        <Label className="text-red-600 text-lg">Carbonvote</Label>
      </div>
      <Button className="outline-none h-10 items-center rounded-full" leftIcon={BoltIcon} onClick={signIn}>
        Sign In
      </Button>
    </div>
  );
};

export default HeaderComponent;
