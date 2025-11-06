import { useMemo } from 'react';
import { ethers } from 'ethers';
import getProvider from './getProvider';

const useProvider = (): ethers.JsonRpcProvider => {
  const provider = useMemo(() => getProvider(), []);

  return provider;
};

export default useProvider;
