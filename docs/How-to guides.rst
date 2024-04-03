.. This is a comment and will not appear in the document
.. Each reStructuredText file starts with a title

How-to guides
==============

   

Create a poll
-----------------------------

By choosing ‘Create a poll’ on the main page, you can enter the interface of poll creation. 

Create an unique EthHolding-credential poll
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If you want to create an EthHolding poll, you can’t set any credential checking or access rules to it. This method will display the total amount of eth represented by each option in real-time. When the poll’s deadline is reached, the poll will close and give the final result.

Create a HeadCounting poll
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If you want to create a HeadCounting poll, you can restrict the people who can participate by choosing the credentials checking. For example, if you choose ‘Add ZuPass Credentials’, it means that only users who hold a Zupass can vote. If you have chosen 2 access rules, meaning a Gitcoin Passport credential and Zupass Credential at the same time, it means this poll is for voters who have a Gitcoin Passport or a Zupass.

Vote for a poll
-----------------------

As a user, you can vote as many polls as you want if you have the right credentials to participate. You should notice that when you vote in an EthHolding poll, you should have a Web3 wallet in order to make a zero-value transaction or an off-chain signature depends on the verification type.