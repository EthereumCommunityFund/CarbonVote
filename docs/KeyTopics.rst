.. This is a comment and will not appear in the document
.. Each reStructuredText file starts with a title

Key topics
==============

| Our vision is to bring Carbonvote, a powerful signaling and governance tool, to more communities. In the process, we will continue to optimize and improve the features we already have and will add more options of credentials for users to choose from. For the polling methods themselves, we are also considering adding more new polling methods. For example, we will give more weight to developers in a developer-related issue.
| In this section, we introduce some of the key topics of this project, on which we have had much discussion and often some disagreement within the group. We hope that these themes will inspire you and that you will provide us with some feedback.

1. Identity
----------------------------------

In the original Carbonvote, we can be given the number of Eths held by a given address. This correspondence is something we don't want in Carbonvote v2. To solve this problem, we use the mechanism of secret message, when voting, the system will generate a special secret message for the zero-value transaction which indicates the Eth held by that address, and the voter needs to add this secret message to the transfer so that there will no longer be a certain address corresponding to the number of Eth number corresponding to a certain address will no longer be available on the chain.

2. Voting Method
-------------------------

In order to create a more powerful signaling tool, we want to add more poll options to adjust more scenarios. For example, we plan to add these poll options in Carbonvote in the next step.

Quadratic Voting
^^^^^^^^^^^^^^^^^^^^

Each vote costs the square of the number of votes cast. The main advantage of this type of voting is that it strengthens the minority voice

Time-based Voting
^^^^^^^^^^^^^^^^^^^^^^^^^^^

Voting power is linked to the length of time someone holds a token or asset, rather than the quantity held. In this voting method, the votes of long-term participants have more impact, which can be seen as a reward for their long-term participation and contributions.

3. The storage of data
--------------------------------

There was a lot of discussion about where to store the data and structure, and the result was that we made both a Dapp and a back-end model to test and for the community to choose from.

4. Nested poll
--------------------------------

In a later update, we will allow a poll to be open to multiple credential groups, and to count the votes of each group individually, which will allow the poll to better reflect the views of different credential groups on the poll. Of course, each group can have more than one credential, and they can overlap with each other.

5.Off-chain Sinature
--------------------------------

@Petra