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
} from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import type { Property, Submission, TransferHistory } from './types';

// This is a temporary solution to get the db instance.
// Ideally, this should be passed down from the provider or a centralized firebase service.
const getDb = () => {
    const app = getApps()[0];
    if (!app) {
        throw new Error("Firebase has not been initialized. Please ensure FirebaseProvider is set up correctly.");
    }
    return getFirestore(app);
}


const SUBMISSIONS_COLLECTION = 'submissions';
const PROPERTIES_COLLECTION = 'properties';

// Submissions Flow
export async function createSubmission(submissionData: Omit<Submission, 'id' | 'createdAt' | 'status'>): Promise<string> {
  const db = getDb();
  const submissionWithTimestamp = {
    ...submissionData,
    status: 'pending' as const,
    createdAt: Timestamp.now(),
  };
  const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), submissionWithTimestamp);
  return docRef.id;
}

export async function getPendingSubmissions(): Promise<Submission[]> {
  const db = getDb();
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
}

export async function updateSubmissionStatus(submissionId: string, status: 'approved' | 'rejected'): Promise<void> {
  const db = getDb();
  const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  await updateDoc(submissionRef, { status });
}


// Property Flow (after registrar approval)
export async function createProperty(propertyData: Omit<Property, 'history'>): Promise<void> {
    const db = getDb();
    const propertyWithHistory = {
        ...propertyData,
        history: [], // Initialize with empty history
    };
    const propertyRef = doc(db, PROPERTIES_COLLECTION, propertyData.parcelId);
    await setDoc(propertyRef, propertyWithHistory);
}

export async function getPropertyByParcelId(parcelId: string): Promise<Property | null> {
  const db = getDb();
  const docRef = doc(db, PROPERTIES_COLLECTION, parcelId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { ...docSnap.data() } as Property;
  }
  return null;
}

export async function getPropertiesByOwner(ownerAddress: string): Promise<Property[]> {
  const db = getDb();
  if (!ownerAddress) return [];
  const q = query(
    collection(db, PROPERTIES_COLLECTION),
    where('owner', '==', ownerAddress)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as Property);
}

export async function getAllProperties(): Promise<Property[]> {
    const db = getDb();
    const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('registeredAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Property);
}

export async function listPropertyForSale(parcelId: string, price: string): Promise<void> {
    const db = getDb();
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    await updateDoc(propRef, {
        forSale: true,
        price: price
    });
}

export async function unlistPropertyForSale(parcelId: string): Promise<void> {
    const db = getDb();
    const propRef = doc(db, PROPERTIES_COLLECTION, parcelId);
    await updateDoc(propRef, {
        forSale: false,
        price: null
    });
}

export async function updatePropertyOwner(parcelId: string, newOwner: string, txHash: string, price: string): Promise<void> {
    const db = getDb();
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
