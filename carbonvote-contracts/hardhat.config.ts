import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import { getProviderUrl } from '../utils/getProviderUrl';
import { ethers, run, network } from 'hardhat';

const config: HardhatUserConfig = {
  solidity: '0.8.20',
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    /*mainnet: {
      url: 'https://mainnet.infura.io/v3/01371fc4052946bd832c20ca12496243',
      accounts: [`0x`],
      gas: 5000000,
    },*/
  },
};

export default config;
