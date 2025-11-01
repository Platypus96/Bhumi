"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { BrowserProvider } from 'ethers';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isRegistrar: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

const REGISTRAR_ADDRESS = process.env.NEXT_PUBLIC_REGISTRAR_ADDRESS || "";


export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const { toast } = useToast();

  const isRegistrar = !!account && !!REGISTRAR_ADDRESS && account.toLowerCase() === REGISTRAR_ADDRESS.toLowerCase();
  
  const getEthereumObject = () => {
    if (typeof window !== 'undefined') {
      return (window as any).ethereum;
    }
    return null;
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      setAccount(null);
      setProvider(null);
      toast({
        title: "Wallet Disconnected",
        description: "Your MetaMask wallet has been disconnected.",
      });
    }
  };

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        toast({
          variant: "destructive",
          title: "MetaMask Not Found",
          description: "Please install MetaMask to use this feature.",
        });
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);

      const browserProvider = new BrowserProvider(ethereum);
      setProvider(browserProvider);
      
      toast({
        title: "Wallet Connected",
        description: `Connected with address: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to wallet. The request may have been rejected.",
      });
    }
  };

  const disconnectWallet = () => {
    handleAccountsChanged([]);
  };

  useEffect(() => {
    const ethereum = getEthereumObject();
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);

      // Check for already connected wallet
      (async () => {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
              handleAccountsChanged(accounts);
              const browserProvider = new BrowserProvider(ethereum);
              setProvider(browserProvider);
          }
      })();
    }
    
    return () => {
        if (ethereum) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Web3Context.Provider value={{ account, provider, connectWallet, disconnectWallet, isRegistrar }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === null) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
