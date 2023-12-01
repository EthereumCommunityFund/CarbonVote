import "./VotingOption.sol";

pragma solidity ^0.8.0;

contract VotingContract {

        enum PollType { EthCount } 

    struct Poll {
        string description;
        address[] options;
        uint256 endTime;
        mapping(address => bool) hasVoted;
        PollType poll_type;
    }


    Poll[] public polls;

    function createPoll(
        string memory _description, 
        uint256 _duration, 
        string[] memory _optionNames,
         PollType _pollType
    ) public {
        Poll storage p = polls.push();
        p.description = _description;
        p.endTime = block.timestamp + _duration;
        p.poll_type = _pollType;

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

