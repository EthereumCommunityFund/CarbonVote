import axios from 'axios';
import {
  CONTRACT_ADDRESS,
  TOPIC_CASTVOTE,
  TOPIC_CHANGEVOTE,
} from '@/src/constants';
import { last } from 'lodash';
import { throttle } from 'lodash';

export const getEtherscanLogs = async (address: string, pollId: number) => {
  try {
    const fromBlock = '1089604';
    const toBlock = 'latest';
    let topic1 = '0x000000000000000000000000' + address.toLowerCase().slice(2);
    let topic2 = '0x' + pollId.toString(16).padStart(64, '0');
    const response = await axios.get(`https://api-sepolia.etherscan.io/api`, {
      params: {
        module: 'logs',
        action: 'getLogs',
        fromBlock,
        toBlock,
        address: CONTRACT_ADDRESS,
        topic0: TOPIC_CHANGEVOTE,
        topic1: topic1,
        topic2: topic2,
        apikey: process.env.Etherscan_API_KEY,
      },
      headers: {
        accept: 'application/json',
      },
    });

    console.log(response.data,'response data');
    if (response.data.result.length > 0) {
      const lastLog = response.data.result[response.data.result.length - 1];
      return lastLog.transactionHash;
    } else {
      const response = await axios.get(`https://api-sepolia.etherscan.io/api`, {
        params: {
          module: 'logs',
          action: 'getLogs',
          fromBlock,
          toBlock,
          address: CONTRACT_ADDRESS,
          topic0: TOPIC_CASTVOTE,
          topic1: topic1,
          topic2: topic2,
          apikey: process.env.Etherscan_API_KEY,
        },
        headers: {
          accept: 'application/json',
        },
      });
      return response.data.result.transactionHash;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error calling Etherscan API:', error.message);
      throw new Error(`Error calling Etherscan API: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
      throw new Error(`Unexpected error: ${error}`);
    }
  }
};
