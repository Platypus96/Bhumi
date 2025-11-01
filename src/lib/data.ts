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
} from 'firebase/firestore';

import type { Property, Submission, TransferHistory } from './types';
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const SUBMISSIONS_COLLECTION = 'submissions';
const PROPERTIES_COLLECTION = 'properties';

// Submissions Flow
export function createSubmission(db: Firestore, submissionData: Omit<Submission, 'id' | 'createdAt' | 'status'>) {
  const submissionWithTimestamp = {
    ...submissionData,
    status: 'pending' as const,
    createdAt: Timestamp.now(),
  };
  const submissionsCollection = collection(db, SUBMISSIONS_COLLECTION);
  // Use the non-blocking helper to get contextual errors on failure
  return addDocumentNonBlocking(submissionsCollection, submissionWithTimestamp);
}


export async function getPendingSubmissions(db: Firestore): Promise<Submission[]> {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
}

export function updateSubmissionStatus(db: Firestore, submissionId: string, status: 'approved' | 'rejected'): void {
  const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  updateDocumentNonBlocking(submissionRef, { status });
}


// Property Flow (after registrar approval)
export function createProperty(db: Firestore, propertyData: Omit<Property, 'history'>): void {
    const propertyWithHistory = {
        ...propertyData,
        history: [], // Initialize with empty history
    };
    const propertyRef = doc(db, PROPERTIES_COLLECTION, propertyData.parcelId);
    setDocumentNonBlocking(propertyRef, propertyWithHistory, { merge: false });
}

export async function getPropertyByParcelId(db: Firestore, parcelId: string): Promise<Property | null> {
  const docRef = doc(db, PROPERTIES_COLLECTION, parcelId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data() } as Property;
  }
  return null;
}

export async function getPropertiesByOwner(db: Firestore, ownerAddress: string): Promise<Property[]> {
  if (!ownerAddress) return [];
  const q = query(
    collection(db, PROPERTIES_COLLECTION),
    where('owner', '==', ownerAddress)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Property);
}

export async function getAllProperties(db: Firestore): Promise<Property[]> {
    const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('registeredAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Property);
}

export function listPropertyForSale(db: Firestore, parcelId: string, price: string): void {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    updateDocumentNonBlocking(propRef, {
        forSale: true,
        price: price
    });
}

export function unlistPropertyForSale(db: Firestore, parcelId: string): void {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    updateDocumentNonBlocking(propRef, {
        forSale: false,
        price: null
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

    // This is a critical state update, so we'll use a blocking update for now
    // to ensure the UI can react correctly upon completion.
    await updateDoc(propRef, {
        owner: newOwner,
        forSale: false,
        price: null,
        txHash: txHash, // Update the main txHash to the latest transfer
        history: updatedHistory
    });
}
