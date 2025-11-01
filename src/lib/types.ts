import type { Timestamp } from "firebase/firestore";

export interface Submission {
  id: string;
  owner: string;
  title: string;
  description: string;
  area: string;
  imageUrl: string;
  proofCID: string;
  pointerCID?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
}

export interface TransferHistory {
  from: string;
  to: string;
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
  imageUrl: string;
  ipfsProofCid: string;
  pointerCid?: string;
  verified: boolean;
  txHash: string;
  forSale: boolean;
  price: string | null; // in wei
  history: TransferHistory[];
  registeredAt: Timestamp;
}
