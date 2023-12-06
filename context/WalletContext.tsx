import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";

interface WalletContextType {
  provider: ethers.providers.Web3Provider | null;
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

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        setProvider(provider);

        const accounts = await provider.listAccounts();
        console.log(accounts);
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          setIsConnected(true);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error("MetaMask is not detected in the browser");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    window.ethereum?.on?.("accountsChanged", handleAccountsChanged);
    return () => {
      window.ethereum?.removeListener?.(
        "accountsChanged",
        handleAccountsChanged
      );
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      console.log("Please connect to MetaMask.");
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
        await window.ethereum.request({ method: "eth_requestAccounts" });
        checkIfWalletIsConnected();
      } catch (err) {
        console.error("Error connecting to MetaMask:", err);
      }
    } else {
      console.error("MetaMask is not detected in the browser");
    }
  };
  // Provide the context
  return (
    <WalletContext.Provider
      value={{ provider, account, isConnected, connectToMetamask }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
