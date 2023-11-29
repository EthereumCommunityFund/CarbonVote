// scripts/deploy.js

const hre = require('hardhat');

async function main() {
  // Retrieve the Contract Factory which provides a way to deploy new smart contracts.
  const RegularPoll = await hre.ethers.getContractFactory('RegularPoll');

  // Deploy the contract
  const regularPoll = await RegularPoll.deploy();

  // Wait for the deployment to finish
  await regularPoll.deployed();

  console.log('RegularPoll deployed to:', regularPoll.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
