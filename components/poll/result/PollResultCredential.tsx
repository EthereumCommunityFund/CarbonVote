import React from 'react';
import PieChartComponent from './PieChart';
import { PollTypes, VoteData } from '@/types';
import { InfoIcon, RefreshIcon } from '@/components/icons';
import Tooltip from '@mui/material/Tooltip';
import { CREDENTIALS } from '@/src/constants';
import MSelect from '@/components/ui/MSelect';
import Link from 'next/link';

import {
  EthIcon,
  GitCoinIcon,
  HeadCountIcon,
  PoapIcon,
  ProtocolGuildIcon,
  ZupassHolderIcon,
  StakerIcon,
  CardHolderIcon,
} from '@/components/icons';
import { UserIcon } from '@/components/icons';
import Button from '../../ui/buttons/Button';
import { getEtherscanAddress } from '@/utils/pollUtils';

const getCredentialIcon = (credentialId: string) => {
  switch (credentialId) {
    case CREDENTIALS.POAPapi.id:
      return <PoapIcon className="w-[20px] h-[24px]" />;
    case CREDENTIALS.GitcoinPassport.id:
      return <GitCoinIcon width={24} height={24} />;
    case CREDENTIALS.ProtocolGuildMember.id:
      return <ProtocolGuildIcon />;
    case 'zupass':
      return <ZupassHolderIcon width={24} height={24} />;
    case CREDENTIALS.EthSoloStaker.id:
      return <StakerIcon width={24} height={24} />;
    case CREDENTIALS.EthHoldingOffchain.id:
      return <EthIcon width={24} height={24} />;
    case CREDENTIALS.WhitelistedAddresses.id:
      return <CardHolderIcon width={24} height={24} />;
    default:
      return <HeadCountIcon width={24} height={24} />;
  }
};

const getCredentialTooltipContent = (
  credentialId: string,
  credentialName: string
) => {
  if (credentialName === 'EthHolding on-chain') {
    return `Poll creators and voters will need to pay for transaction fees for deployment of contract and voting. <strong>(Contract is under auditing)</strong>. </br> </br> The poll results will dynamically show vote changes according to the state of blockchain until the end of the poll. Voters can send transaction from wallets off-site.`;
  }
  switch (credentialId) {
    case CREDENTIALS.EthHoldingOffchain.id:
      return `Ether Holding results are updated every one block until the end of the poll's selected time.</br>This method is supported in Farcaster Frames.`;
    case 'zupass':
      return `Choose the eligible events (Zupass Ticket) for the poll. One event ticket one vote. The votes are counted separately according to each event.`;
    case CREDENTIALS.GitcoinPassport.id:
      return `Voters are users of Gitcoin Passport indicating participation or contribution within the Gitcoin ecosystem. Determine the minimum score required for eligibility among voters.`;
    case CREDENTIALS.POAPapi.id:
      return 'POAP (Proof of Attendance Protocol) voters are individuals who possess special non-fungible tokens (NFTs) known as POAPs (link to poap.xyz). </br> </br> This method is supported in Farcaster Frames.';
    case CREDENTIALS.EthSoloStaker.id:
      return '';
    case CREDENTIALS.ProtocolGuildMember.id:
      return '';
    case CREDENTIALS.WhitelistedAddresses.id:
      return 'Whitelisted Addresses are specific Ethereum addresses that have been pre-approved by the poll creator to participate in the voting process.';
    default:
      return '';
  }
};
interface VoteOption {
  id: string;
  description: string;
  votes: number;
  percentage: number;
  color: string;
  address?: string;
}

interface SubCredentialOption {
  id: string;
  name: string;
}

interface PollResultCredentialProps {
  pollType: PollTypes;
  credentialId: string;
  credentialName: string;
  totalVoters: number;
  options: VoteOption[];
  totalVotesAmount?: number;
  isEthHolding?: boolean;

  /**
   * sub credential related
   */
  hasSubCredentials?: boolean;
  subCredentialOptions?: SubCredentialOption[];
  onSubCredentialSelect?: (id: string | null) => void;
  selectedSubCredential?: string | null;

  /**
   * chart data related
   */
  chartData: VoteData[];
  chartFilter?: string;

  isEthOnChain: boolean;
  isEthOffChain: boolean;
  latestBlockNumber?: number;
  endBlockNumber?: number;
  onRefresh?: () => void;
}

