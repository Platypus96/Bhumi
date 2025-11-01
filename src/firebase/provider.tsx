
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import { initializeFirebase } from '@/firebase';

interface FirebaseProviderProps {
  children: ReactNode;
}

// This would be a call to a secure backend to create a custom token
// As we can't do this from the client, this is a placeholder.
// The new flow in use-web3.tsx will handle auth differently.
async function getCustomTokenForAddress(address: string): Promise<string> {
    console.warn("Client-side token generation is not secure. This is a mock. A real backend is required for this flow.");
    // In a real backend: admin.auth().createCustomToken(address)
    // We will simulate a failure here to rely on the fallback.
    return Promise.reject("Backend for custom token not implemented.");
}


// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children
}) => {
  const [firebase, setFirebase] = useState<FirebaseContextState>({
    firebaseApp: null,
    firestore: null,
    auth: null,
    user: null,
    isUserLoading: true,
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    const { firebaseApp, auth, firestore } = initializeFirebase();

    // Set services immediately
    setFirebase(prev => ({ ...prev, firebaseApp, auth, firestore }));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setFirebase(prev => ({
          ...prev,
          user,
          isUserLoading: false,
          userError: null,
        }));
    }, (error) => {
      console.error("FirebaseProvider: onAuthStateChanged error:", error);
      setFirebase(prev => ({ ...prev, user: null, isUserLoading: false, userError: error }));
    });

    // Ensure there is at least an anonymous user if no one is signed in.
    if (!auth.currentUser) {
        signInAnonymously(auth).catch(error => {
            console.error("Failed to sign in anonymously on startup:", error);
        });
    }

    return () => unsubscribe(); // Cleanup
  }, []);

  const contextValue = useMemo(() => firebase, [firebase]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return context;
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { // Renamed from useAuthUser
  const { user, isUserLoading, userError } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError };
};
