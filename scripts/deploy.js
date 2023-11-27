// scripts/deploy.js

const hre = require('hardhat');

async function main() {
  // Retrieve the contract factory
  const YesNoVoting = await hre.ethers.getContractFactory('YesNoVoting');

  // Prepare the constructor arguments
  const motionDescription = 'The ice age should not be extended without at least some decrease in block rewards.';
  const durationInMinutes = 60; // For example, 60 minutes

  // Deploy the contract
  const yesNoVoting = await YesNoVoting.deploy(motionDescription, durationInMinutes);

  // Wait for the deployment to finish
  await yesNoVoting.deployed();

  console.log('YesNoVoting deployed to:', yesNoVoting.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
