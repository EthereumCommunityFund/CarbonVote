const ethers = require('ethers');
import { getProviderUrl } from '@/utils/getProviderUrl';

export const getBalanceAtBlock = async (address: string, blockNumber: number) => {
    try {
        const providerUrl = getProviderUrl();
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);

        // Query the balance at the specific block number
        const balance = await provider.getBalance(address, blockNumber);

        // ethers.js returns balances in wei, convert it to ether
        const balanceInEth = ethers.utils.formatEther(balance);

        console.log(`Balance at block ${blockNumber}: ${balanceInEth} ETH`);
        return balance;
    } catch (error) {
        console.error(error);
        return error;
    }
}
