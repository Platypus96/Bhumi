import type { Property } from './types';
import { PlaceHolderImages } from './placeholder-images';

// This is now a MOCK DATABASE, to be replaced with Firestore and blockchain calls.
let properties: Property[] = [
  {
    id: 'prop-001',
    ownerAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    ownerName: 'Alice Johnson',
    propertyAddress: '123 Meadow Lane, Greenfield',
    documentCID: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi', // Example valid CID
    documentHash: '0x9c3b8a1f81e8b2b733b52b21e8558ac7f00d44e8557b501a3b86d53eda625c28',
    status: 'Registered',
    transferHistory: [
      { from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', date: new Date('2023-01-15').toISOString(), txHash: '0x...tx1' }
    ],
    imageUrl: PlaceHolderImages[0].imageUrl,
    imageHint: PlaceHolderImages[0].imageHint,
  },
  {
    id: 'prop-002',
    ownerAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    ownerName: 'Bob Williams',
    propertyAddress: '456 Oak Street, Mapleton',
    documentCID: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    documentHash: '0x1c3b8a1f81e8b2b733b52b21e8558ac7f00d44e8557b501a3b86d53eda625c28',
    status: 'Transfer Initiated',
    transferTo: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    transferHistory: [
      { from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', date: new Date('2023-05-20').toISOString(), txHash: '0x...tx2' }
    ],
    imageUrl: PlaceHolderImages[1].imageUrl,
    imageHint: PlaceHolderImages[1].imageHint,
  },
   {
    id: 'prop-003',
    ownerAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // Owned by registrar
    ownerName: 'Land Registry Admin',
    propertyAddress: '789 Pine Avenue, River City',
    documentCID: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
    documentHash: '0x2c3b8a1f81e8b2b733b52b21e8558ac7f00d44e8557b501a3b86d53eda625c28',
    status: 'Registered',
    transferHistory: [],
    imageUrl: PlaceHolderImages[2].imageUrl,
    imageHint: PlaceHolderImages[2].imageHint,
  }
];

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// TODO: Replace these functions with Firestore calls
export async function getProperties(): Promise<Property[]> {
  await delay(500);
  return properties;
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  await delay(500);
  return properties.find(p => p.id === id);
}

export async function registerProperty(data: Omit<Property, 'transferHistory' | 'status'>): Promise<Property> {
  await delay(1000);
  const newProperty: Property = {
    ...data,
    status: 'Registered',
    transferHistory: [],
  };
  properties.unshift(newProperty);
  return newProperty;
}

export async function initiateTransfer(propertyId: string, buyerAddress: string): Promise<Property | undefined> {
  await delay(1000);
  const propertyIndex = properties.findIndex(p => p.id === propertyId);
  if (propertyIndex !== -1) {
    properties[propertyIndex].status = 'Transfer Initiated';
    properties[propertyIndex].transferTo = buyerAddress;
    return properties[propertyIndex];
  }
  return undefined;
}

export async function approveTransfer(propertyId: string): Promise<Property | undefined> {
  await delay(1000);
  const propertyIndex = properties.findIndex(p => p.id === propertyId);
  if (propertyIndex !== -1 && properties[propertyIndex].transferTo) {
    const oldOwner = properties[propertyIndex].ownerAddress;
    const newOwner = properties[propertyIndex].transferTo!;
    
    properties[propertyIndex].ownerAddress = newOwner;
    properties[propertyIndex].ownerName = `New Owner`; // In a real app, you might fetch a name/ENS
    properties[propertyIndex].status = 'Registered';
    delete properties[propertyIndex].transferTo;
    properties[propertyIndex].transferHistory.push({
      from: oldOwner,
      to: newOwner,
      date: new Date().toISOString(),
      txHash: `0x-mock-${[...Array(58)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    });
    return properties[propertyIndex];
  }
  return undefined;
}
