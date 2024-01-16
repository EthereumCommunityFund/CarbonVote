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

    fallback() external payable {}

    receive() external payable {
        require(msg.value == 0 && isAllowedToReceive(), "Cannot send ETH with vote");
        castTransactionVote(msg.sender);
    }

    function isAllowedToReceive() private view returns (bool) {
        VotingContract main = VotingContract(mainContract);
        VotingContract.PollType pollType = main.getPollType(pollIndex);
        if (pollType == VotingContract.PollType.Protocol_Guild) {
            return false;
        }
        return true;
    }

    function castVote(address voter, bytes memory signature, string memory message) public {
        require(block.timestamp < endTime, "Poll has ended");
        VotingContract(mainContract).verifyAndRecordVote(
            voter,
            pollIndex,
            option_index,
            signature,
            message
        );

        if (!hasVoted[voter]) {
            voters.push(voter);
            voterIndex[voter] = voters.length - 1;
        }
        hasVoted[voter] = true;
    }

    function castTransactionVote(address voter) public {
        require(block.timestamp < endTime, "Poll has ended");
        VotingContract(mainContract).recordVote(            
            voter,
            pollIndex,
            option_index);

        if (!hasVoted[voter]) {
            voters.push(voter);
            voterIndex[voter] = voters.length - 1;
        }
        hasVoted[voter] = true;
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
    function getVotersCount() public view returns (uint256) {
    return voters.length;
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