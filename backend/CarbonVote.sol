// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";



contract Vote is Ownable {
    mapping(address => uint256) public voteWeights;
    mapping(address => bool) public hasVoted;
    // mapping(address => string) public secretMessages; // Mapping to store unique secret messages for each address
    mapping(address => bool) public hasVotedInCurrentTx;
    address[] public addressesWithWeight; 

    uint256 public totalVotes;
    uint256 public totalWeight;

    address public votingToken; 

    
    string[] public validSecretMessages;

    event VoteCast(address indexed voter, uint256 weight);
    event VoteChanged(address indexed voter, uint256 oldWeight, uint256 newWeight);
    event SecretMessageAdded(string secretMessage);

    

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted");
        require(!hasVotedInCurrentTx[msg.sender], "You have already voted in the current transaction");
        _;
    }

    modifier hasWeight() {
        require(voteWeights[msg.sender] > 0, "You don't have voting weight");
        _;
    }

    modifier hasMinimumBalance() {
        require(getTokenBalance(votingToken, msg.sender) > 0, "Insufficient balance");
        _;
    }

    modifier onlyWithValidSecretMessage(string memory providedSecretMessage) {
        require(isValidSecretMessage(providedSecretMessage), "Invalid secret message");
        _;
    }


    constructor(address _votingToken) {
        votingToken = _votingToken;

        // Initialize valid secret messages
        validSecretMessages = ["secret1", "secret2", "secret3"]; // secret messages
    }

    function vote(string memory providedSecretMessage) external hasNotVoted hasWeight onlyWithValidSecretMessage(providedSecretMessage) {
        hasVoted[msg.sender] = true;
        hasVotedInCurrentTx[msg.sender] = true;
        uint256 tokenBalance = getTokenBalance(votingToken, msg.sender);
        voteWeights[msg.sender] = tokenBalance;
        totalVotes += tokenBalance;
        totalWeight += tokenBalance;
        addressesWithWeight.push(msg.sender);

        emit VoteCast(msg.sender, tokenBalance);
    }

    

    function isValidSecretMessage(string memory providedSecretMessage) internal view returns (bool) {
        for (uint256 i = 0; i < validSecretMessages.length; i++) {
            if (keccak256(abi.encodePacked(validSecretMessages[i])) == keccak256(abi.encodePacked(providedSecretMessage))) {
                return true;
            }
        }
        return false;
    }

    function addSecretMessage(string memory newSecretMessage) external onlyOwner {
        require(!isValidSecretMessage(newSecretMessage), "Secret message already exists");
        validSecretMessages.push(newSecretMessage);
        emit SecretMessageAdded(newSecretMessage);
    }


    function delegate(address to, string memory providedSecretMessage) external hasNotVoted hasWeight onlyWithValidSecretMessage(providedSecretMessage) {
        require(to != msg.sender, "Cannot delegate to yourself");

        uint256 tokenBalance = getTokenBalance(votingToken, msg.sender);
        voteWeights[to] += tokenBalance;
        voteWeights[msg.sender] = 0;

        hasVoted[msg.sender] = true;
        addressesWithWeight.push(to);
        emit VoteCast(msg.sender, 0);
    }

    function changeVote(string memory providedSecretMessage) external hasWeight onlyWithValidSecretMessage(providedSecretMessage) {
        uint256 tokenBalance = getTokenBalance(votingToken, msg.sender);
        uint256 oldWeight = voteWeights[msg.sender];
        totalVotes = totalVotes - oldWeight + tokenBalance;
        totalWeight = totalWeight - oldWeight + tokenBalance;
        voteWeights[msg.sender] = tokenBalance;

        emit VoteChanged(msg.sender, oldWeight, tokenBalance);
    }

    function getTokenBalance(address token, address user) internal view returns (uint256) {
        return IERC20(token).balanceOf(user);
    }

   

    // Function to update the voting token address
    function updateVotingToken(address newToken) external onlyOwner {
        votingToken = newToken;
    }

   

    function setWeightFromTokenBalance() external hasNotVoted {
        uint256 balance = getTokenBalance(votingToken, msg.sender);
        voteWeights[msg.sender] = balance;

        
        emit VoteCast(msg.sender, balance);
        addressesWithWeight.push(msg.sender);
    }

    function getAddressesWithWeight() external view returns (address[] memory) {
        return addressesWithWeight;
    }
}










