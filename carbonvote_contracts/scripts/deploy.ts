const fs = require('fs');
const path = require('path');
const { ethers, upgrades } = require('hardhat');

async function main() {
  const VotingContract = await ethers.getContractFactory('VotingContract');
  const votingContract = await upgrades.deployProxy(VotingContract, { initializer: "initialize" });
  await votingContract.waitForDeployment();

  console.log('VotingContract deployed to:', votingContract.target);

  const addresses = {
    contract_addresses: { VotingContract: votingContract.target }
  };

  const artifactsDir = path.join(__dirname, '../artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }

  fs.writeFileSync(path.join(artifactsDir, 'deployedAddresses.json'), JSON.stringify(addresses, null, 2));


  console.log(votingContract, await votingContract.owner());
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
