
import type { Timestamp } from "firebase/firestore";

// This is now effectively a subset of the Property type, used during creation.
export interface Submission {
  id: string;
  owner: string;
  title: string;
  description: string;
  area: string;
  imageUrl: string;
  proofCID: string;
  createdAt: Timestamp;
}

export interface TransferHistory {
  from: string;
  to:string;
  txHash: string;
  timestamp: Timestamp;
  price: string; // in wei
}

export type PropertyStatus = 'unverified' | 'verified' | 'rejected';

export interface Property {
  parcelId: string;
  owner: string;
  title: string;
  description: string;
  area: string;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl: string; // This will now be an IPFS CID URL
  ipfsProofCid: string;
  status: PropertyStatus;
  verified: boolean; // Retained for smart contract compatibility, but status is preferred for UI
  txHash: string;
  forSale: boolean;
  price: string | null; // in wei
  history: TransferHistory[];
  registeredAt: Timestamp;
}
