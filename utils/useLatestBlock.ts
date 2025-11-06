import { useEffect, useState } from 'react';
import getProvider from './getProvider';

export const useLatestBlock = (
  isEthHoldingPoll: boolean,
  refreshCount: number
): number | null => {
  const [blockNumber, setBlockNumber] = useState<number | null>(null);

  const provider = getProvider();

  useEffect(() => {
    if (isEthHoldingPoll) {
      const fetchLatestBlock = async () => {
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
  }, [isEthHoldingPoll, refreshCount, provider]);

  return blockNumber;
};
