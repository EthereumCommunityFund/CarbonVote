import React, { useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions } from "chart.js";
import { Pie } from 'react-chartjs-2';
import { PollOptionType } from '@/types';
import Button from './ui/buttons/Button';
import { TbChevronDown } from 'react-icons/tb';
import styles from "@/styles/pollResult.module.css";
import { Label } from './ui/Label';
import { EthIcon, GitCoinIcon, HeadCountIcon, PoapIcon, ProtocolGuildIcon, ZupassHolderIcon, StakerIcon} from './icons';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ContractPollResultComponentProps {
  aggregatedData: PollOptionType[];
  currentBlock: number;
  endBlock: number;
}

export const ContractPollResultComponent: React.FC<ContractPollResultComponentProps> = ({ aggregatedData,currentBlock,endBlock }) => {
  const [expandedState, setExpandedState] = useState<boolean>(false);
  const totalEthSum = aggregatedData.reduce((acc, data) => acc + parseFloat(data.totalEth || '0'), 0);
  const generatePieChartData = () => {
    const labels = aggregatedData.map(data => data.option_description);
    const votes = aggregatedData.map(data => parseFloat(data.totalEth || '0'));
    const backgroundColor: string[] = ['#88F2D5', '#E3F29C', '#EA66A4'];

    return {
      labels,
      datasets: [{
        data: votes,
        backgroundColor: backgroundColor,
        hoverBackgroundColor: backgroundColor,
      }]
    };
  };

  return (
    <div className={styles.results_container}>
    <div className='w-full flex flex-col gap-2.5'>
        <Label className={styles.cred_header}><EthIcon />Ether Holding Credential</Label>
        <Label className={styles.cred_header_small}>Ether Holding results are updated every n block until the end of the poll's selected time.</Label>
      <Button variant="primary" className={styles.dropdown} onClick={() => setExpandedState(!expandedState)}>
      <Label className={styles.cred_flex}><EthIcon />Ether Holding Results</Label>
        <TbChevronDown />
      </Button>
      </div>
      {expandedState && (
        <>
        <div className='flex flex-col'>
        <div>Total Eth: {totalEthSum.toFixed(2)}</div>
      </div>
      <div className='flex flex-col'>
        <div>Block Status: {currentBlock} / {endBlock}</div>
      </div>
        <div className={styles.pie}>
          <Pie data={generatePieChartData()} options={{ maintainAspectRatio: false }} />
        </div>
        </>
      )}
    </div>
  );
};

