import {
  calculateTimeRemaining,
  getImagePathByCredential,
  isValidUuidV4,
} from '@/utils/index';
import { generateMessage } from '@/utils/generateMessage';
import { getProviderUrl } from '@/utils/getProviderUrl';
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';
import {
  getEthersLogs,
  getEthersLogsWithBlock,
} from '@/utils/getVoteTransactionHash';
import { CredentialTable } from '@/types';
import { CREDENTIALS, IS_PROD } from '@/src/constants';
import { toast } from '@/components/ui/use-toast';

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Success',
      description: 'Copied to clipboard!',
      variant: 'default',
    });
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

export function canOpenPopup() {
  let windowReference = window.open('', '_blank');
  if (
    !windowReference ||
    windowReference.closed ||
    typeof windowReference.closed == 'undefined'
  ) {
    // Pop-up was blocked
    return false;
  }
  windowReference.close();
  return true;
}

export function isEthHoldingCredential(credential: CredentialTable) {
  return (
    credential.credential?.includes('EthHolding') ||
    credential.id === CREDENTIALS.EthHoldingOffchain.id
  );
}

export function isEthHoldingCredentialOffChain(credential: CredentialTable) {
  return (
    isEthHoldingCredential(credential) &&
    credential.id === CREDENTIALS.EthHoldingOffchain.id
  );
}

export function isEthHoldingCredentialOnChain(credential: CredentialTable) {
  return (
    isEthHoldingCredential(credential) &&
    !isEthHoldingCredentialOffChain(credential)
  );
}

export function getEtherscanAddress(address: string) {
  return IS_PROD
    ? `https://etherscan.io/address/${address}`
    : `https://sepolia.etherscan.io/address/${address}`;
}

export function getEtherscanTx(txHash: string) {
  return IS_PROD
    ? `https://etherscan.io/tx/${txHash}`
    : `https://sepolia.etherscan.io/tx/${txHash}`;
}

export {
  calculateTimeRemaining,
  getImagePathByCredential,
  isValidUuidV4,
  generateMessage,
  getProviderUrl,
  getBalanceAtBlock,
  getLatestBlockNumber,
  getEthersLogs,
  getEthersLogsWithBlock,
};
