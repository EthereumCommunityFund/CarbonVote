require('dotenv').config({ path: './.env.local' });

require('@nomiclabs/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');

// const { GOERLI_API_URL, PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [{ version: "0.8.0" },
    { version: "0.8.1" },
    { version: "0.8.20" },
      // ... add more versions as needed
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // goerli: {
    //   url: GOERLI_API_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    // },
  },
};
