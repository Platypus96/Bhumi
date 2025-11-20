
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
  orderBy,
  Firestore,
  addDoc,
  writeBatch,
} from 'firebase/firestore';

import type { Property, TransferHistory } from './types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

const PROPERTIES_COLLECTION = 'properties';

export async function createProperty(db: Firestore, propertyData: Omit<Property, 'history' | 'verified' | 'forSale' | 'price' | 'txHash' | 'registeredAt' | 'status'>, txHash: string): Promise<void> {
    const propertyWithDefaults = {
        ...propertyData,
        videoUrl: propertyData.videoUrl || "",
        status: 'unverified' as const,
        verified: false, // For contract state
        forSale: false,
        price: null,
        history: [],
        txHash: txHash,
        registeredAt: Timestamp.now(),
    };
    const propertyRef = doc(db, PROPERTIES_COLLECTION, propertyData.parcelId);
    await setDoc(propertyRef, propertyWithDefaults).catch(error => {
      const contextualError = new FirestorePermissionError({
        operation: 'create',
        path: propertyRef.path,
        requestResourceData: propertyWithDefaults
      });
      errorEmitter.emit('permission-error', contextualError);
      throw contextualError;
    });
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
    const contextualError = new FirestorePermissionError({
      operation: 'get',
      path: docRef.path,
    });
    errorEmitter.emit('permission-error', contextualError);
    throw contextualError;
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
    const contextualError = new FirestorePermissionError({
      operation: 'list',
      path: PROPERTIES_COLLECTION,
    });
    errorEmitter.emit('permission-error', contextualError);
    throw contextualError;
  }
}

export async function getAllProperties(db: Firestore): Promise<Property[]> {
    const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('registeredAt', 'desc'));
    try {
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Property);
    } catch (error) {
      const contextualError = new FirestorePermissionError({
        operation: 'list',
        path: PROPERTIES_COLLECTION,
      });
      errorEmitter.emit('permission-error', contextualError);
      throw contextualError;
    }
}


export async function verifyPropertyInDb(db: Firestore, parcelId: string): Promise<void> {
  const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
  const updateData = { verified: true, status: 'verified' as const };
  await updateDoc(propRef, updateData).catch(error => {
    const contextualError = new FirestorePermissionError({
      operation: 'update',
      path: propRef.path,
      requestResourceData: updateData
    });
    errorEmitter.emit('permission-error', contextualError);
    throw contextualError;
  });
}

export async function rejectPropertyInDb(db: Firestore, parcelId: string): Promise<void> {
  const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
  const updateData = { status: 'rejected' as const };
  await updateDoc(propRef, updateData).catch(error => {
    const contextualError = new FirestorePermissionError({
      operation: 'update',
      path: propRef.path,
      requestResourceData: updateData
    });
    errorEmitter.emit('permission-error', contextualError);
    throw contextualError;
  });
}


export async function listPropertyForSale(db: Firestore, parcelId: string, price: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    await updateDoc(propRef, {
        forSale: true,
        price: price
    }).catch(error => {
      const contextualError = new FirestorePermissionError({
        operation: 'update',
        path: propRef.path,
        requestResourceData: { forSale: true, price: price }
      });
      errorEmitter.emit('permission-error', contextualError);
      throw contextualError;
    });
}

export async function unlistPropertyForSale(db: Firestore, parcelId: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    await updateDoc(propRef, {
        forSale: false,
        price: null
    }).catch(error => {
      const contextualError = new FirestorePermissionError({
        operation: 'update',
        path: propRef.path,
        requestResourceData: { forSale: false, price: null }
      });
      errorEmitter.emit('permission-error', contextualError);
      throw contextualError;
    });
}

export async function updatePropertyOwner(db: Firestore, parcelId: string, newOwner: string, txHash: string, price: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
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

    await updateDoc(propRef, updateData).catch(error => {
      const contextualError = new FirestorePermissionError({
        operation: 'update',
        path: propRef.path,
        requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', contextualError);
      throw contextualError;
    });
}
