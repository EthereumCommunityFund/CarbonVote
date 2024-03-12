import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getProviderUrl } from '@/utils/getProviderUrl';
/*export const useLatestBlock = (isEthHoldingPoll: boolean): number | null => {
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    if(isEthHoldingPoll){
    const providerUrl = getProviderUrl();
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const onNewBlock = (newBlockNumber: number) => {
      console.log(`New block: ${newBlockNumber}`);
      setBlockNumber(newBlockNumber);
    };
    provider.on('block', onNewBlock);
    return () => {
      provider.off('block', onNewBlock);
    };
  }
  }, [isEthHoldingPoll]);
  return blockNumber;
};*/
export const useLatestBlock = (isEthHoldingPoll: boolean, refreshCount: number): number | null => {
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  useEffect(() => {
    if (isEthHoldingPoll) {
      const fetchLatestBlock = async () => {
        const providerUrl = getProviderUrl();
        const provider = new ethers.JsonRpcProvider(providerUrl);
        try {
          const latestBlockNumber = await provider.getBlockNumber();
          console.log(`Latest block: ${latestBlockNumber}`);
          setBlockNumber(latestBlockNumber);
        } catch (error) {
          console.error('Error fetching latest block number:', error);
        }
      };

      fetchLatestBlock();
    }
  }, [isEthHoldingPoll, refreshCount]);

  return blockNumber;
};


