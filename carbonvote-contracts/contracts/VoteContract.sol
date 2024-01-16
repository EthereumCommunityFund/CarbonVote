pragma solidity ^0.8.0;
import "./VotingOption.sol";

contract VotingContract {
    address signer_public_key = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    enum PollType {
        EthCount,
        Protocol_Guild
    }

    event VoteChanged(address voter, uint256 pollIndex, uint256 optionIndex);
    event VoteRemoved(address voter, uint256 pollIndex, uint256 optionIndex);
    event VoteCasted(address voter, uint256 pollIndex, uint256 optionIndex);

    address[] public allowedVoters = [
    0xEB34BD135aFc3054667ca74C9d19fbCD7D05F79F,
    0x6591e7D655f248f6930195385C36b8D5Af679B8B,
    0x9Bee5b17Eb847744b6a81Ee935409739F91c722c,
    0x974B9cb3c122561e3bf6234651E0b82B88Fb9015,
    0xE9F19B6C72219f9B12C9c367405a90Ac9aFb2241,
    0x497f0D190C513f51eAC234628200a5E62271a7A5,
    0x8b49Fb41E0dF3ea3D01aD9d06501BB5a2257cCB0,
    0x797AbA41FD90740a2cA970d6706Af05aDe09335B,
    0xbB3F2F946E8eE2912830e365cF241293636cb057,
    0xdF6C53Df56f3992FC44195518A2d8B16306Af9ff,
    0x299cB850bD75C07ef89978Bdc52e062Cc4fA0250,
    0x8cbF722ADFBc071A12aAE158A12a68397578017c,
    0xBFbeaB0896E29d0Db26ad60278d3Ab3C482BB199,
    0xe019836A41CB707F79b991f60e241918097aC16e,
    0xF51fc4c6Ab075482b61F5C1d4E72fADaFf8815F3,
    0x3B16821A5dBBFF86E4a88eA0621EC6be016cd79A,
    0x376D5C3a16E9d015e8C584bB2d278E25F0ccb27B,
    0x9F60E4aF6020cc6a791B2d1Ce9902d25A72bA824,
    0x3212974a4E53E5238f6ea193B36412Db9AD61c26,
    0x6fFd2248Ab7E80ef51D7Eb4CB60964C830125567,
    0x00a2d2d22F456125d64Beda5A6f37273A13d9DE0,
    0x7c1c1C2DE344dcDd7db65E5D52C5E1Ea862C6139,
    0x8894e499d6359F3A7955736794Ca9a0D536109Be,
    0x1de6938d9f9ebd43D0Cc56f0CeF1657D954c9A94,
    0x0000006916a87b82333f4245046623b23794C65C,
    0x7e59Df833869E2997d05e163D6004f3344A052FA,
    0xf5441a1b900a1D93e4c06CB9c3fDbA39F01469f0,
    0xa87922d0074bCd82Ac82816633CcE68472548955,
    0x05618d6EFFe2E522F07B1dB692d47A68bfD6fFEa,
    0x75C7F1F73305BCF9f91222eff570D9c3C423e405,
    0x4B3105E9EC2B6069c1362388D429625a026f43e0,
    0xd20BebA9eFA30fB34aF93AF5c91C9a4d6854eAC4,
    0xdc871D2C0F92de79E5c1DAAeDDA1372e774f2eB6,
    0x50d5e44700c10873875b4E75C4c9396562D83bE1,
    0x6B29132ea388a308578c1d3Be068D0e4fc9915a2,
    0x24113fFB07189D1e6E169025A424B58C29522972,
    0x6E22A5e30088C8389dC725BbeaD5f0675334299f,
    0x10ab73AA48D686b7FD9ec9D50418a14DD23f6631,
    0xD4a3030b5f5e8DD4860d370C17E8576aE9951a2D,
    0x004f67dAbb603AAA58eD52641CCafF09C559704A,
    0x799681f9b9d7c55ed59f5a0f235cAb132Cde0a2B,
    0xb7A593EC62dc447eef23ea0e0B4d5144ac75ABC5,
    0xe05875F287C028901798aC2Dc8C22Ba908b8eF36,
    0x80Bb92f389591d353654ac5580baefF7d0d6e778,
    0xa29576F07eAaD050AeACbc89AC0518B62fe2F88E,
    0x92699d64C65c435D4a60E2ceEaEb931dB8B1cA09,
    0x50B6A164ca5673BC6c5bF5E6D9F31587180bf8E7,
    0x46cD90445349e64F895c403c23839e79eb4065e4,
    0xC6cA7c3427AD6B7a06fbED6D18C394E540E31814,
    0xf363C519F91E823184061e5BF28263262E2b9B8d,
    0x49Aa00072a7BA8a5639C43Fe9F6536820E6F5d57,
    0xa1D76553266fA8Ed3D143794a462aaFAdfC34f74,
    0x644177F8D79117c2b9C7596527642B3c2D05888E,
    0xb721c2e6640D963e99b37B6437ABAF6914A25A5e,
    0xBc11295936Aa79d594139de1B2e12629414F3BDB,
    0xbC349D1BEeE33c61F0395d1667E70056B4C869B9,
    0x9915C453cc779109013F1aF0c4639277e8257212,
    0x3eD7bf997b7A91e9e8aB9eE2F7ce983bd37D6392,
    0x5973D1af5c13168bdC85c6e78309272815995Ffb,
    0xC152fd31F285f6c0B3807070280595e7Ea713a7f,
    0xf71E9C766Cdf169eDFbE2749490943C1DC6b8A55,
    0xFf9977FB117a22254a8eB6c6CE8d3Dd671FA70DC,
    0x4d5083DD10F2a46F26f5583c6679f9F8D30aE850,
    0xCb8DC3beC7B659022aE0d3E9de17322F31e4AA7C,
    0xAb96014a7c078f09418Cf899Bf197CadFf023C16,
    0x2bf7b04F143602692bBDc3EcbeA68C2c65278eee,
    0x5AC41B7E73680a3E77B941fEE0BAD04F59c9bB7d,
    0x84f678A3e7BA8Fc817c32Ff10884D6FB20976114,
    0xe611a720778a5f6723d6b4866F84828504657181,
    0x86F34D8b98171281AB8bFe65C7e2718E4f002e35,
    0x9258D14Db5AE79De3717dfb5F03c3f0A6fC71999,
    0x0760E844e6f368ce73F1eEB917d37Db19375De3B,
    0x10c8597a5063A1648FfE13f54E996ba9bB3217B5,
    0x50122A5509F628e901F9c0238F0168833753239b,
    0xf0443945aD3BE9645382FC2537317dA97FEfF3A9,
    0x153afFb96Fcb60085Ee307996Bdd2df0183A3682,
    0x2D56Cd519540bE541A3261E22e95d6507F5504Ca,
    0x3210287ddEe6ece40d17A1F39799239b972A81F2,
    0x78ac9c2545850bEDbC076EB30ce7A6f0D74b395E,
    0x2fb858991668840ce34F331402E0b3C66db078AF,
    0x661b81d462D80786c442774F452464A8C627a20E,
    0x980a85ba6c2683e3509752dd3b4eB50165C0e65F,
    0xB7b93e217dd4E6E700E7362cB234d6258438D3b7,
    0x00cDD7Fc085c86D000c0D54b3CA6fE83A8a806e5,
    0x0906Eb682C6d12EdBE5e0A43E60068E1A7F8bea3,
    0x9e7fa612eb6E771B0E918D94A0d524D6666Fa07E,
    0xBEDaD5f3bB658CC67eFDc9e8C17e6A82C1193eF1,
    0xc66EFCcB88b3b7BdE6fC476d8cF139DD38075Ad7,
    0xe2A296b3d3AD4212b6030442e70419ff7B82FEE4,
    0x5abAdE91eD4B6d11b666280CaCb3E4A32898f39B,
    0x71c15691e243bE88220957C784053EF0E084440B,
    0x046Fb65722E7b2455012BFEBf6177F1D2e9738D9,
    0x3d5D2AC4fEcF16bb1651A445d5B17f977A823546,
    0x975D1040E93316917BD67dD32a02e1929F8aF8D3,
    0xEB8E7c90014565EEd8126110630eFa2d9CD6eBE4,
    0xEd46bFFd4b8237a9c7E08f55F0B410544f989813,
    0x2f38617c9D8fc5863c5B3DE855d76CFb0B7Ab676,
    0x4Bfa4639Cc1f4554122aBB930Aa897CDAe90d13b,
    0x8360470F1793C91c953be453fcA52CC63dfCb367,
    0xd31461D449fBFB88DD8D4E7D8fCcF79389f671E9,
    0x9b796F2de75772f1634D78A3AB23A03778D3702a,
    0x530ecA5D32C1bf2865327DF76f6dBc73dea1af5c,
    0x66EE965FfC43D985633D04A044B47B7Ba8952EE1,
    0x5E5EF2c688E6CE34A1d4b4771780716fE06848FA,
    0xc627a07F25c61244e0c72A2bCf52014015F469ff,
    0x232e6C4eb0882Fcf92865Dc1de98BcE2A56b6553,
    0x76097c0e5f2700592aa4132adb5eB59869364BD3,
    0x88cc2a9882Dd3462702e56DF1B438FaC6E203d4A,
    0x925F5d6cCdB04F56fBa1cdcAd92E4eBb0d421411,
    0xC5A004f720FB103BD6Eb5de362115eB4986F635E,
    0xE1d0a84957B652f36769340C38944f1B97cF3e5E,
    0x2FF65B929e7f3329E493501221e3C0C464667db2,
    0x7cC3E83CD74Df93FcC879EC7c905635eE6a6C233,
    0x3b864e8588EB3c1c84169aEd272dAe21734b93cA,
    0x456287fcC918525d664bB4F62C084BE4E85D019B,
    0xf1DF831EF8dea686508bB27252Ea86F72c012181,
    0x2D87c6679968a3A15b9B984a5d2C2ECe4B9cc7DC,
    0x5869C17c8934Ce9f674e88c7d4f8F94DCE193FCB,
    0xeF458C3fBC811912340D23AC5541839c7A7F3b08,
    0xf67c7315391F9712bF04cFB8A72D450f42F9F576,
    0x5baf47751b4eeE90d7F9fd5EB75c3aD4162421E4,
    0x784B5955Fe452c67be9c2f594C73C284f55771e7,
    0xB61384c05086576ebD647C9217Ce0765Bd748bA1,
    0x32323265D9F3Df331ccaCf7Bd11135aF14776b69,
    0xa1506f8DC05b1c22Ba23CBfd4625C68599196E91,
    0xa55F4583b49c8f4A85cC5cdFce503807098509FA,
    0x2952C5774fCcC6935Fe0F44Ed57c0E7B4ED94972,
    0x554dcBaF9D1df74c195490d64E37eC0FdfED3c90,
    0x579Fc2cd54b0cA848b180BBc8ACf45C54982eeC5,
    0x882337880eE78a7D32A069061994f619fd540F6d,
    0x9598CDBe860a1abD8863CFcdf1cfcd3E609c9eA9,
    0xA3fD150da53b9B6F65eBb8210552DA9d56c32Bec,
    0xab8b3647EF7FF66D2f38ee5eaEf2b158c4eb52A2,
    0xEB2FA209Be50FAe31948822b6AfD62292dD2463F,
    0xFeD50d730C07a85cEC48Ac586e0372D7D536Eef0,
    0x0CEFE7d96642a6A9e2c7E34ec1e431E4206D3a93,
    0x27f672013538c9BBbE87EEbE6335302F68684DEf,
    0x552D4145a79eC49Ad73Cf4aA413D0EBdf7fD0c96,
    0x5E1De79FC192618BBC85e62274b12aD0b48f6B3B,
    0x79a05a48F73c34638B716ad06EfF5bCEA3425084,
    0xC9187b5C81d63b289811A4fcb9AC7ADb7103639e,
    0xF821ec616fb20b8C53C043afe1122e5d4165A335,
    0x48b76905b18c7c80e895bda18061a0E6842794F6,
    0x78fC08517B0e7fD99F10afff5C3e07049Cd00989,
    0x31e4B877B9033fcc355aF129Fcd387031007BBf0,
    0x3ed9D598b2099d99e9e49B1697729027C67926d2,
    0xDE09E76D5A06523A85bEDADa647AA1A78D99d30C,
    0x6a5ec9D4a8E5bbb0F7fD04658E088B4c636d7F15,
    0x0aD5D1F88a6c27f1eA4e3f45bE0F4751baFc26C5,
    0x1faA4E309eA6DECE1aCC4D0e5Fe432e2c1148Ec2,
    0x3d981E55BF4b8Be8E0d6545E6bA6A140c2ab206A,
    0x9fb101BCd5C7BaEA48E29c45a3F0BD6caAf5709E,
    0x3d84a438Af72F6396785EEa97B32F903520e36C8,
    0x41fb20055464819f075025D77ddEb0151F85e248,
    0x909102B9a0005B92D0091EdE42C8016F93151Ad2,
    0xC582bf07f73a30dd10cc512E03a50C87383eEb91,
    0x14B44b350d3ae3147937Cc7689404E00dBc1DDdF,
    0x012ce20dF50768c8ddcD5Ecc1e9DCBb3cc7bE7fC,
    0x9192bDC7117A9A0cD989e6363928a26C938fB230,
    0xDdEEe68EA512b7e1Eb62E8B130eA4f67f94d377c,
    0x920a14B6dc0f657aF6054757B0520f334b37408A,
    0x71bE63f3384f5fb98995898A86B02Fb2426c5788];

    struct Poll {
        string description;
        string name;
        address[] options;
        uint256 endTime;
        mapping(address => bool) hasVoted;
        PollType poll_type;
        string poll_metadata;
        mapping(address => uint256) voterChoice;
        mapping(address => bool) isOption;
        uint256 startTime;
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
        newPoll.startTime = block.timestamp;

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

    function getPollType(uint256 _pollIndex) external view returns (PollType) {
    require(_pollIndex < polls.length, "Poll index out of bounds");
    return polls[_pollIndex].poll_type;
    }

    function isGuildMember(address voter) private view returns (bool) {
        for (uint i = 0; i < allowedVoters.length; i++) {
            if (allowedVoters[i] == voter) {
                return true;
            }
        }
        return false;
    }

    function vote(
        uint256 _pollIndex,
        uint256 _optionIndex,
        bytes memory signature,
        string memory message
    ) external {
        // Verify the signature
        (bool verified, ) = verifyServerSignature(message, signature);
        require(verified, "Signature verification failed");
        Poll storage poll = polls[_pollIndex];
        if (poll.poll_type == PollType.Protocol_Guild) {
            require(isGuildMember(msg.sender), "Voter is not allowed to vote in this poll.");}
        VotingOption option = VotingOption(payable(poll.options[_optionIndex]));
        option.castVote(msg.sender, signature, message);
    }

    function verifyAndRecordVote(
        address voter,
        uint256 _pollIndex,
        uint256 _optionIndex,
        bytes memory signature,
        string memory message
    ) external {
        // Verify the signature first
        (bool verified, address recoveredAddress) = verifyServerSignature(
            message,
            signature
        );
        require(verified, "Signature verification failed");
        require(
            recoveredAddress == signer_public_key,
            "Signature cannot be verified"
        );

        // Then record the vote
        recordVote(voter, _pollIndex, _optionIndex);
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
            string memory pollMetadata,
            uint256 startTime
        )
    {
        Poll storage poll = polls[_pollIndex];
        return (
            poll.name,
            poll.description,
            poll.options,
            poll.endTime,
            poll.poll_type,
            poll.poll_metadata,
            poll.startTime
        );
    }

    function getAllPolls()
        public
        view
        returns (
            string[] memory names,
            string[] memory descriptions,
            address[][] memory options,
            uint256[] memory endTimes,
            PollType[] memory pollTypes,
            string[] memory pollMetadatas,
            uint256[] memory startTimes
        )
    {
        uint256 pollCount = polls.length;
        names = new string[](pollCount);
        descriptions = new string[](pollCount);
        options = new address[][](pollCount);
        endTimes = new uint256[](pollCount);
        pollTypes = new PollType[](pollCount);
        pollMetadatas = new string[](pollCount);
        startTimes = new uint256[](pollCount);

        for (uint256 i = 0; i < pollCount; i++) {
            Poll storage poll = polls[i];
            names[i] = poll.name;
            descriptions[i] = poll.description;
            options[i] = poll.options;
            endTimes[i] = poll.endTime;
            pollTypes[i] = poll.poll_type;
            pollMetadatas[i] = poll.poll_metadata;
            startTimes[i] = poll.startTime;
        }

        return (
            names,
            descriptions,
            options,
            endTimes,
            pollTypes,
            pollMetadatas,
            startTimes
        );
    }

    function getMessageHash(
        string memory _message
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

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