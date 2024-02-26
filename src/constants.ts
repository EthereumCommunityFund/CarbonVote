export const PCD_GITHUB_URL = "https://github.com/proofcarryingdata/pcd";

export const IS_PROD = process.env.NODE_ENV === "production";

export const ZUPASS_URL = IS_PROD
  ? "https://zupass.org/"
  : "https://zupass.org/";

export const PCDPASS_URL = IS_PROD
  ? "https://zupass.org/"
  : "http://localhost:3000/";

export const ZUPASS_SERVER_URL = IS_PROD
  ? "https://api.zupass.org/"
  : "https://api.zupass.org/";

export const PCDPASS_SERVER_URL = IS_PROD
  ? "https://api.pcdpass.xyz/"
  : "http://localhost:3002/";

export const ZUZALU_SEMAPHORE_GROUP_URL = IS_PROD
  ? "https://api.zupass.org/semaphore/1"
  : "http://localhost:3002/semaphore/1";

export const PCDPASS_SEMAPHORE_GROUP_URL = IS_PROD
  ? "https://api.pcdpass.xyz/semaphore/5"
  : "http://localhost:3002/semaphore/5";


export const PASSPORT_SERVER_URL = "https://api.pcd-passport.com/"

export const CREDENTIALS = {
  ProtocolGuildMember: {
    id: '635a93d1-4d2c-47d9-82f4-9acd8ff68350',
    name: "Protocol Guild Member"
  },
  ZuConnectResident: {
    id: '76118436-886f-4690-8a54-ab465d08fa0d',
    name: "ZuConnect Resident"
  },
  DevConnect: {
    id: '3cc4b682-9865-47b0-aed8-ef1095e1c398',
    name: "DevConnect"
  },
  GitcoinPassport: {
    id: '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2',
    name: "Gitcoin Passport"
  },
  POAPapi: {
    id: 'poaps',
    name: "POAP API"
  },
  POAPSVerification: {
    id: '600d1865-1441-4e36-bb13-9345c94c4dfb',
    name: "POAPS Verification",
    contract: '0xD07E11aeA30DC68E42327F116e47f12C7E434d77'
  },
  // TODO: Create 
  EthHoldingOffchain: {
    id: '5e5aba01-ebe7-45d7-8534-07c8895d362b',
    name: "Eth Holding (Offchain)",
  },
  ZuzaluResident: {
    id: '287e7cf7-83ea-4aac-8311-8d55b49ac85b',
    name: "Zuzalu Resident"
  },
};

// TODO: improve naming (ethholding?)
export const CONTRACT_ADDRESS = "0x5092F0161B330A7B2128Fa39a93b10ff32c0AE3e"