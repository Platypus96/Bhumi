
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { BrowserProvider } from 'ethers';
import { REGISTRAR_ADDRESS } from '@/config/blockchain';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import { useFirebase } from '@/firebase';

interface Web3ContextType {
  account: string | null;
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isRegistrar: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// This function is a client-side simulation.
// In a real production app, this should be a secure call to a backend
// that validates the wallet signature and creates a custom Firebase token.
async function getClientSideCustomToken(address: string): Promise<User> {
    const auth = getAuth();
    // For this flow, we will rely on anonymous auth but track the wallet address in the app state.
    // The security rules will need to be adapted for this reality.
    // We ensure an anonymous user is signed in.
    if (!auth.currentUser) {
        await signInAnonymously(auth);
    }
    
    // We can't create a real custom token on the client.
    // The `user` object from `useFirebase` will be the anonymous user.
    // The `account` from `useWeb3` will be the wallet address.
    // We will use the `account` for on-chain actions and checks.
    // The Firestore rules must be designed to handle this separation.
    
    // This function's purpose is now primarily to ensure an auth session exists.
    // And to make it clear that the UID is NOT the wallet address.
    return auth.currentUser!;
}

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const { toast } = useToast();
  const { auth, user, isUserLoading } = useFirebase();

  const isRegistrar = !!account && !!REGISTRAR_ADDRESS && account.toLowerCase() === REGISTRAR_ADDRESS.toLowerCase();
  
  const getEthereumObject = () => {
    if (typeof window !== 'undefined') {
      return (window as any).ethereum;
    }
    return null;
  }

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    if (accounts.length > 0) {
        const newAccount = accounts[0].toLowerCase();
        setAccount(newAccount);

        if (auth) {
            // This ensures a Firebase user is logged in (anonymously).
            // The UID will be the anonymous UID, but our app state (account) holds the wallet.
            await getClientSideCustomToken(newAccount);
            toast({
                title: "Wallet Connected",
                description: `Address: ${newAccount.substring(0, 6)}...`,
            });
        }
    } else {
        setAccount(null);
        setProvider(null);
        if (auth?.currentUser?.isAnonymous === false) {
          // If user was somehow logged in non-anonymously, sign out and back in.
           await auth.signOut();
           await signInAnonymously(auth);
        }
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
      if (accounts.length > 0) {
        const browserProvider = new BrowserProvider(ethereum);
        setProvider(browserProvider);
        await handleAccountsChanged(accounts);
      }
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

      // We don't auto-connect on load to give user explicit control.
      // If they were previously connected, they can click 'Connect Wallet' again.
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
