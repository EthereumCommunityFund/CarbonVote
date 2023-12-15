.. This is a comment and will not appear in the document
.. Each reStructuredText file starts with a title

Basic structure
===================
Carbonvote is an application deployed on the web. It allows everyone to create polls freely and the results are displayed on the website in real time. There are two types of polls, EthHolding and HeadCount.
                                     

EthHolding Method
-------------------

Like the original Carbonvote, this method dynamically calculates the ETH held by each voting address, and the entire process is based on smart contracts and is 100% on-chain. When casting a vote, the ballots should be zero-valued to a specific address based on the options. In short, the Yes and No options will be two addresses each. These addresses are only generated after the ballot is created. After the transaction is completed, the amount of ETH held by that address will count as Yes or No depending on the address to which the transaction is directed. The total amount of ETH voted for the different options will be displayed on the website in real-time throughout the voting process.

HeadCounting Method
-----------------------

As the name of this method suggests, in this voting model, each voter’s vote has the same weight. The results of the poll are also displayed on the website in real-time just like EthCounting. While creating the poll, we also added the Credentials system.

The Credentials system
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This system allows the voting to be restricted to a specific group of people. In the MVP phase, we only added Zupass and Gitcoin passports, but we’ll be expanding more. A poll can have multiple Credentials restrictions.

The storage of the data in HeadCounting Method 
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In response to the question of whether or not to store all of HeadCounting’s data on the chain, our team created two different models. The first is the Dapp model, which means putting everything on the chain. This has the benefit of being more decentralized and transparent, however, for the voter, it means paying a gas fee for each vote. The second is the traditional backend model, meaning that the data will be stored on our backend. This is much lower and simpler for all kinds of costs. In order to know which model is better, we would like the community to give us feedback after testing it.

The usage of secret messages
---------------------------------
(will add)