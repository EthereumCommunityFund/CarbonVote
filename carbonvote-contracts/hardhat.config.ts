import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // goerli: {
    //   url: GOERLI_API_URL,
    //   accounts: [`0x${PRIVATE_KEY}`],
    // },
  },
};

export default config;
