// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// File: @openzeppelin/contracts/utils/introspection/IERC165.sol
pragma solidity ^0.8.0;
/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// File: @openzeppelin/contracts/token/ERC721/IERC721.sol
pragma solidity ^0.8.0;
/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721 is IERC165 {
    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Returns the number of tokens in ``owner``'s account.
     */
    function balanceOf(address owner) external view returns (uint256 balance);

    /**
     * @dev Returns the owner of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function ownerOf(uint256 tokenId) external view returns (address owner);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be have been allowed to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev Transfers `tokenId` token from `from` to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev Gives permission to `to` to transfer `tokenId` token to another account.
     * The approval is cleared when the token is transferred.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {Approval} event.
     */
    function approve(address to, uint256 tokenId) external;

    /**
     * @dev Returns the account approved for `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function getApproved(uint256 tokenId) external view returns (address operator);

    /**
     * @dev Approve or remove `operator` as an operator for the caller.
     * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
     *
     * Requirements:
     *
     * - The `operator` cannot be the caller.
     *
     * Emits an {ApprovalForAll} event.
     */
    function setApprovalForAll(address operator, bool _approved) external;

    /**
     * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
     *
     * See {setApprovalForAll}
     */
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;
}


contract Vote is Ownable {
    mapping(address => uint256) public voteWeights;
    mapping(address => bool) public hasVoted;

    uint256 public totalVotes;
    uint256 public totalWeight;

    address public votingToken; // Address of the ERC-20 token used for voting

    // Define the addresses of the NFT contracts
    address public devConnectNFTAddress = 0x7B7D4aFD5E5394387574D97954f86C221ABF4b3b; // DevConnect NFT contract address
    address public zupassNFTAddress = 0x188042A7bF87522Ce40A55C8131E5d850dDbB657;     // Zupass NFT contract address

    event VoteCast(address indexed voter, uint256 weight);

    modifier hasNotVoted() {
        require(!hasVoted[msg.sender], "You have already voted");
        _;
    }

    modifier hasWeight() {
        require(voteWeights[msg.sender] > 0, "You don't have voting weight");
        _;
    }

    modifier hasMinimumBalance(uint256 minBalance) {
        require(getTokenBalance(votingToken, msg.sender) >= minBalance, "Insufficient balance");
        _;
    }

    modifier hasNFTOwnership(address nftContract, uint256 tokenId) {
        require(hasOwnershipOfNFT(nftContract, tokenId, msg.sender), "You don't own the required NFT");
        _;
    }

    constructor(address _votingToken) {
        votingToken = _votingToken;
    }

    function delegate(address to) external hasNotVoted {
        require(to != msg.sender, "Cannot delegate to yourself");

        voteWeights[to] += voteWeights[msg.sender];
        voteWeights[msg.sender] = 0;

        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender, 0);
    }

    function vote(uint256 weight) external hasNotVoted hasWeight {
        hasVoted[msg.sender] = true;
        voteWeights[msg.sender] = weight;
        totalVotes += weight;
        totalWeight += weight;

        emit VoteCast(msg.sender, weight);
    }

    function getTokenBalance(address token, address user) internal view returns (uint256) {
        return IERC20(token).balanceOf(user);
    }

    function setWeightFromTokenBalance(uint256 minBalance) external hasNotVoted hasMinimumBalance(minBalance) {
        uint256 balance = getTokenBalance(votingToken, msg.sender);
        voteWeights[msg.sender] += balance;

        hasVoted[msg.sender] = false;
        emit VoteCast(msg.sender, balance);
    }

    function hasOwnershipOfNFT(address nftContract, uint256 tokenId, address user) internal view returns (bool) {
        return IERC721(nftContract).ownerOf(tokenId) == user;
    }

    function setWeightFromNFTOwnershipDev(uint256 tokenId) external hasNotVoted hasNFTOwnership(devConnectNFTAddress, tokenId) {
        // Increase the voting weight by 50 for owning the specified NFT
        voteWeights[msg.sender] += 50 ether;
        hasVoted[msg.sender] = false;
        emit VoteCast(msg.sender, 50 ether);
    }

    function setWeightFromNFTOwnershipZu(uint256 tokenId) external hasNotVoted hasNFTOwnership(zupassNFTAddress, tokenId) {
        voteWeights[msg.sender] += 10 ether;
        hasVoted[msg.sender] = false;
        emit VoteCast(msg.sender, 10 ether);
    }

    // Function to update the voting token address
    function updateVotingToken(address newToken) external {
        require(msg.sender == owner(), "Only the owner can update the voting token");
        votingToken = newToken;
    }
}
