const contractAddress = '0x14E7DdF1409A2FD27E9b74CEA90F171F344f8802';

const contractAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'voter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'pollIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'optionIndex',
        type: 'uint256',
      },
    ],
    name: 'VoteCasted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'voter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'pollIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'optionIndex',
        type: 'uint256',
      },
    ],
    name: 'VoteChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'voter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'pollIndex',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'optionIndex',
        type: 'uint256',
      },
    ],
    name: 'VoteRemoved',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_name',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_description',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '_duration',
        type: 'uint256',
      },
      {
        internalType: 'bytes32[]',
        name: '_optionNames',
        type: 'bytes32[]',
      },
      {
        internalType: 'enum VotingContract.PollType',
        name: '_pollType',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: '_poll_metadata',
        type: 'bytes32',
      },
    ],
    name: 'createPoll',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_pollIndex',
        type: 'uint256',
      },
    ],
    name: 'getPoll',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'name',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'description',
        type: 'bytes32',
      },
      {
        internalType: 'address[]',
        name: 'options',
        type: 'address[]',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
      {
        internalType: 'enum VotingContract.PollType',
        name: 'pollType',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'pollMetadata',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'polls',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'description',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'name',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256',
      },
      {
        internalType: 'enum VotingContract.PollType',
        name: 'poll_type',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'poll_metadata',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'voter',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_pollIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_optionIndex',
        type: 'uint256',
      },
    ],
    name: 'recordVote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_pollIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_optionIndex',
        type: 'uint256',
      },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export { contractAbi, contractAddress };
