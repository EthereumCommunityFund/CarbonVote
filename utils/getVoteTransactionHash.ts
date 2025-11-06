import {
  CONTRACT_ADDRESS,
  TOPIC_CASTVOTE,
  TOPIC_CHANGEVOTE,
} from '@/src/constants';
import getProvider from './getProvider';
export const getEthersLogs = async (address: string, pollId: number) => {
  const provider = getProvider();
  try {
    const fromBlockHex = '0x' + parseInt('1089604').toString(16);
    const toBlock = 'latest';
    let topic1 = '0x000000000000000000000000' + address.toLowerCase().slice(2);
    let topic2 = '0x' + pollId.toString(16).padStart(64, '0');

    const filter = {
      address: CONTRACT_ADDRESS,
      fromBlock: fromBlockHex,
      toBlock,
      topics: [TOPIC_CHANGEVOTE, topic1, topic2],
    };
    const logs = await provider.getLogs(filter);
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      return lastLog.transactionHash;
    } else {
      filter.topics[0] = TOPIC_CASTVOTE;
      const moreLogs = await provider.getLogs(filter);
      if (moreLogs.length > 0) {
        const lastLog = moreLogs[moreLogs.length - 1];
        return lastLog.transactionHash;
      }
    }
    return '';
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

export const getEthersLogsWithBlock = async (
  address: string,
  pollId: number,
  startBlock: number,
  endBlock: number | 'latest'
): Promise<string> => {
  const provider = getProvider();
  try {
    const fromBlockHex = '0x' + parseInt(startBlock.toString()).toString(16);
    const toBlock =
      endBlock === 'latest'
        ? 'latest'
        : '0x' + parseInt(endBlock.toString()).toString(16);

    let topic1 = '0x000000000000000000000000' + address.toLowerCase().slice(2);
    let topic2 = '0x' + pollId.toString(16).padStart(64, '0');

    const filter = {
      address: CONTRACT_ADDRESS,
      fromBlock: fromBlockHex,
      toBlock,
      topics: [TOPIC_CHANGEVOTE, topic1, topic2],
    };
    const logs = await provider.getLogs(filter);
    if (logs.length > 0) {
      const lastLog = logs[logs.length - 1];
      return lastLog.transactionHash;
    } else {
      filter.topics[0] = TOPIC_CASTVOTE;
      const moreLogs = await provider.getLogs(filter);
      if (moreLogs.length > 0) {
        const lastLog = moreLogs[moreLogs.length - 1];
        return lastLog.transactionHash;
      }
    }
    return '';
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};
