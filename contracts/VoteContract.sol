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
        Poll storage p = polls.push();
        p.description = _description;
        p.endTime = block.timestamp + _duration;
        p.poll_type = _pollType;
        p.poll_metadata = _poll_metadata;

        for (uint256 i = 0; i < _optionNames.length; i++) {
            VotingOption option = new VotingOption(address(this), _optionNames[i], p.endTime, i);
            p.options.push(address(option));
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
}

