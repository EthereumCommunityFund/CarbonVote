const { ethers } = require("ethers");
import { getProviderUrl } from '@/utils/getProviderUrl';

export const getLatestBlockNumber = async () => {
    const providerUrl = getProviderUrl();
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    // Get the latest block
    const latestBlock = await provider.getBlock("latest");

    return latestBlock;
}