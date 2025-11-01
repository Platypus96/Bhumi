export interface TransferHistory {
  from: string;
  to: string;
  date: string;
  txHash: string;
}

export interface Property {
  id: string; // This is the parcelId from your spec
  ownerAddress: string;
  ownerName: string;
  propertyAddress: string;
  documentCID: string;
  documentHash: string; // The SHA-256 hash
  status: 'Registered' | 'Transfer Initiated';
  transferTo?: string; // Buyer's address during transfer
  transferHistory: TransferHistory[];
  imageUrl: string;
  imageHint: string;
  txHash?: string; // Transaction hash from registration or last transfer
}
