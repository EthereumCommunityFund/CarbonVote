import "./VotingOption.sol";

pragma solidity ^0.8.0;

contract VotingContract {

    enum PollType { EthCount } 

    struct Poll {
        bytes32 description;
        address[] options;
        uint256 endTime;
        mapping(address => bool) hasVoted;
        PollType poll_type;
        bytes32 poll_metadata;
    }


    Poll[] public polls;
function createPoll(
    bytes32 _description, 
    uint256 _duration, 
    bytes32[] memory _optionNames,
    PollType _pollType,
    bytes32 _poll_metadata
) public {
    // Add a new Poll to the polls array and get its reference
    polls.push();
    Poll storage newPoll = polls[polls.length - 1];

    // Set the properties of the new Poll
    newPoll.description = _description;
    newPoll.endTime = block.timestamp + _duration;
    newPoll.poll_type = _pollType;
    newPoll.poll_metadata = _poll_metadata;

    // Initialize the options array within the Poll
    for (uint256 i = 0; i < _optionNames.length; i++) {
        VotingOption option = new VotingOption(address(this), _optionNames[i], newPoll.endTime, i);
        newPoll.options.push(address(option));
    }
}


    function vote(uint256 _pollIndex, uint256 _optionIndex) external {
        Poll storage poll = polls[_pollIndex];
        require(block.timestamp < poll.endTime, "Poll has ended");
        require(!poll.hasVoted[msg.sender], "Already voted");
        VotingOption option = VotingOption(payable(poll.options[_optionIndex]));
        option.castVote();
        poll.hasVoted[msg.sender] = true;
    }

       function recordVote(address voter, uint256 _pollIndex) public {
        require(msg.sender == address(polls[_pollIndex].options[0]) || msg.sender == address(polls[_pollIndex].options[1]), "Invalid option address");
        require(block.timestamp < polls[_pollIndex].endTime, "Poll has ended");
        require(!polls[_pollIndex].hasVoted[voter], "Already voted in this poll");
        polls[_pollIndex].hasVoted[voter] = true;
    }
    
    function getPoll(uint256 _pollIndex) public view returns (
    bytes32 description, 
    address[] memory options, 
    uint256 endTime, 
    PollType pollType, 
    bytes32 pollMetadata
) {
    Poll storage poll = polls[_pollIndex];
    return (
        poll.description, 
        poll.options, 
        poll.endTime, 
        poll.poll_type, 
        poll.poll_metadata
    );
}

}

