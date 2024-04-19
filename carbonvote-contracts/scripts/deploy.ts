const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {
  const votingContract = await ethers.deployContract('VotingContract');
  // console.log(votingContract)
  try {
    await votingContract.waitForDeployment();
  } catch (error) {
    console.error('An error occurred during deployment:', error);
  }

  console.log('VotingContract deployed to:', votingContract.target);

  const addresses = {
    contract_addresses: { VotingContract: votingContract.target },
  };

  console.log(await votingContract.getAllPolls());
  const artifactsDir = path.join(__dirname, '../artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }

  fs.writeFileSync(
    path.join(artifactsDir, 'deployedAddresses.json'),
    JSON.stringify(addresses, null, 2)
  );

  // console.log(votingContract, await votingContract.owner());
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
  });
