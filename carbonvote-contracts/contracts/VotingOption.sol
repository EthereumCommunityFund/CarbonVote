pragma solidity ^0.8.0;
import "./VoteContract.sol";

contract VotingOption {
    address public mainContract;
    string public name;
    uint256 public endTime;
    uint256 public pollIndex;
    uint256 public option_index;
    address[] public voters;
    mapping(address => uint256) private voterIndex;
    mapping(address => bool) private hasVoted;

    // event VoteCasted(address voter);

    constructor(
        address _mainContract,
        string memory _name,
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

    receive() external payable {}

    fallback() external payable {
        require(msg.value == 0, "Cannot send ETH with vote");
        (
            string memory message,
            bytes memory signature
        ) = decodeMessageAndSignature(msg.data);

        castVote(signature, message);
    }

    function castVote(bytes memory signature, string memory message) public {
        require(block.timestamp < endTime, "Poll has ended");
        VotingContract(mainContract).verifyAndRecordVote(
            msg.sender,
            pollIndex,
            option_index,
            signature,
            message
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

    function decodeMessageAndSignature(
        bytes memory data
    ) private pure returns (string memory, bytes memory) {
        // Decode the data assuming the first part is a string and the second part is bytes
        (string memory message, bytes memory signature) = abi.decode(
            data,
            (string, bytes)
        );
        return (message, signature);
    }
}