const PollResultCredential: React.FC<PollResultCredentialProps> = ({
  pollType,
  credentialId,
  credentialName,
  totalVoters,
  options,
  totalVotesAmount,
  isEthHolding = false,

  hasSubCredentials = false,
  subCredentialOptions = [],
  onSubCredentialSelect,
  selectedSubCredential = null,

  chartData,
  chartFilter,
  latestBlockNumber,
  endBlockNumber,
  onRefresh,
  isEthOnChain,
  isEthOffChain,
}) => {
  const CredentialIcon = getCredentialIcon(credentialId);
  const tooltipContent = getCredentialTooltipContent(
    credentialId,
    credentialName
  );

  return (
    <div className="flex flex-col items-center md:flex-row md:items-start gap-[20px]">
      <div className="w-full flex-1 flex flex-col gap-[20px]">
        {/* header */}
        <div>
          <div className="flex justify-between items-center">
            <div className="flex justify-start items-center gap-[10px]">
              {CredentialIcon}
              <span className="text-[16px] font-[700] text-black leading-[1.6]">
                {credentialName}
              </span>
              {tooltipContent && (
                <Tooltip
                  title={
                    <div
                      className="text-[13px] font-[400] leading-[1.6] text-black/70"
                      dangerouslySetInnerHTML={{ __html: tooltipContent }}
                    />
                  }
                  placement="top"
                  arrow
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'white',
                        color: 'rgba(0, 0, 0, 0.7)',
                        padding: '14px',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        borderRadius: '10px',
                        '& .MuiTooltip-arrow': {
                          color: 'white',
                          '&::before': {
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            backgroundColor: 'white',
                          },
                        },
                      },
                    },
                  }}
                >
                  <span className="cursor-help">
                    <InfoIcon />
                  </span>
                </Tooltip>
              )}
            </div>
            <div className="text-[12px] font-[500] leading-[1.6] text-black/50">
              {' '}
              Total {isEthHolding ? 'Addresses' : 'Voters'}: {totalVoters}
            </div>
          </div>

          {/* tips */}
          {isEthOnChain && (
            <div className="mt-[10px] text-[12px] font-[400] leading-[1.6] text-black/70">
              {`Ether Holding results are updated every one block until the end of
            the poll's selected time.`}
            </div>
          )}
        </div>

        {/* sub credential selector */}
        {hasSubCredentials && subCredentialOptions.length > 0 && (
          <div className="w-full mx-auto flex justify-center">
            <MSelect
              value={selectedSubCredential}
              onChange={(value) => onSubCredentialSelect?.(value)}
              options={subCredentialOptions}
              allOptionLabel={`All ${credentialName}`}
              showAllOption={true}
            />
          </div>
        )}

        {/* option vote details */}
        <div className="w-full flex flex-col gap-[7.5px]">
          {options.map((option, index) => (
            <div key={option.id} className="w-full">
              <div className="flex justify-between items-center mb-[5px]">
                <div className="text-[14px] font-[500] text-black leading-[1.6]">
                  {index + 1}. {option.description}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-[10px]">
                  {isEthHolding ? (
                    <span>{option.votes.toFixed(2)} eth</span>
                  ) : (
                    <div className="flex items-center gap-[5px]">
                      <UserIcon width={16} height={16} />
                      <span className="text-[12px] font-[500] text-black/70 leading-[1.6]">
                        {option.votes}
                      </span>
                    </div>
                  )}
                  <span className="text-[16px] font-[600] text-black leading-[1.6]">
                    {option.percentage}%
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-[5px] h-[14px] overflow-hidden">
                <div
                  className="h-full rounded-[5px]"
                  style={{
                    width: `${option.percentage}%`,
                    backgroundColor: option.color,
                  }}
                ></div>
              </div>
              {isEthOnChain && (
                <Link
                  href={getEtherscanAddress(option.address!)}
                  target="_blank"
                  className="mt-[5px] text-[12px] font-[500] text-black/50 leading-[1.6] cursor-pointer underline hover:opacity-50"
                >
                  View Transactions
                </Link>
              )}
            </div>
          ))}

          {isEthOnChain && (
            <div className="mt-2 border-t border-black/10 pt-[10px]">
              <div>
                <p className="text-[12px] font-[700] text-black/70 leading-[1.6]">
                  Total Eth Voted:{' '}
                  <span className="ml-[5px] font-[500]">
                    {totalVotesAmount?.toFixed(3) || '0.000'}k
                  </span>
                </p>
                <p className="mt-[5px] text-[12px] font-[700] text-black/70 leading-[1.6]">
                  Block status:
                  <span className="ml-[5px] font-[500]">
                    {latestBlockNumber} / {endBlockNumber}
                  </span>
                </p>
              </div>
              <div className="mt-[10px]">
                <Button
                  onClick={onRefresh}
                  className="rounded-[10px] border border-black/10 bg-black/5 px-[10px] shadow-none gap-[10px]"
                >
                  <RefreshIcon width={20} height={20} />
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* pie chart */}
      <div className="mt-[20px] md:mt-0">
        <PieChartComponent
          voteData={chartData}
          votingType={`${pollType}`}
          credentialFilter={chartFilter || credentialId}
          optionColors={options.reduce(
            (acc, option) => {
              const chartOption = chartData.find(
                (data) =>
                  data.description === option.description ||
                  data.id === option.id
              );

              if (chartOption) {
                acc[chartOption.id] = option.color;
              }

              return acc;
            },
            {} as Record<string, string>
          )}
        />
      </div>
    </div>
  );
};

export default PollResultCredential;
