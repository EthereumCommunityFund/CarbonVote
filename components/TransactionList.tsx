'use client'

import { useRouter } from 'next/router';
import React from 'react';
import useAccountTransactions from '@/hooks';
import { Loader } from './ui/Loader';
import { Label } from './ui/Label';

interface ITransactionListProps {
  optionAddress: string;
  optionName: string;
}

const TransactionList: React.FC<ITransactionListProps> = ({ optionAddress, optionName }) => {

  const { data: transactions, isLoading, isError } = useAccountTransactions(optionAddress);

  const handleTransaction = (transactionHash: string) => {
    window.open(`https://sepolia.etherscan.io/tx/${transactionHash}`);
  }

  const truncateHash = (hash: string) => {
    return hash.slice(0, 15) + '...' + hash.slice(-15);
  }

  if (isLoading) return <Loader />;

  return (
    <div className='flex flex-col gap-1 cursor-pointer w-1/2'>
      <Label>{optionName}</Label>
      {transactions.map((transaction: any, index: number) => (
        <Label key={index} className='cursor-pointer w-full' onClick={() => handleTransaction(transaction.hash)}>
          {truncateHash(transaction.hash)}
        </Label>
      ))}
    </div>
  )
};

export default TransactionList;