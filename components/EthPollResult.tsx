import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { PollOptionType } from '@/types';
import Button from './ui/buttons/Button';
import { TbChevronDown } from 'react-icons/tb';
import styles from '@/styles/pollResult.module.css';
import { Label } from './ui/Label';
import {
  EthIcon,
  GitCoinIcon,
  HeadCountIcon,
  PoapIcon,
  ProtocolGuildIcon,
  ZupassHolderIcon,
  StakerIcon,
} from './icons';
import { isValidUuidV4 } from '@/utils/index';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ContractPollResultComponentProps {
  allAggregatedData: {
    id: string;
    aggregatedData: PollOptionType[];
  }[];
  currentBlock: number;
  endBlock: number;
  onRefresh: () => void;
}

interface ExpandedStates {
  [key: string]: boolean;
}

interface TransactionTableProps {
  aggregatedData: PollOptionType[];
}

export const ContractPollResultComponent: React.FC<
  ContractPollResultComponentProps
> = ({ allAggregatedData, currentBlock, endBlock, onRefresh }) => {
  const [expandedStates, setExpandedStates] = useState<ExpandedStates>({});
  const toggleExpandedState = (id: string) => {
    setExpandedStates((prevStates) => ({
      ...prevStates,
      [id]: !(prevStates as any)[id],
    }));
  };
  useEffect(() => {
    const initialStates: ExpandedStates = {};
    allAggregatedData.forEach(({ id }) => {
      initialStates[id] = true;
    });
    setExpandedStates(initialStates);
  }, [allAggregatedData]);

  const generatePieChartData = (aggregatedData: PollOptionType[]) => {
    const labels = aggregatedData.map((data) => data.option_description);
    const votes = aggregatedData.map((data) =>
      parseFloat(data.totalEth || '0')
    );
    const backgroundColor: string[] = [
      '#88F2D5',
      '#E3F29C',
      '#EA66A4',
      '#FFA07A',
      '#20B2AA',
      '#9370DB',
      '#FFD700',
      '#FF69B4',
    ];
    return {
      labels,
      datasets: [
        {
          data: votes,
          backgroundColor: backgroundColor,
          hoverBackgroundColor: backgroundColor,
        },
      ],
    };
  };
  const TransactionTable: React.FC<
    TransactionTableProps & { isClickable: boolean }
  > = ({ aggregatedData, isClickable }) => {
    const optionsCount = aggregatedData.length;
    const columnWidth = `${100 / optionsCount}%`;
    const maxRows = aggregatedData.reduce((max, currOption) => {
      if (currOption.votersData && Array.isArray(currOption.votersData)) {
        return Math.max(max, currOption.votersData.length);
      }
      return max;
    }, 0);
    return (
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{ width: '100%', tableLayout: 'fixed', textAlign: 'center' }}
        >
          <thead>
            <tr>
              {aggregatedData.map((data, index) => (
                <th key={index} style={{ width: columnWidth }}>
                  {data.option_description}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {aggregatedData.map((columnData, columnIndex) => {
                  const voterInfo =
                    columnData.votersData && columnData.votersData[rowIndex];
                  return (
                    <td key={columnIndex} style={{ width: columnWidth }}>
                      {voterInfo &&
                        voterInfo.address &&
                        (isClickable ? (
                          <a
                            href={`https://etherscan.io/tx/${voterInfo.voteHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none' }}
                          >
                            {`${voterInfo.address.substring(0, 6)}...${voterInfo.address.substring(voterInfo.address.length - 4)}`}
                          </a>
                        ) : (
                          <span>
                            {`${voterInfo.address.substring(0, 6)}...${voterInfo.address.substring(voterInfo.address.length - 4)} : ${voterInfo.balance.substring(0, 4)} Eth`}
                          </span>
                        ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.results_container}>
      <div className="w-full flex flex-col gap-2.5">
        <Label className={styles.cred_header}>
          <EthIcon />
          Ether Holding Credential
        </Label>
        <Label className={styles.cred_header_small}>
          Ether Holding results are updated every n block until the end of the
          poll's selected time.
        </Label>
      </div>
      <div className="w-full flex flex-col gap-2.5">
        {allAggregatedData.map(({ id, aggregatedData }) => (
          <div key={id} className="w-full flex flex-col gap-2.5 mt-5">
            <Button
              variant="primary"
              className={styles.dropdown}
              onClick={() => toggleExpandedState(id)}
            >
              <Label className={styles.cred_flex}>
                <EthIcon />
                {!isValidUuidV4(id)
                  ? 'Ether Holding Smart Contract Results'
                  : 'Ether Holding Results'}
              </Label>
              <TbChevronDown />
            </Button>
            {expandedStates[id] && (
              <div>
                <div className="flex flex-col">
                  Total Eth:{' '}
                  {aggregatedData
                    .reduce(
                      (acc, data) => acc + parseFloat(data.totalEth || '0'),
                      0
                    )
                    .toFixed(2)}
                </div>
                <div className="flex flex-col">
                  Block Status: {currentBlock} / {endBlock}
                </div>
                {currentBlock < endBlock && (
                  <Button onClick={onRefresh}>Refresh</Button>
                )}
                <div className={styles.pie}>
                  {' '}
                  <Pie
                    data={generatePieChartData(aggregatedData)}
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <Button
                    onClick={() => toggleExpandedState(`${id}-transactions`)}
                  >
                    View Transactions
                  </Button>
                </div>
                {expandedStates[`${id}-transactions`] && (
                  <div style={{ width: '100%' }}>
                    <TransactionTable
                      aggregatedData={aggregatedData}
                      isClickable={!isValidUuidV4(id)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
