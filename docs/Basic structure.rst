.. This is a comment and will not appear in the document
.. Each reStructuredText file starts with a title

Basic structure
===================

Carbonvote is an application deployed on the web. It allows everyone to create polls freely and the results are displayed on the website in real time. There are two types of vote-counting methods, EthHolding and HeadCounting.
                                     

EthHolding Method
-------------------

EthHolding on-chain verification
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This method utilize a factory contracts to generate individual polls contracts. Like the original Carbonvote, this method dynamically calculates the ETH held by each voting address, and the entire process is based on the smart contracts and is 100% on-chain. When casting a vote, the ballots should be zero-valued to a specific address based on the options. In short, each options will have its own address. These addresses are only generated after the poll is created. After the transaction is completed, the voter's address is stored in the option's contract that receives the transaction. The total amount of ETH voted for the different options will be displayed on the website in real-time throughout the voting process.

EthHolding off-chain Signature verification (EIP-712)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This method utilize EIP-712 typed signatures to take account the votes. The most advantages of doing this way is that all voting process is completed free for voters, and creators don't need to pay for a contract creation fee. All the votes data will be stored on ipfs and displayed on the poll details page. Just as the on-chain verification, the total amount of ETH voted for the different options will be displayed on the website in real-time throughout the voting process.

HeadCounting Method
-----------------------

As the name of this method suggests, in this voting model, each voter’s vote has the same weight. The results of the poll are also displayed on the website in real-time just like EthCounting. While creating the poll, we also added the Credentials system.

Basic features
===================

Credential checking system
-----------------------------

| The upgrade of Carbonvote is reflected in the use of the credential system. We have added several credentials to serve the voting needs of various groups. We will be updating credentials in the coming updates, and for the foreseeable future, we will be offering users the possibility to import credentials themselves.
| We have already implemented the nested poll type, meaning that each poll can require multiple credentials, and voters with one corresponding credential can vote. In this kind of poll, a voter can vote multiple times for different options using different credentials. The final result will be displayed separately by credential.

Zupass credential 
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This credential corresponds to a voter with a Zupass. This larger item, it is divided into three smaller items: zuzalu ticket holders, zuconnect ticket holders, and Istanbul devconnect ticket holders. Users can create polls that require one of these three credentials, meaning that they must hold a specific ticket to vote. Because of the ZK login and authentication given by the Zupass team, Carbonvote v2 integrates well with Zupass and will continue to have access to Zupass tickets in the future.

Gitcoin Passport credential 
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This credential requires the user to have an authenticated Gitcoin passport to be able to vote. For now, we've set it to allow voting as long as the Gitcoin passport has a score of more than zero. In a future release, we will allow creators to set their thresholds for voting. The credential is verified using the API provided by Gitcoin Passport.

Ethereum Events POAPS credential 
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This is a special credential that requires the user's wallet address to have a certain number of Ethereum events POAPS to be able to vote. We also provide the option for the user to select Ethereum events freely.

Protocol Guild Membership Credential 
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This credential corresponds to the headcounting method since each vote has the same weight. However, since this credential requires that the user's address must be on the list of protocol guild members, to prove that the user owns the address and that the address is on the list at the same time, we chose provide two different approaches, the first one is the smart contract that is similar to EthHolding on-chain poll, and the second one is using EIP-712 off-chain signature verification.

Eth Solo Staker Credential
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Ether Solo Staker voters are individuals who stake their Ethereum (ETH) independently, without relying on a staking pool or service.