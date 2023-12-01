pragma solidity ^0.8.0;
import "./VoteContract.sol";

contract VotingOption {
    address public mainContract;
    string public name;
    uint256 public endTime;
    uint256 public pollIndex; // Added to track the poll index

    event VoteCasted(address voter);

    constructor(address _mainContract, string memory _name, uint256 _endTime, uint256 _pollIndex) {
        mainContract = _mainContract;
        name = _name;
        endTime = _endTime;
        pollIndex = _pollIndex;
    }

    receive() external payable {
        require(msg.value == 0, "Cannot send ETH with vote");
        castVote();
    }

    function castVote() public {
        require(block.timestamp < endTime, "Poll has ended");
        require(msg.sender == tx.origin, "Invalid sender");
        VotingContract(mainContract).recordVote(msg.sender, pollIndex);
        emit VoteCasted(msg.sender);
    }
}
