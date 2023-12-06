const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {

  const votingContract = await ethers.deployContract("VotingContract");
  // console.log(votingContract)

  await votingContract.waitForDeployment();



  console.log('VotingContract deployed to:', votingContract.target);

  await votingContract.createPoll(
    "formattedTitle",
    "formattedDescription",
    1,
    ["daf"],
    0,
    "da"
  );

  await votingContract.createPoll(
    "formattedTitle",
    "formattedDescription",
    1,
    ["daf"],
    0,
    "da"
  );

  await votingContract.createPoll(
    "formattedTitle",
    "formattedDescription",
    1,
    ["daf"],
    0,
    "da"
  );
  const addresses = {
    contract_addresses: { VotingContract: votingContract.target }
  };

  console.log(await votingContract.getAllPolls());
  const artifactsDir = path.join(__dirname, '../artifacts');
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir);
  }

  fs.writeFileSync(path.join(artifactsDir, 'deployedAddresses.json'), JSON.stringify(addresses, null, 2));


  // console.log(votingContract, await votingContract.owner());
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
