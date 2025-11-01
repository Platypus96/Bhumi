import {
  addDoc,
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
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import type { Property, Submission, TransferHistory } from './types';


const SUBMISSIONS_COLLECTION = 'submissions';
const PROPERTIES_COLLECTION = 'properties';

// Submissions Flow
export async function createSubmission(db: Firestore, submissionData: Omit<Submission, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const submissionWithTimestamp = {
    ...submissionData,
    status: 'pending' as const,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submissionWithTimestamp);
  return docRef.id;
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

export async function updateSubmissionStatus(db: Firestore, submissionId: string, status: 'approved' | 'rejected'): Promise<void> {
  const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  await updateDoc(submissionRef, { status });
}


// Property Flow (after registrar approval)
export async function createProperty(db: Firestore, propertyData: Omit<Property, 'history'>): Promise<void> {
    const propertyWithHistory = {
        ...propertyData,
        history: [], // Initialize with empty history
    };
    const propertyRef = doc(db, PROPERTIES_COLLECTION, propertyData.parcelId);
    await setDoc(propertyRef, propertyWithHistory);
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

export async function listPropertyForSale(db: Firestore, parcelId: string, price: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    await updateDoc(propRef, {
        forSale: true,
        price: price
    });
}

export async function unlistPropertyForSale(db: Firestore, parcelId: string): Promise<void> {
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    await updateDoc(propRef, {
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

    await updateDoc(propRef, {
        owner: newOwner,
        forSale: false,
        price: null,
        txHash: txHash, // Update the main txHash to the latest transfer
        history: updatedHistory
    });
}
