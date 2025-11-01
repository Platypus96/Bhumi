
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { BrowserProvider } from 'ethers';
import { REGISTRAR_ADDRESS } from '@/config/blockchain';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isRegistrar: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// This function would typically be a call to your backend, which securely creates a custom token.
// For demonstration purposes, we are creating it on the client, which is INSECURE for production.
const createCustomToken = async (address: string): Promise<string> => {
    // In a real app, you would make a fetch request to a secure backend endpoint.
    // e.g., const response = await fetch('/api/create-custom-token', { method: 'POST', body: JSON.stringify({ address }) });
    // const { token } = await response.json();
    // For this example, we'll return a placeholder. This won't actually work,
    // but it illustrates the flow. In a real Firebase project, this needs a backend.
    console.warn("Using a placeholder custom token. This requires a backend with the Firebase Admin SDK for a real implementation.");
    // A dummy token for local demonstration. Replace with a real backend call.
    // The auth will fail silently with this, but it demonstrates the intended structure.
    // To make this work, a backend function would need to generate a token for the UID (address).
    return "dummy-token-for-" + address;
};


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

  const signInToFirebase = useCallback(async (address: string) => {
    try {
        const auth = getAuth();
        // In a real app, this function calls a backend to get a custom token.
        // As we don't have a backend, this will fail authentication but shows the pattern.
        // To truly fix, a backend that uses the Admin SDK to create a token for the `address` as UID is needed.
        // For now, we will simulate the logic, but auth state will depend on project setup.
        const tokenResponse = await fetch('/api/create-custom-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
        });
        
        if (!tokenResponse.ok) {
            // Fallback for local dev when the API route doesn't exist.
            // This won't work for real auth but prevents app crashes.
            console.warn("Failed to get custom token from API. Auth will not work correctly.");
            return;
        }

        const { token } = await tokenResponse.json();
        await signInWithCustomToken(auth, token);

    } catch (error) {
        console.error('Firebase custom sign-in failed:', error);
        toast({
            variant: "destructive",
            title: "Firebase Auth Failed",
            description: "Could not authenticate with Firebase using your wallet.",
        });
    }
  }, [toast]);


  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length > 0) {
      const newAccount = accounts[0];
      setAccount(newAccount);
      await signInToFirebase(newAccount);
    } else {
      setAccount(null);
      setProvider(null);
      getAuth().signOut();
      toast({
        title: "Wallet Disconnected",
        description: "Your MetaMask wallet has been disconnected.",
      });
    }
  }, [signInToFirebase, toast]);

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

      (async () => {
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
              await handleAccountsChanged(accounts);
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
