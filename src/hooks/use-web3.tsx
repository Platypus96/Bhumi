
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { BrowserProvider, formatEther } from 'ethers';
import { REGISTRAR_ADDRESS } from '@/config/blockchain';
import { useFirebase } from '@/firebase';
import { getAuth, signInAnonymously, signOut, onAuthStateChanged } from 'firebase/auth';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isRegistrar: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const { toast } = useToast();
  const { auth } = useFirebase();

  const isRegistrar = !!account && !!REGISTRAR_ADDRESS && account.toLowerCase() === REGISTRAR_ADDRESS.toLowerCase();
  
  const getEthereumObject = () => {
    if (typeof window !== 'undefined') {
      return (window as any).ethereum;
    }
    return null;
  }

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (!auth) return;

    if (accounts.length > 0) {
        const newAccount = accounts[0].toLowerCase();
        const browserProvider = new BrowserProvider(getEthereumObject());
        
        setAccount(newAccount);
        setProvider(browserProvider);
        
        // Fetch and set balance
        try {
            const balanceInWei = await browserProvider.getBalance(newAccount);
            setBalance(formatEther(balanceInWei));
        } catch (error) {
            console.error("Failed to fetch balance:", error);
            setBalance(null);
        }
        
        if (auth.currentUser?.isAnonymous || auth.currentUser?.uid.toLowerCase() !== newAccount) {
            console.log("Wallet changed, ensuring Firebase auth state is correct.");
        }

        toast({
            title: "Wallet Connected",
            description: `Address: ${newAccount.substring(0, 6)}...`,
        });

    } else {
        setAccount(null);
        setProvider(null);
        setBalance(null); // Clear balance on disconnect
        if (!auth.currentUser || !auth.currentUser.isAnonymous) {
            await signOut(auth).catch(); 
            await signInAnonymously(auth); 
        }
        toast({ title: "Wallet Disconnected" });
    }
  }, [toast, auth]);

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
      await handleAccountsChanged(accounts);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect to wallet. The request may have been rejected.",
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
      
      ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
            if (accounts.length > 0) {
                handleAccountsChanged(accounts);
            } else {
                if (auth && !auth.currentUser) {
                    signInAnonymously(auth);
                }
            }
        });
    } else {
       if (auth && !auth.currentUser) {
            signInAnonymously(auth);
        }
    }
    
    return () => {
        if (ethereum) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    }
  }, [handleAccountsChanged, auth]);


  return (
    <Web3Context.Provider value={{ account, provider, balance, connectWallet, disconnectWallet, isRegistrar }}>
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
