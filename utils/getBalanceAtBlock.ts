const ethers = require('ethers');
import { getProviderUrl } from '@/utils/getProviderUrl';

export const getBalanceAtBlock = async (address: string, blockNumber: number) => {
    console.log("🚀 ~ getBalanceAtBlock ~ blockNumber:", blockNumber)
    try {
        const providerUrl = getProviderUrl();
        const provider = new ethers.JsonRpcProvider(providerUrl);

        // Query the balance at the specific block number
        const balance = await provider.getBalance(address, blockNumber);
        return balance;
    } catch (error) {
        console.error('Error getBalanceAtBlock', error);
        return error;
    }
}
