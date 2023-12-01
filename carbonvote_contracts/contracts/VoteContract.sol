import "./VotingOption.sol";

pragma solidity ^0.8.0;

contract VotingContract {
    enum PollType {
        EthCount
    }

    event VoteChanged(address voter, uint256 pollIndex, uint256 optionIndex);
    event VoteRemoved(address voter, uint256 pollIndex, uint256 optionIndex);
    event VoteCasted(address voter, uint256 pollIndex, uint256 optionIndex);

    struct Poll {
        bytes32 description;
        address[] options;
        uint256 endTime;
        mapping(address => bool) hasVoted;
        PollType poll_type;
        bytes32 poll_metadata;
        mapping(address => uint256) voterChoice; // New mapping to store voter's choice
        mapping(address => bool) isOption;
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
        uint poll_index = polls.length - 1;
        // Set the properties of the new Poll
        newPoll.description = _description;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.poll_type = _pollType;
        newPoll.poll_metadata = _poll_metadata;

        // Initialize the options array within the Poll
        for (uint256 i = 0; i < _optionNames.length; i++) {
            VotingOption option = new VotingOption(
                address(this),
                _optionNames[i],
                newPoll.endTime,
                poll_index,
                i
            );
            newPoll.options.push(address(option));
            newPoll.isOption[address(option)] = true;
        }
    }

    function vote(uint256 _pollIndex, uint256 _optionIndex) external {
        Poll storage poll = polls[_pollIndex];
        VotingOption option = VotingOption(payable(poll.options[_optionIndex]));
        option.castVote();
    }

    function recordVote(
        address voter,
        uint256 _pollIndex,
        uint256 _optionIndex
    ) public {
        require(
            polls[_pollIndex].isOption[msg.sender],
            "Caller is not a valid option for this poll"
        );
        require(block.timestamp < polls[_pollIndex].endTime, "Poll has ended");

        // Check if the voter is changing their vote
        if (polls[_pollIndex].hasVoted[voter]) {
            if (polls[_pollIndex].voterChoice[voter] != _optionIndex) {
                // Voter is changing their vote
                uint256 current_option_index = polls[_pollIndex].voterChoice[
                    voter
                ];
                emit VoteRemoved(voter, _pollIndex, current_option_index);
                emit VoteChanged(voter, _pollIndex, _optionIndex);
            }
            // Else, it's a re-vote for the same option (no need to emit VoteChanged)
        } else {
            // It's a new vote
            emit VoteCasted(voter, _pollIndex, _optionIndex);
        }

        // Update the voter's choice and mark them as having voted
        polls[_pollIndex].voterChoice[voter] = _optionIndex;
        polls[_pollIndex].hasVoted[voter] = true;
    }

    function getPoll(
        uint256 _pollIndex
    )
        public
        view
        returns (
            bytes32 description,
            address[] memory options,
            uint256 endTime,
            PollType pollType,
            bytes32 pollMetadata
        )
    {
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
