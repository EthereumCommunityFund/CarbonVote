.. This is a comment and will not appear in the document
.. Each reStructuredText file starts with a title

Release notes 1.0 (Beta)
=============================

| The version 1.0 of Carbonvote mainly provide 2 different kinds of poll choice. EthHolding polls and HeadCounting polls. Users can create polls freely without login to any credential.
| To create a EthHolding poll, the creator needs to connect to his wallet to pay fees for the creation of a new poll on chain. After creating, voters can vote freely with their accounts by make a zero-value transaction on Sepolia. Voters can also make a direct zero-value transaction to given options's addresses to vote. The result of the poll will be displayed dynamically and the total amount of voter's Eth of each option will be displayed too.
| When creating a HeadCounting poll, a creator can choose one credential to limit the voters. In this case voters need to have corresponding credential to vote. In this beta version, we have 4 kinds of Credenitals:
| 1. Zupass credentials
| 2. Gitcoin passport credentials
| 3. Protocol guild members credential
| 4. Ethereum POAPS credentials
| For the details of these credentials, you could check the chapter 'Basic structure'

Release notes 1.1 (Beta)
=============================

| The version 1.1 of Carbonvote mainly provide 3 new features and new UI.
| We have added the 'Eth Solo Staker' credential.
| We have added the off-chain signature verification method for EthHolding and Protocol Guild Membership credentials.
| Now user can create a nested poll with multiple credentials to see opinions from different groups.
