pragma solidity ^0.8.0;
import "./VoteContract.sol";

contract VotingOption {
    address public mainContract;
    bytes32 name;
    uint256 public endTime;
    uint256 public pollIndex;
    uint256 public option_index;

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
        // emit VoteCasted(msg.sender);
    }
}
