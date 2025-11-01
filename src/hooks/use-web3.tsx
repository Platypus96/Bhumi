
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { BrowserProvider } from 'ethers';
import { REGISTRAR_ADDRESS } from '@/config/blockchain';
import { getAuth, signInWithCustomToken, onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
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
async function createCustomToken(address: string): Promise<string> {
    // In a real backend:
    // 1. Verify the address is valid.
    // 2. Use Firebase Admin SDK: admin.auth().createCustomToken(address)
    // 3. Return the token.
    
    // For this demonstration, we are simulating a backend failure to generate a token
    // to show how the app falls back to anonymous authentication gracefully.
    console.warn("Simulating custom token creation failure. This requires a backend implementation.");
    return Promise.reject("Custom token generation is a backend process and not implemented here.");
}


export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const { toast } = useToast();
  const { auth, user, isUserLoading } = useFirebase(); // Get user and loading state

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

      if (auth && auth.currentUser?.uid !== newAccount) {
        try {
          // This will fail because createCustomToken is a placeholder.
          // In a real app, this would call a backend.
          const token = await createCustomToken(newAccount);
          await signInWithCustomToken(auth, token);
          toast({
            title: "Wallet Linked",
            description: `Signed in as: ${newAccount.substring(0, 6)}...`,
          });
        } catch (error) {
           // If custom token fails, we rely on the anonymous user already signed in
           // by FirebaseProvider. We are not showing an error toast here to avoid confusion,
           // as the app remains functional with the anonymous user.
           console.log("Custom token sign-in failed, continuing with anonymous user.");
           toast({
              title: "Wallet Connected",
              description: `Using wallet: ${newAccount.substring(0, 6)}... (Session is anonymous)`,
            });
        }
      }
    } else {
      // Wallet disconnected
      setAccount(null);
      setProvider(null);
      if (auth && !auth.currentUser?.isAnonymous) {
        // If the user was signed in with a wallet, sign them out and back in anonymously
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

      // Check for already connected accounts on page load, if Firebase auth is ready
      if (!isUserLoading) {
        (async () => {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const browserProvider = new BrowserProvider(ethereum);
                setProvider(browserProvider);
                await handleAccountsChanged(accounts);
            }
        })();
      }
    }
    
    return () => {
        if (ethereum) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
    }
  }, [handleAccountsChanged, isUserLoading]);


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
