import { ethers, JsonRpcProvider } from 'ethers';
import { getProviderUrl } from '@/utils/getProviderUrl';

let provider: JsonRpcProvider;

function getProvider() {
  if (!provider) {
    const providerUrl = getProviderUrl();
    provider = new ethers.JsonRpcProvider(providerUrl);
  }
  return provider;
}

export default getProvider;
