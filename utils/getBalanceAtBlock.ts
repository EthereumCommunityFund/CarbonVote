const ethers = require('ethers');
import { getProviderUrl } from '@/utils/getProviderUrl';

export const getBalanceAtBlock = async (address: string, blockNumber: number) => {
<<<<<<< HEAD
=======
    console.log("🚀 ~ getBalanceAtBlock ~ blockNumber:", blockNumber)
>>>>>>> 6e42a8b1c3191d06781e533ba97785c5be3f545b
    try {
        const providerUrl = getProviderUrl();
        const provider = new ethers.JsonRpcProvider(providerUrl);

        // Query the balance at the specific block number
        const balance = await provider.getBalance(address, blockNumber);
<<<<<<< HEAD

        return balance;
    } catch (error) {
        console.error(error);
=======
        return balance;
    } catch (error) {
        console.error('Error getBalanceAtBlock', error);
>>>>>>> 6e42a8b1c3191d06781e533ba97785c5be3f545b
        return error;
    }
}
