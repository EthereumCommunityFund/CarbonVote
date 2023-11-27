// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract YesNoVoting {
    // State variables to keep track of the votes
    uint256 public yesVotes;
    uint256 public noVotes;
    uint256 public abstainVotes;
    address public owner;
    mapping(address => bool) public hasVoted;

    // The description of the motion being voted on
    string public motionDescription;

    // Voting duration variables
    uint256 public votingStart;
    uint256 public votingEnd;

    // Modifier to check if the voting period is active
    modifier isVotingActive() {
        require(block.timestamp >= votingStart && block.timestamp <= votingEnd, "Voting is not active.");
        _;
    }

    // Modifier to check if the sender has not already voted
    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted.");
        _;
    }

    // Event to emit when a vote is cast
    event VoteCast(address indexed voter, string vote);

    constructor(string memory _motionDescription, uint256 _durationInMinutes) {
        motionDescription = _motionDescription;
        owner = msg.sender;
        votingStart = block.timestamp;
        votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    // Function to cast a vote
    function castVote(bool _voteYes, bool _abstain) public hasNotVoted isVotingActive {
        require(!_voteYes || !_abstain, "Cannot vote 'yes' and 'abstain' at the same time.");
        
        if(_voteYes) {
            yesVotes++;
            emit VoteCast(msg.sender, "Yes");
        } else if(_abstain) {
            abstainVotes++;
            emit VoteCast(msg.sender, "Abstain");
        } else {
            noVotes++;
            emit VoteCast(msg.sender, "No");
        }
        
        hasVoted[msg.sender] = true;
    }

    // Function to check if the voting is finished
    function isVotingFinished() public view returns (bool) {
        return block.timestamp > votingEnd;
    }
    
    // Only owner can see the results
    function getResults() public view returns (uint256 _yesVotes, uint256 _noVotes, uint256 _abstainVotes) {
        require(msg.sender == owner, "Only owner can see the results.");
        require(isVotingFinished(), "Voting is not finished yet.");
        
        return (yesVotes, noVotes, abstainVotes);
    }
}
