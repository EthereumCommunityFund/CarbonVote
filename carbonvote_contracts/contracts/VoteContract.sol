import "./VotingOption.sol";

pragma solidity ^0.8.0;

contract VotingContract {
    address signer_public_key = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    enum PollType {
        EthCount
    }

    event VoteChanged(address voter, uint256 pollIndex, uint256 optionIndex);
    event VoteRemoved(address voter, uint256 pollIndex, uint256 optionIndex);
    event VoteCasted(address voter, uint256 pollIndex, uint256 optionIndex);

    struct Poll {
        string description;
        string name;
        address[] options;
        uint256 endTime;
        mapping(address => bool) hasVoted;
        PollType poll_type;
        string poll_metadata;
        mapping(address => uint256) voterChoice; // New mapping to store voter's choice
        mapping(address => bool) isOption;
    }

    Poll[] public polls;

    function createPoll(
        string memory _name,
        string memory _description,
        uint256 _duration,
        string[] memory _optionNames,
        PollType _pollType,
        string memory _poll_metadata
    ) public {
        // Add a new Poll to the polls array and get its reference

        polls.push();
        Poll storage newPoll = polls[polls.length - 1];
        uint poll_index = polls.length - 1;
        // Set the properties of the new Poll
        newPoll.description = _description;
        newPoll.name = _name;
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
                VotingOption option = VotingOption(
                    payable(polls[_pollIndex].options[current_option_index])
                );
                option.removeVote(voter);
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
            string memory name,
            string memory description,
            address[] memory options,
            uint256 endTime,
            PollType pollType,
            string memory pollMetadata
        )
    {
        Poll storage poll = polls[_pollIndex];
        return (
            poll.name,
            poll.description,
            poll.options,
            poll.endTime,
            poll.poll_type,
            poll.poll_metadata
        );
    }

    function getMessageHash(
        string memory _message
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

    //  function verifyServerSignature(bytes32 messageHash, bytes memory signature) public view returns (bool, address) {
    //     address recoveredAddress = recoverSigner(messageHash, signature);
    //     return (recoveredAddress == signer_public_key, recoveredAddress);
    // }

    // function recoverSigner(bytes32 messageHash, bytes memory signature) internal pure returns (address) {
    //     (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
    //     return ecrecover(messageHash, v, r, s);
    // }
    // function splitSignature(bytes memory _sig) public pure returns (bytes32 r, bytes32 s, uint8 v) {
    //     require(_sig.length == 65, "Invalid signature length");
    //     assembly {
    //         r := mload(add(_sig, 32))
    //         s := mload(add(_sig, 64))
    //         v := byte(0, mload(add(_sig, 96)))
    //     }
    // }

    function verifyServerSignature(
        string memory message,
        bytes memory signature
    ) public view returns (bool, address) {
        bytes32 messageHash = prefixedHash(message);
        address recoveredAddress = recoverSigner(messageHash, signature);
        return (recoveredAddress == signer_public_key, recoveredAddress);
    }

    function recoverSigner(
        bytes32 messageHash,
        bytes memory signature
    ) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(signature);
        return ecrecover(messageHash, v, r, s);
    }

    function splitSignature(
        bytes memory _sig
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
    }

    function prefixedHash(
        string memory message
    ) internal pure returns (bytes32) {
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    messageHash
                )
            );
    }
}
