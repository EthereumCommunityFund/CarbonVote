import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    /*sepolia: {
      url: process.env.SEPOLIA_API_URL,
      accounts: [`0x${process.env.PRIVATE_SEPOLIA_KEY}`],
    },*/
  },
};

export default config;
