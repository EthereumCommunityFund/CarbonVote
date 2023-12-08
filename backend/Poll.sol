// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;



contract RegularPoll {
    address public admin;
    string public question;
    string public pollDescription;
    mapping(uint256 => uint256) public votes;
    mapping(address => bool) public hasVoted;
    bool public isOpen;
    uint256 public pollEndTime;
    uint256 public numOptions;

    event Voted(address indexed voter, uint256 option);
    event PollClosed();
    event PollCreated(string newQuestion, string newPollDescription, uint256 newDuration, uint256 newNumOptions);

    uint256 constant public MAX_QUESTION_LENGTH = 100;
    uint256 constant public MAX_DESCRIPTION_LENGTH = 2000;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can execute this");
        _;
    }

    modifier pollOpen() {
        require(isOpen, "The poll is closed");
        require(block.timestamp < pollEndTime, "The poll has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createPoll(string memory _question, string memory _pollDescription, uint256 _durationInMinutes, uint256 _numOptions) external {
        require(bytes(_question).length <= MAX_QUESTION_LENGTH, "Question exceeds maximum character limit");
        require(bytes(_pollDescription).length <= MAX_DESCRIPTION_LENGTH, "Poll description exceeds maximum character limit");
        require(_numOptions > 0, "Number of options must be greater than 0");

        question = _question;
        pollDescription = _pollDescription;
        isOpen = true;
        pollEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
        numOptions = _numOptions;

        emit PollCreated(_question, _pollDescription, _durationInMinutes, _numOptions);
    }

    function vote(uint256 option) external pollOpen {
        require(!hasVoted[msg.sender], "You have already voted");
        require(option > 0 && option <= numOptions, "Invalid option");

        votes[option]++;
        hasVoted[msg.sender] = true;

        emit Voted(msg.sender, option);
    }

    function closePoll() external onlyAdmin {
        require(block.timestamp >= pollEndTime, "Cannot close the poll before it ends");
        isOpen = false;
        emit PollClosed();
    }
}
