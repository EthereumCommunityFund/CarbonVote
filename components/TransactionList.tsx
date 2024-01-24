'use client'

import { useRouter } from 'next/router';
import React from 'react';
import useAccountTransactions from '@/hooks';
import { Loader } from './ui/Loader';
import { Label } from './ui/Label';

interface ITransactionListProps {
  address: string;
}

const TransactionList: React.FC<ITransactionListProps> = ({ address }) => {
  const router = useRouter();
  const { data: transactions, isLoading, isError } = useAccountTransactions(address);

  const handleTransaction = (transaction: string) => {
    router.push(`https://sepolia.etherscan.io/tx/${transaction}`);
  }

  if (isLoading) return <Loader />;

  return (
    <div className='flex flex-col gap-1'>
      {transactions.map((transaction: string) => {
        <Label onClick={() => handleTransaction(transaction)}>{transaction}</Label>
      })}
    </div>
  )
};

export default TransactionList;