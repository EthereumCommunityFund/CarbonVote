'use client';
const { ethers } = require("ethers");
import { getProviderUrl } from '@/utils/getProviderUrl';

export const getLatestBlockNumber = async () => {
    const providerUrl = getProviderUrl();
    //const provider = new ethers.providers.JsonRpcProvider(getProviderUrl());
    const provider = new ethers.JsonRpcProvider(providerUrl);
    // Get the latest block
    try {
        const latestBlock = await provider.getBlock("latest");
        return latestBlock.number;
    }
    catch (error) {
        console.error('Error getting blockNumber:', error);
    }

}