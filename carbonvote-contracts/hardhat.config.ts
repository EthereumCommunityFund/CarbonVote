import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import { getProviderUrl } from '../utils/getProviderUrl';
const config: HardhatUserConfig = {
  solidity: '0.8.20',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    /*sepolia: {
      url: getProviderUrl(),
      accounts: [`0x`],
    },*/
  },
};

export default config;
