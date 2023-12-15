.. This is a comment and will not appear in the document
.. Each reStructuredText file starts with a title

Introduction of Carbonvote V2
=================================

Carbonvote V2 is a hackathon project, the goal is to recreate to update Carbonvote, in order to create a community governance tool for communities.                  

The interest in updating Carbonvote
---------------------------------------

Governance is hard. While Carbonvote presents an important approach that represents decentralized community governance, its per-voter-eth number counting approach doesn't work for all types of community issues, which is why we want to upgrade Carbonvote as a tool and make it possible for it to interact with more communities and participate in more community governance. 

The existing problem with Carbonvote V1
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

1. Non-Representativeness
""""""""""""""""""""""""""""""""""""""""

The initial version of Carbonvote was limited by its single voting technology approach, resulting in a non-representative nature. This means that the decentralized community itself and its members may collide with other users. For example, the store-of-value use ("holding") and medium-of-exchange use ("buying coffees") are naturally in conflict, as the store-of-value prioritizes security much more than the medium-of-exchange use case, which values usability more strongly. In this context, facing complex and changing community governance issues, the singular voting counting rules need to be changed.

2. Game-Theoretic Attacks
""""""""""""""""""""""""""""""""""""""""

In any vote, the probability that any given voter will have an impact on the result is tiny, and so the personal incentive that each voter has to vote correctly is almost insignificant. And if each person’s size of the stake is small, their incentive to vote correctly is insignificantly squared.

3. Low participation
""""""""""""""""""""""""""""""""""""""""

The DAO Carbonvote only had a voter participation rate of 4.5%.

The solution given by Carbonvote V2
---------------------------------------

To solve the problem of low participation and Game-Theoretic attacks, we introduced the Headcounting solution. this is a one-person-one-vote vote counting method, where the weight of the vote is no longer dependent on the ETH of the holding, which can effectively increase the voting power and participation of low ETH holders. On top of that, we also added a Credentials system, which means that the creator of a poll can select a specific group of people to participate in the poll. This is useful for solving the problem of non-representativeness, where the smaller the group of voters, the more likely it is that each voter is relevant to the problem. [TL;DR]

The HeadCounting Method
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In terms of structure, in addition to the traditional counting of votes by ETH Holding per address (which we also call the EthHolding Method), we have added the HeadCounting Method, which counts votes by number of people. In this voting method, the value of a vote is not determined by the number of tokens held. This method gives all voters the same vote weight, and so on some level, it could add to the participation rate because even though the voter doesn’t hold a lot of ETH, his vote has the same value as all voters.

The Credentials checking system
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

When creating a poll, Carbonvote V2 allows the creator to choose the restrictions he wants for credentials. For example, the creator can restrict the poll to only those who have a Zupass. At this stage, due to time constraints, we will temporarily narrow it down to a limited selection of Zupass, Gitcoin Passport, and so on. Note that the same poll can have more than one credentials restriction. We think that this credential system could help some governance problems. By limiting the voters who can participate, the poll itself could be more representative of the voters.