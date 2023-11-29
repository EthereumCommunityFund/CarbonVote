// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Poll {
    address public owner;
    string public question;
    mapping(uint256 => uint256) public votes;
    mapping(address => bool) public hasVoted;
    uint256 public totalVotes;
    bool public isOpen;
    uint256 public pollEndTime;

    event Voted(address indexed voter, uint256 option);
    event PollClosed();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can execute this");
        _;
    }

    modifier pollOpen() {
        require(isOpen, "The poll is closed");
        require(block.timestamp < pollEndTime, "The poll has ended");
        _;
    }

    constructor(string memory _question, uint256 _durationInMinutes) {
        owner = msg.sender;
        question = _question;
        isOpen = true;
        pollEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    function vote(uint256 option) external pollOpen {
        require(!hasVoted[msg.sender], "You have already voted");
        require(option > 0 && option <= 5, "Invalid option");

        votes[option]++;
        hasVoted[msg.sender] = true;
        totalVotes++;

        emit Voted(msg.sender, option);
    }

    function closePoll() external onlyOwner {
        require(block.timestamp >= pollEndTime, "Cannot close the poll before it ends");
        isOpen = false;
        emit PollClosed();
    }

    function resetPoll(string memory _question, uint256 _durationInMinutes) external onlyOwner {
        require(!isOpen, "Cannot reset the poll while it's open");
        
        question = _question;
        isOpen = true;
        totalVotes = 0;

        // Extend the poll duration if needed
        if (block.timestamp < pollEndTime) {
            pollEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
        } else {
            pollEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
        }
    }
}







contract RegularPoll {
    address public admin;
    address public creator;
    string public question;
    mapping(uint256 => uint256) public votes;
    mapping(address => bool) public hasVoted;
    uint256 public totalVotes;
    bool public isOpen;
    uint256 public pollEndTime;
    uint256 public numOptions;

    event Voted(address indexed voter, uint256 option);
    event PollClosed();
    event PollCreated(string newQuestion, uint256 newDuration, uint256 newNumOptions);

    uint256 constant public MAX_QUESTION_LENGTH = 2000;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can execute this");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only the creator can execute this");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == admin || msg.sender == creator, "Only the admin or creator can execute this");
        _;
    }

    modifier pollOpen() {
        require(isOpen, "The poll is closed");
        require(block.timestamp < pollEndTime, "The poll has ended");
        _;
    }

    constructor() {
        admin = msg.sender;
        creator = address(0); 
    }

    function setCreator(address _creator) external onlyAdmin {
        creator = _creator;
    }

    function createPoll(string memory _question, uint256 _durationInMinutes, uint256 _numOptions) external onlyCreator {
        require(bytes(_question).length <= MAX_QUESTION_LENGTH, "Question exceeds maximum character limit");
        require(_numOptions > 0, "Number of options must be greater than 0");

        question = _question;
        isOpen = true;
        totalVotes = 0;
        pollEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
        numOptions = _numOptions;

        emit PollCreated(_question, _durationInMinutes, _numOptions);
    }

    function vote(uint256 option) external pollOpen {
        require(!hasVoted[msg.sender], "You have already voted");
        require(option > 0 && option <= numOptions, "Invalid option");

        votes[option]++;
        hasVoted[msg.sender] = true;
        totalVotes++;

        emit Voted(msg.sender, option);
    }

    function closePoll() external onlyOwner {
        require(block.timestamp >= pollEndTime, "Cannot close the poll before it ends");
        isOpen = false;
        emit PollClosed();
    }

    function resetPoll(string memory _question, uint256 _durationInMinutes, uint256 _numOptions) external onlyOwner {
        require(!isOpen, "Cannot reset the poll while it's open");
        require(bytes(_question).length <= MAX_QUESTION_LENGTH, "Question exceeds maximum character limit");
        require(_numOptions > 0, "Number of options must be greater than 0");

        question = _question;
        isOpen = true;
        totalVotes = 0;
        pollEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
        numOptions = _numOptions;
    }
}