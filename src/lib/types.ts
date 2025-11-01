export interface TransferHistory {
  from: string;
  to: string;
  date: string;
  txHash: string;
}

export interface Property {
  id: string;
  ownerAddress: string;
  ownerName: string;
  propertyAddress: string;
  documentCID: string;
  documentHash: string;
  status: 'Registered' | 'Transfer Initiated';
  transferTo?: string; // Buyer's address during transfer
  transferHistory: TransferHistory[];
  imageUrl: string;
  imageHint: string;
}
