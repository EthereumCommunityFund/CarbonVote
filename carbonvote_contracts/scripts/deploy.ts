// Import ethers from Hardhat package
const { ethers } = require('hardhat');

async function main() {
  // Retrieve the contract factory
  const VotingContract = await ethers.getContractFactory('VotingContract');

  // Deploy the contract
  const votingContract = await VotingContract.deploy();
  await votingContract.deployed();

  console.log('VotingContract deployed to:', votingContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
