
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  Timestamp,
  Firestore,
  deleteDoc,
  deleteField,
} from 'firebase/firestore';

import type { Property, TransferHistory } from './types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

let appId = 'default-app-id'; // Default value
if (typeof window !== 'undefined' && (window as any)?.__STUDIO_CONFIG__?.appId) {
    appId = (window as any).__STUDIO_CONFIG__.appId;
}


// The path MUST be: artifacts/{appId}/public/data/{collectionName}
const PROPERTIES_COLLECTION = `artifacts/${appId}/public/data/properties`;

// Helper to handle errors consistently
function handleFirestoreError(error: any, operation: 'create' | 'get' | 'list' | 'update' | 'delete', path: string, data?: any) {
  console.error(`Firestore Error [${operation}]:`, error);

  if (error.code === 'permission-denied') {
    const contextualError = new FirestorePermissionError({
      operation,
      path,
      requestResourceData: data
    });
    errorEmitter.emit('permission-error', contextualError);
    throw contextualError;
  }

  // Throw original error (e.g., 'failed-precondition' for missing indexes)
  throw error;
}

export async function createProperty(db: Firestore, propertyData: Omit<Property, 'history' | 'verified' | 'forSale' | 'price' | 'txHash' | 'registeredAt' | 'status'>, txHash: string): Promise<void> {
    const propertyWithDefaults = {
        ...propertyData,
        status: 'unverified' as const,
        verified: false, // For contract state
        forSale: false,
        price: null,
        history: [],
        txHash: txHash,
        registeredAt: Timestamp.now(),
    };
    const propertyRef = doc(db, PROPERTIES_COLLECTION, propertyData.parcelId);
    
    try {
      await setDoc(propertyRef, propertyWithDefaults);
    } catch (error) {
      handleFirestoreError(error, 'create', propertyRef.path, propertyWithDefaults);
    }
}

export async function getPropertyByParcelId(db: Firestore, parcelId: string): Promise<Property | null> {
  const docRef = doc(db, PROPERTIES_COLLECTION, parcelId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...docSnap.data() } as Property;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, 'get', docRef.path);
    return null; // Unreachable due to throw, but keeps TS happy if we changed logic
  }
}

export async function getPropertiesByOwner(db: Firestore, ownerAddress: string): Promise<Property[]> {
  if (!ownerAddress) return [];
  
  const q = query(
    collection(db, PROPERTIES_COLLECTION),
    where('owner', '==', ownerAddress)
  );

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Property);
  } catch (error) {
    handleFirestoreError(error, 'list', PROPERTIES_COLLECTION);
    return [];
  }
}

export async function getAllProperties(db: Firestore): Promise<Property[]> {
    const q = query(
      collection(db, PROPERTIES_COLLECTION)
    );
    
    try {
      const querySnapshot = await getDocs(q);
      const properties = querySnapshot.docs.map(doc => doc.data() as Property);
      // Sort client-side
      return properties.sort((a, b) => b.registeredAt.toMillis() - a.registeredAt.toMillis());
    } catch (error) {
      handleFirestoreError(error, 'list', PROPERTIES_COLLECTION);
      return [];
    }
}


export async function verifyPropertyInDb(db: Firestore, parcelId: string): Promise<void> {
  const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
  const updateData = { 
      verified: true, 
      status: 'verified' as const,
      verifiedAt: Timestamp.now(),
      rejectionReason: deleteField(),
  };
  
  try {
    await updateDoc(propRef, updateData);
  } catch (error) {
    handleFirestoreError(error, 'update', propRef.path, updateData);
  }
}

export async function rejectPropertyInDb(db: Firestore, parcelId: string, reason: string): Promise<void> {
  const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
  const updateData = { 
    status: 'rejected' as const,
    rejectionReason: reason,
    verified: false,
  };
  
  try {
    await updateDoc(propRef, updateData);
  } catch (error) {
    handleFirestoreError(error, 'update', propRef.path, updateData);
  }
}

export async function deletePropertyFromDb(db: Firestore, parcelId: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    try {
        await deleteDoc(propRef);
    } catch (error) {
        handleFirestoreError(error, 'delete', propRef.path);
    }
}


export async function listPropertyForSale(db: Firestore, parcelId: string, price: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    const updateData = { forSale: true, price: price };

    try {
      await updateDoc(propRef, updateData);
    } catch (error) {
      handleFirestoreError(error, 'update', propRef.path, updateData);
    }
}

export async function unlistPropertyForSale(db: Firestore, parcelId: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    const updateData = { forSale: false, price: null };

    try {
      await updateDoc(propRef, updateData);
    } catch (error) {
      handleFirestoreError(error, 'update', propRef.path, updateData);
    }
}

export async function updatePropertyOwner(db: Firestore, parcelId: string, newOwner: string, txHash: string, price: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    
    try {
      const propSnap = await getDoc(propRef);

      if (!propSnap.exists()) {
          throw new Error("Property not found");
      }

      const currentData = propSnap.data() as Property;
      const oldOwner = currentData.owner;

      const newHistoryEntry: Omit<TransferHistory, 'price'> & { price: string } = {
          from: oldOwner,
          to: newOwner,
          txHash: txHash,
          timestamp: Timestamp.now(),
          price: price
      };

      const updatedHistory = currentData.history ? [...currentData.history, newHistoryEntry] : [newHistoryEntry];

      const updateData = {
          owner: newOwner,
          forSale: false,
          price: null,
          txHash: txHash, // Update the main txHash to the latest transfer
          history: updatedHistory
      };

      await updateDoc(propRef, updateData);
    } catch (error) {
      handleFirestoreError(error, 'update', propRef.path, { owner: newOwner });
    }
}
