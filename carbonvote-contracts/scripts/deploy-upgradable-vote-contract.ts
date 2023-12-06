const { upgrades } = require('hardhat');

async function main(): Promise<void> {
  const Box = await ethers.getContractFactory('VotingContract');
  console.log('Deploying Voting Contract');
  const votingContract = await upgrades.deployProxy(Box, [42], { initializer: 'store' });
  await votingContract.deployed();
  console.log('Box deployed to:', votingContract.address);
}