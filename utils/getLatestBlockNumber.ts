'use client';

import getProvider from './getProvider';

export const getLatestBlockNumber = async () => {
  try {
    const provider = getProvider();
    const latestBlock = await provider.getBlock('latest');
    return latestBlock?.number;
  } catch (error) {
    console.error('Error getting blockNumber:', error);
  }
};
