import { CREDENTIALS } from '@/src/constants';
import { VotingProcess } from './types';

export const CREDENTIAL_DETAILS_MAP: Record<
  string,
  { imgSrc: string; text: string }
> = {
  [CREDENTIALS.ProtocolGuildMember.id]: {
    imgSrc: '/images/guild.png',
    text: 'Protocol Guild Membership',
  },
  [CREDENTIALS.EthHoldingOffchain.id]: {
    imgSrc: '/images/eth_logo.svg',
    text: 'Eth Holding',
  },
  [CREDENTIALS.ZuConnectResident.id]: {
    imgSrc: '/images/zupass.svg',
    text: 'Zupass',
  },
  [CREDENTIALS.DevConnect.id]: {
    imgSrc: '/images/zupass.svg',
    text: 'Zupass',
  },
  [CREDENTIALS.ZuzaluResident.id]: {
    imgSrc: '/images/zupass.svg',
    text: 'Zupass',
  },
  [CREDENTIALS.GitcoinPassport.id]: {
    imgSrc: '/images/gitcoin.svg',
    text: 'Gitcoin Passport',
  },
  [CREDENTIALS.POAPapi.id]: { imgSrc: '/images/poaps.svg', text: 'POAPs' },
  [CREDENTIALS.EthSoloStaker.id]: {
    imgSrc: '/images/solo_staker.svg',
    text: 'Solo Staker',
  },
  [CREDENTIALS.WhitelistedAddresses.id]: {
    imgSrc: '/images/address_book.svg',
    text: 'Whitelisted Addresses',
  },
};

export function getCredentialDetails(credential: VotingProcess): {
  imgSrc: string;
  text: string;
} {
  if (
    credential.credentialId &&
    CREDENTIAL_DETAILS_MAP[credential.credentialId]
  ) {
    return CREDENTIAL_DETAILS_MAP[credential.credentialId];
  }

  if (credential.contractpoll) {
    if (credential.contractpoll.includes('ProtocolGuild on-chain')) {
      return { imgSrc: '/images/guild.png', text: 'Protocol Guild Membership' };
    }
    if (credential.contractpoll.includes('EthHolding on-chain')) {
      return { imgSrc: '/images/eth_logo.svg', text: 'Eth Holding' };
    }
  }

  return { imgSrc: '', text: '' };
}
