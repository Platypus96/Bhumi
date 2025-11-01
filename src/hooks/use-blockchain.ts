import { useMemo } from 'react';
import { Contract, ethers, parseEther, ZeroHash } from 'ethers';
import { useWeb3 } from './use-web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/blockchain';

export const useBlockchain = () => {
  const { provider, account } = useWeb3();

  const contract = useMemo(async () => {
    if (!provider || !account) return null;
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, [provider, account]);

  const getContract = async () => {
    const c = await contract;
    if (!c) {
      throw new Error('Wallet not connected or contract not initialized.');
    }
    return c;
  }

  // Write functions
  const registerProperty = async (
    ownerAddress: string,
    ipfsProofCid: string,
    pointerCid: string = ""
  ) => {
    const c = await getContract();
    
    // Use callStatic to simulate the transaction and get the return value (parcelId)
    const parcelId = await c.registerProperty.staticCall(
      ownerAddress,
      ipfsProofCid,
      pointerCid,
      ZeroHash
    );

    // Then, execute the actual transaction
    const tx = await c.registerProperty(
      ownerAddress,
      ipfsProofCid,
      pointerCid,
      ZeroHash
    );

    const receipt = await tx.wait();
    return { parcelId, receipt };
  };

  const listForSale = async (parcelId: string, priceInEth: string) => {
    const c = await getContract();
    const priceInWei = parseEther(priceInEth);
    const tx = await c.listForSale(parcelId, priceInWei);
    return await tx.wait();
  };
  
  const cancelListing = async (parcelId: string) => {
    const c = await getContract();
    const tx = await c.cancelListing(parcelId);
    return await tx.wait();
  };

  const buyProperty = async (parcelId: string, priceInWei: string) => {
    const c = await getContract();
    const tx = await c.buyProperty(parcelId, { value: priceInWei });
    return await tx.wait();
  };


  // Read-only functions
  const getProperty = async (parcelId: string) => {
    const c = await getContract();
    // Using the read-only provider for calls
    return c.getProperty(parcelId);
  };
  
  const getHistoryLength = async (parcelId: string) => {
     const c = await getContract();
     return c.getHistoryLength(parcelId);
  }

  return {
    contract,
    registerProperty,
    listForSale,
    cancelListing,
    buyProperty,
    getProperty,
    getHistoryLength,
  };
};
