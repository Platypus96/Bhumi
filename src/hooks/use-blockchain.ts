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
  const addProperty = async (
    parcelId: string,
    propertyImageCID: string,
    proofCID: string
  ) => {
    const c = await getContract();
    const tx = await c.addProperty(parcelId, propertyImageCID, proofCID);
    return await tx.wait();
  };

  const markForSale = async (parcelId: string, priceInEth: string) => {
    const c = await getContract();
    const priceInWei = parseEther(priceInEth);
    const tx = await c.markForSale(parcelId, priceInWei);
    return await tx.wait();
  };
  
  const buyProperty = async (parcelId: string, priceInWei: string) => {
    const c = await getContract();
    const tx = await c.buyProperty(parcelId, { value: priceInWei });
    return await tx.wait();
  };
  
  const verifyProperty = async (parcelId: string) => {
    const c = await getContract();
    const tx = await c.verifyProperty(parcelId);
    return await tx.wait();
  }


  // Read-only functions
  const getProperty = async (parcelId: string) => {
    const c = await getContract();
    // Using the read-only provider for calls
    return c.getProperty(parcelId);
  };
  
  const getUserProperties = async (address: string) => {
     const c = await getContract();
     return c.getUserProperties(address);
  }

  return {
    contract,
    addProperty,
    markForSale,
    buyProperty,
    verifyProperty,
    getProperty,
    getUserProperties
  };
};
