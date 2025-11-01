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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface TransferHistory {
  from: string;
  to:string;
  txHash: string;
  timestamp: Timestamp;
  price: string; // in wei
}

export interface Property {
  parcelId: string;
  owner: string;
  title: string;
  description: string;
  area: string;
  location: string;
  videoUrl?: string;
  imageUrl: string; // This will now be an IPFS CID URL
  ipfsProofCid: string;
  verified: boolean;
  txHash: string;
  forSale: boolean;
  price: string | null; // in wei
  history: TransferHistory[];
  registeredAt: Timestamp;
}
