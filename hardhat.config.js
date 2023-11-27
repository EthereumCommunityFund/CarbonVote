require('dotenv').config({ path: './.env.local' });

require('@nomiclabs/hardhat-ethers');

const { API_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.19',
  defaultNetwork: 'volta',
  networks: {
    hardhat: {},
    volta: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
      gas: 210000000,
      gasPrice: 800000000000,
    },
  },
};
