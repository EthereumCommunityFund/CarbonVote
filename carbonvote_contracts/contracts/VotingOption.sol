pragma solidity ^0.8.0;
import "./VoteContract.sol";

contract VotingOption {
    address public mainContract;
    bytes32 name;
    uint256 public endTime;
    uint256 public pollIndex;
    uint256 public option_index;
    address[] public voters;
    mapping(address => uint256) private voterIndex;
    mapping(address => bool) private hasVoted;

    // event VoteCasted(address voter);

    constructor(
        address _mainContract,
        bytes32 _name,
        uint256 _endTime,
        uint256 _pollIndex,
        uint256 _option_index
    ) {
        mainContract = _mainContract;
        name = _name;
        endTime = _endTime;
        pollIndex = _pollIndex;
        option_index = _option_index;
    }

    receive() external payable {
        require(msg.value == 0, "Cannot send ETH with vote");
        castVote();
    }

    function castVote() public {
        require(block.timestamp < endTime, "Poll has ended");
        VotingContract(mainContract).recordVote(
            msg.sender,
            pollIndex,
            option_index
        );

        if (!hasVoted[msg.sender]) {
            voters.push(msg.sender);
            voterIndex[msg.sender] = voters.length - 1;
        }
        hasVoted[msg.sender] = true;
    }

    function removeVote(address voter) public {
        require(msg.sender == mainContract, "You don't have access");
        require(hasVoted[voter], "No vote to remove");

        // if it only has one
        uint256 index = voterIndex[voter];
        require(index < voters.length, "Voter not found");

        uint256 lastIndex = voters.length - 1;
        if (index != lastIndex) {
            address lastVoter = voters[lastIndex];
            voters[index] = lastVoter;
            voterIndex[lastVoter] = index;
        }

        voters.pop();
        delete voterIndex[voter];
        hasVoted[voter] = false;
    }

    function removeVote(address voter) public {
        require(msg.sender == mainContract, "You don't have access");
        require(hasVoted[voter], "No vote to remove");

        // if it only has one
        uint256 index = voterIndex[voter];
        require(index < voters.length, "Voter not found");

        uint256 lastIndex = voters.length - 1;
        if (index != lastIndex) {
            address lastVoter = voters[lastIndex];
            voters[index] = lastVoter;
            voterIndex[lastVoter] = index;
        }

        voters.pop();
        delete voterIndex[voter];
        hasVoted[voter] = false;
    }
}
