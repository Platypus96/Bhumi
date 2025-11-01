"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface Web3ContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isRegistrar: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// This is a common default address from Hardhat/Anvil nodes
const REGISTRAR_ADDRESS = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const { toast } = useToast();

  const isRegistrar = account?.toLowerCase() === REGISTRAR_ADDRESS.toLowerCase();

  const checkIfWalletIsConnected = useCallback(async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        console.log("Make sure you have MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        setAccount(accounts[0]);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      // It's better to not log this as an error to the user in the console
      // console.error(error);
    }
  }, []);

  useEffect(() => {
    checkIfWalletIsConnected();

    const { ethereum } = window as any;
    if (ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          toast({
            title: "Wallet Disconnected",
            description: "Your MetaMask wallet has been disconnected.",
          });
        }
      };
      ethereum.on('accountsChanged', handleAccountsChanged);
      return () => ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, [checkIfWalletIsConnected, toast]);

  const connectWallet = async () => {
    try {
      const { ethereum } = window as any;
      if (!ethereum) {
        toast({
          variant: "destructive",
          title: "MetaMask Not Found",
          description: "Please install MetaMask to use this feature.",
        });
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
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
    setAccount(null);
    toast({
      title: "Wallet Disconnected",
      description: "You have successfully disconnected your wallet.",
    });
  };

  return (
    <Web3Context.Provider value={{ account, connectWallet, disconnectWallet, isRegistrar }}>
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
