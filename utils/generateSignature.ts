import { ethers } from 'ethers';

export function signMessage(privateKey: string, message: string) {
  const wallet = new ethers.Wallet(privateKey);
  console.log(hash_message(message));
  return wallet.signMessage(ethers.getBytes(hash_message(message)));
}

function hash_message(message: string) {
  console.log(ethers.keccak256(ethers.toUtf8Bytes(message)));
  return ethers.keccak256(ethers.toUtf8Bytes(message));
}
