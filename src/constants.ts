export const PCD_GITHUB_URL = 'https://github.com/proofcarryingdata/pcd';

// vercel will set NODE_ENV to 'production' in preview
export const IS_PROD =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';

export const IS_DEV = !IS_PROD;

export const ZUPASS_URL = IS_PROD
  ? 'https://zupass.org/'
  : 'https://zupass.org/';

export const PCDPASS_URL = IS_PROD
  ? 'https://zupass.org/'
  : 'http://localhost:3000/';

export const ZUPASS_SERVER_URL = IS_PROD
  ? 'https://api.zupass.org/'
  : 'https://api.zupass.org/';

export const PCDPASS_SERVER_URL = IS_PROD
  ? 'https://api.pcdpass.xyz/'
  : 'http://localhost:3002/';

export const ZUZALU_SEMAPHORE_GROUP_URL = IS_PROD
  ? 'https://api.zupass.org/semaphore/1'
  : 'http://localhost:3002/semaphore/1';

export const PCDPASS_SEMAPHORE_GROUP_URL = IS_PROD
  ? 'https://api.pcdpass.xyz/semaphore/5'
  : 'http://localhost:3002/semaphore/5';

export const PASSPORT_SERVER_URL = 'https://api.pcd-passport.com/';

export const CREDENTIALS = {
  ProtocolGuildMember: {
    id: '635a93d1-4d2c-47d9-82f4-9acd8ff68350',
    name: 'Protocol Guild Member',
  },
  ZuConnectResident: {
    id: '76118436-886f-4690-8a54-ab465d08fa0d',
    name: 'ZuConnect Resident',
  },
  DevConnect: {
    id: '3cc4b682-9865-47b0-aed8-ef1095e1c398',
    name: 'DevConnect',
  },
  GitcoinPassport: {
    id: '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2',
    name: 'Gitcoin Passport',
  },
  POAPapi: {
    id: '600d1865-1441-4e36-bb13-9345c94c4dfb',
    name: 'POAP API',
  },
  POAPSVerification: {
    id: '',
    name: 'POAPS Verification',
    contract: '0xD07E11aeA30DC68E42327F116e47f12C7E434d77',
  },
  EthHoldingOffchain: {
    id: '5e5aba01-ebe7-45d7-8534-07c8895d362b',
    name: 'Eth Holding',
  },
  ZuzaluResident: {
    id: '287e7cf7-83ea-4aac-8311-8d55b49ac85b',
    name: 'Zuzalu Resident',
  },
  EthSoloStaker: {
    id: '89b2e85c-77c0-4a7e-8c5c-d70d3a57a6cf',
    name: 'Solo Staker',
  },
  WhitelistedAddresses: {
    id: '806faa99-cb0d-48e5-b899-9ab509128442',
    name: 'Whitelisted Addresses',
  },
};

export const CONTRACT_ADDRESS = IS_PROD
  ? '0x0d8dBAcA55fA5EE902463a3e75e157f5c7Ff67Ef'
  : '0x2a7562Beb6653fC1817Ae51af79465d89cA4f945';
export const TOPIC_CASTVOTE =
  '0xcb87df07b1c304492bd875a5c8b98672eca500939412809ea229afef1d745188';
export const TOPIC_CHANGEVOTE =
  '0xf75b557412ca4429d4ef66a92f3e3aa3becb79b047d943377283ebf79552e3f8';

// EIP712_
export const EIP712_DOMAIN = {
  name: 'CarbonVote',
  version: '1',
  chainId: 1,
  //verifyingContract: '0x1111111111111111111111111111111111111111'
};

export const EIP712_TYPE = {
  PollVote: [
    { name: 'poll_id', type: 'string' },
    { name: 'option_id', type: 'string' },
    { name: 'voter_identifier', type: 'address' },
  ],
};

export const base64Icon =
  'data:image/png;base64,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';
