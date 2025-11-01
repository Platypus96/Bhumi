import { useMemo } from 'react';
import { Contract } from 'ethers';
import { useWeb3 } from './use-web3';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/config/blockchain';

export const useBlockchain = () => {
  const { provider } = useWeb3();

  const contract = useMemo(() => {
    if (!provider) return null;
    
    // The signer is needed to sign transactions
    const signer = provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  }, [provider]);

  const getProperty = async (propertyId: string) => {
    // Read-only calls don't need a signer
    const readOnlyContract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    return readOnlyContract.getProperty(propertyId);
  };

  const registerProperty = async (parcelId: string, cid: string, hash: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.registerProperty(parcelId, cid, hash);
    return await tx.wait();
  };
  
  const initiateTransfer = async (propertyId: string, buyer: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.initiateTransfer(propertyId, buyer);
    return await tx.wait();
  };

  const approveTransfer = async (propertyId: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const tx = await contract.approveTransfer(propertyId);
    return await tx.wait();
  };


  return {
    contract,
    getProperty,
    registerProperty,
    initiateTransfer,
    approveTransfer
  };
};
