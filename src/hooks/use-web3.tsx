
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { BrowserProvider } from 'ethers';
import { REGISTRAR_ADDRESS } from '@/config/blockchain';
import { getAuth, signInWithCustomToken, onAuthStateChanged, User } from 'firebase/auth';
import { useFirebase } from '@/firebase';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isRegistrar: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// This is a placeholder function. In a real app, this would be a call to a secure backend
// that verifies the wallet signature and creates a custom Firebase token.
// For this environment, we'll simulate it, but it highlights the required architecture.
async function createCustomToken(address: string): Promise<string> {
    // In a real backend:
    // 1. Verify the address is valid.
    // 2. Use Firebase Admin SDK: admin.auth().createCustomToken(address)
    // 3. Return the token.
    
    // For now, we cannot generate a real token here.
    // This will likely cause auth to fail, but it correctly represents the needed flow.
    // The Firebase provider will handle the anonymous fallback.
    console.warn("Simulating custom token creation. This requires a backend implementation.");
    return Promise.reject("Custom token generation not implemented on the client.");
}


export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
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
    if (accounts.length > 0) {
      const newAccount = accounts[0];
      setAccount(newAccount);

      // We have a wallet, now try to sign into Firebase with it.
      if (auth) {
        try {
            // This is where you would call your backend to get a custom token
            // const token = await createCustomToken(newAccount); 
            // await signInWithCustomToken(auth, token);
             toast({
                title: "Wallet Connected",
                description: `Using wallet: ${newAccount.substring(0, 6)}...`,
              });
        } catch (error) {
            console.error("Firebase custom sign-in failed:", error);
            // Fallback to anonymous auth is handled by the provider
             toast({
                variant: 'destructive',
                title: "Firebase Auth Error",
                description: "Could not link wallet to user session. Using anonymous session.",
              });
        }
      }

    } else {
      // Wallet disconnected
      setAccount(null);
      setProvider(null);
      
      // Here you might want to sign out the custom user and sign back in anonymously.
      // The FirebaseProvider's default behavior will handle this.
      toast({
        title: "Wallet Disconnected",
      });
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
      const browserProvider = new BrowserProvider(ethereum);
      setProvider(browserProvider);
      // handleAccountsChanged will be triggered by the 'accountsChanged' event
      // but we can call it manually to speed things up.
      await handleAccountsChanged(accounts);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Failed to connect to wallet. The request may have been rejected.",
      });
    }
  };

  const disconnectWallet = () => {
    // This is a simplified disconnect. A full implementation might need more cleanup.
    handleAccountsChanged([]);
  };

  useEffect(() => {
    const ethereum = getEthereumObject();
    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged);

      // Check for already connected accounts on page load
      (async () => {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
              const browserProvider = new BrowserProvider(ethereum);
              setProvider(browserProvider);
              await handleAccountsChanged(accounts);
          }
      })();
    }
    
    return () => {
        if (ethereum) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    }
  }, [handleAccountsChanged]);


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
