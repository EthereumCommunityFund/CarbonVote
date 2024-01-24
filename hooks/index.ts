import { useQuery } from 'react-query';
import axios from 'axios';

const fetchAccountTransactions = async (accountAddress: string) => {
  const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_KEY;
  const apiUrl = `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${accountAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

  const response = await axios.get(apiUrl);

  return response.data.result;
};

const useAccountTransactions = (accountAddress: string) => {
  return useQuery(['accountTransactions', accountAddress], () => fetchAccountTransactions(accountAddress));
};

export default useAccountTransactions;