contract VoteF is Ownable {

    mapping(address => uint256) public voteWeights;
    mapping(address => bool) public hasVoted;
    mapping(address => bool) public hasVotedInCurrentTx;
    address[] public addressesWithWeight;

    uint256 public totalVotes;
    uint256 public totalWeight;

    address public votingToken;

    // Mapping to store the hash of each secret message
    mapping(bytes32 => bool) private validSecretMessagesHash;

    // Array to store the original secret messages (visible only to the owner)
    string[] private validSecretMessages;
    // string[] public validSecretMessages;

    event VoteCast(address indexed voter, uint256 weight);
    event VoteChanged(address indexed voter, uint256 oldWeight, uint256 newWeight);
    event SecretMessageAdded(string secretMessage);

    modifier onlyWithValidSecretMessage(string memory providedSecretMessage) {
        bytes32 messageHash = keccak256(abi.encodePacked(providedSecretMessage));
        require(validSecretMessagesHash[messageHash], "Invalid secret message");
        _;
    }

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted");
        require(!hasVotedInCurrentTx[msg.sender], "You have already voted in the current transaction");
        _;
    }

    modifier hasWeight() {
        require(voteWeights[msg.sender] > 0, "You don't have voting weight");
        _;
    }

    modifier hasMinimumBalance() {
        require(getTokenBalance(votingToken, msg.sender) > 0, "Insufficient balance");
        _;
    }



    constructor(address _votingToken) {
        votingToken = _votingToken;
    }

    function vote(string memory providedSecretMessage) external hasNotVoted hasWeight onlyWithValidSecretMessage(providedSecretMessage) {
        hasVoted[msg.sender] = true;
        hasVotedInCurrentTx[msg.sender] = true;
        uint256 tokenBalance = getTokenBalance(votingToken, msg.sender);
        voteWeights[msg.sender] = tokenBalance;
        totalVotes += tokenBalance;
        totalWeight += tokenBalance;
        addressesWithWeight.push(msg.sender);

        emit VoteCast(msg.sender, tokenBalance);
    }

    

    function delegate(address to, string memory providedSecretMessage) external hasNotVoted hasWeight onlyWithValidSecretMessage(providedSecretMessage) {
        require(to != msg.sender, "Cannot delegate to yourself");

        uint256 tokenBalance = getTokenBalance(votingToken, msg.sender);
        voteWeights[to] += tokenBalance;
        voteWeights[msg.sender] = 0;

        hasVoted[msg.sender] = true;
        addressesWithWeight.push(to);
        emit VoteCast(msg.sender, 0);
    }

    function changeVote(string memory providedSecretMessage) external hasWeight onlyWithValidSecretMessage(providedSecretMessage) {
        uint256 tokenBalance = getTokenBalance(votingToken, msg.sender);
        uint256 oldWeight = voteWeights[msg.sender];
        totalVotes = totalVotes - oldWeight + tokenBalance;
        totalWeight = totalWeight - oldWeight + tokenBalance;
        voteWeights[msg.sender] = tokenBalance;

        emit VoteChanged(msg.sender, oldWeight, tokenBalance);
    }

    function getTokenBalance(address token, address user) internal view returns (uint256) {
        return IERC20(token).balanceOf(user);
    }

   

    // Function to update the voting token address
    function updateVotingToken(address newToken) external onlyOwner {
        votingToken = newToken;
    }

   

    function setWeightFromTokenBalance() external hasNotVoted {
        uint256 balance = getTokenBalance(votingToken, msg.sender);
        voteWeights[msg.sender] = balance;

        
        emit VoteCast(msg.sender, balance);
        addressesWithWeight.push(msg.sender);
    }

    function getAddressesWithWeight() external view returns (address[] memory) {
        return addressesWithWeight;
    }

 

    // Other functions remain unchanged

    function addSecretMessage(string memory newSecretMessage) external onlyOwner {
        bytes32 messageHash = keccak256(abi.encodePacked(newSecretMessage));
        require(!validSecretMessagesHash[messageHash], "Secret message already exists");
        validSecretMessagesHash[messageHash] = true;
        validSecretMessages.push(newSecretMessage);
        emit SecretMessageAdded(newSecretMessage);
    }

    // Function to get the original secret messages (only visible to the owner)
    function getValidSecretMessages() external view onlyOwner returns (string[] memory) {
        return validSecretMessages;
    }
}





