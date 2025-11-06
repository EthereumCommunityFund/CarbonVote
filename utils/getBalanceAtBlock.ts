import { ethers } from 'ethers';
import getProvider from './getProvider';

export const getBalanceAtBlock = async (
  address: string,
  blockNumber: number
): Promise<string> => {
  try {
    const provider = getProvider();
    const balance = await provider.getBalance(address, blockNumber);
    const balanceInEther = ethers.formatEther(balance);
    return balanceInEther;
  } catch (error) {
    console.error('Error getBalanceAtBlock', error);
    return '0';
  }
};
