require('dotenv').config({ path: './.env.local' });

require('@nomiclabs/hardhat-ethers');

const { GOERLI_API_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.19',
  defaultNetwork: 'goerli',
  networks: {
    hardhat: {},
    goerli: {
      url: GOERLI_API_URL, // Your Goerli API URL
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};