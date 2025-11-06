import { useState, useMemo, useEffect } from 'react';
import { CREDENTIALS } from '@/src/constants';
import { PollResultComponentType, VoteData, PollOptionType } from '@/types';
import PollResultCredential from './PollResultCredential';
import { Skeleton } from '@mui/material';
import * as Tabs from '@radix-ui/react-tabs';
import { devLog } from '@/utils/devLog';
import { ChartColors } from './PieChart';
import {
  isEthHoldingCredential,
  isEthHoldingCredentialOffChain,
  isEthHoldingCredentialOnChain,
} from '@/utils/pollUtils';
import CircularProgress from '@mui/material/CircularProgress';

const ZupassIds = [
  CREDENTIALS.DevConnect.id,
  CREDENTIALS.ZuConnectResident.id,
  CREDENTIALS.ZuzaluResident.id,
];
export interface IPollResultProps extends PollResultComponentType {
  pollOptions: PollOptionType[];
  latestBlockNumber: number;
  endBlockNumber: number;
  onRefresh: () => void;
  contractPollResultData: any[];
  isResultsLoading: boolean;
  isPollResultFetched: boolean;
}

const PollResultComponent = ({
  pollType,
  optionsData,
  credentialTable,
  isLoading, // Loading state for the poll definition/structure - KEEP for potential future use? Or remove if unused. Let's keep for now.
  isResultsLoading, // Loading state specifically for the results data
  isPollResultFetched,
  pollOptions,
  latestBlockNumber,
  endBlockNumber,
  contractPollResultData,
  onRefresh,
}: IPollResultProps) => {
  const [selectedSubCredentials, setSelectedSubCredentials] = useState<
    Record<string, string | null>
  >({});

  const handleSubCredentialSelect = (
    credentialId: string,
    subCredentialId: string | null
  ) => {
    setSelectedSubCredentials((prev) => ({
      ...prev,
      [credentialId]: subCredentialId,
    }));
  };

  const {
    normalCredentials,
    zupassCredentials,
    mergedZupassVoteData,
    credentialVoteData,
    subCredentialOptionsMap,
    baseOptions,
  } = useMemo(() => {
    const normalCreds = credentialTable.filter(
      (credential) => !ZupassIds.includes(credential.id)
    );
    const zupassCreds = credentialTable.filter((credential) =>
      ZupassIds.includes(credential.id)
    );

    const baseOpts =
      pollOptions && pollOptions.length > 0
        ? pollOptions.map((option, index) => ({
            id: String(option.id),
            description: option.option_description,
            originalIndex: option.option_index ?? index,
            address: option.address,
          }))
        : [
            { id: 'yes', description: 'Yes', originalIndex: 0 },
            { id: 'no', description: 'No', originalIndex: 1 },
          ];

    const subCredentialOptionsMap: Record<
      string,
      { id: string; name: string }[]
    > = {};

    if (zupassCreds.length > 0) {
      subCredentialOptionsMap['zupass'] = zupassCreds.map((credential) => ({
        id: credential.id,
        name: credential.credential || credential.id,
      }));
    }
    // TODO handle other sub credential case, e.g. POAP events

    let mergedZupassData: VoteData[] = [];
    if (optionsData) {
      const voteZupassCredentials = optionsData.filter((credential) =>
        ZupassIds.includes(credential.credential)
      );

      const votesMap = new Map<string, VoteData>();
      voteZupassCredentials.forEach(
        ({ id, votes, credential, description, voters_account }) => {
          if (votesMap.has(id)) {
            const existingData = votesMap.get(id)!;
            existingData.votes += votes;
            if (voters_account) {
              existingData.voters_account = existingData.voters_account
                ? [
                    ...new Set([
                      ...existingData.voters_account,
                      ...voters_account,
                    ]),
                  ]
                : voters_account;
            }
          } else {
            votesMap.set(id, {
              id,
              votes,
              credential,
              description,
              voters_account: voters_account || [],
            });
          }
        }
      );
      mergedZupassData = Array.from(votesMap.values());
    }

    const credentialVoteDataMap: Record<
      string,
      {
        totalVoters: number;
        options: Array<{
          id: string;
          description: string;
          votes: number;
          percentage: number;
          color: string;
          address: string;
        }>;
        totalVotesAmount?: number;
        voteData: VoteData[];
      }
    > = {};

    normalCreds.forEach((credential) => {
      const credentialId = credential.id;
      const filteredData =
        optionsData?.filter((data) => data.credential === credentialId) || [];

      const voteDataMap = new Map<string, VoteData>();
      filteredData.forEach((data) => {
        voteDataMap.set(data.id, data);
      });

      const totalVotes = filteredData.reduce((sum, opt) => sum + opt.votes, 0);
      let totalVoters = filteredData.reduce(
        (acc, curr) => acc + (curr.voters_account?.length || 0),
        0
      );

      const options = baseOpts.map((baseOption) => {
        const voteData = voteDataMap.get(baseOption.id);
        const votes = voteData?.votes || 0;
        const percentage =
          totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

        return {
          id: baseOption.id, // Use the ID from baseOption
          description: baseOption.description, // Use description from baseOption
          votes: votes,
          percentage,
          color: ChartColors[baseOption.originalIndex % ChartColors.length],
          address: baseOption.address,
        };
      });

      // 确保totalVoters至少反映投票选项中显示的票数总和
      const visibleVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
      if (totalVoters === 0 && visibleVotes > 0) {
        const sumOfVoters = options.reduce((acc, opt) => {
          // 从options中获取投票数量
          return acc + (opt.votes || 0);
        }, 0);
        totalVoters = sumOfVoters;
      }

      credentialVoteDataMap[credentialId] = {
        totalVoters,
        options,
        totalVotesAmount: credentialId.includes('EthHolding')
          ? totalVotes
          : undefined,
        voteData: filteredData,
      };
    });

    // 处理Zupass数据
    if (zupassCreds.length > 0) {
      // 创建一个投票数据映射，方便查找 (keyed by VoteData.id)
      const voteDataMap = new Map<string, VoteData>();
      mergedZupassData.forEach((data) => {
        voteDataMap.set(data.id, data); // Assuming data.id matches baseOpts.id
      });

      // 计算总票数
      const totalVotes = mergedZupassData.reduce(
        (sum, opt) => sum + opt.votes,
        0
      );
      let totalVoters = mergedZupassData.reduce(
        (acc, curr) => acc + (curr.voters_account?.length || 0),
        0
      );

      // 确保totalVoters至少反映投票选项中显示的票数总和
      const totalVisibleVotes = (
        baseOpts as Array<{
          id: string;
          description: string;
          originalIndex: number;
          address?: string;
        }>
      ).reduce((sum, baseOpt) => {
        const voteData = voteDataMap.get(baseOpt.id);
        return sum + (voteData?.votes || 0);
      }, 0);

      if (totalVoters === 0 && totalVisibleVotes > 0) {
        totalVoters = totalVisibleVotes;
      }

      // 基于 **新的 baseOpts** (derived from pollOptions), 填充实际的投票数据
      const options = baseOpts.map((baseOption) => {
        // Lookup using baseOption.id (which should match VoteData.id used in voteDataMap)
        const voteData = voteDataMap.get(baseOption.id);
        const votes = voteData?.votes || 0;
        const percentage =
          totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

        return {
          id: baseOption.id, // Use the ID from baseOption
          description: baseOption.description, // Use description from baseOption
          votes: votes,
          percentage,
          // Use originalIndex from baseOption for consistent color assignment
          color: ChartColors[baseOption.originalIndex % ChartColors.length],
          address: baseOption.address,
        };
      });

      credentialVoteDataMap['zupass'] = {
        totalVoters,
        options,
        voteData: mergedZupassData,
      };
    }

    return {
      normalCredentials: normalCreds,
      zupassCredentials: zupassCreds,
      mergedZupassVoteData: mergedZupassData,
      credentialVoteData: credentialVoteDataMap,
      subCredentialOptionsMap,
      baseOptions: baseOpts,
    };
  }, [optionsData, credentialTable, pollOptions]);

  const allCredentialsToDisplay = useMemo(
    () => [
      { id: 'all-results', credential: 'All Results' },
      ...normalCredentials,
      ...(zupassCredentials.length > 0
        ? [{ id: 'zupass', credential: 'Zupass' }]
        : []),
    ],
    [normalCredentials, zupassCredentials]
  );

  const defaultTabValue = useMemo(() => 'all-results', []);

  const realCredentials = useMemo(() => {
    return allCredentialsToDisplay.filter((cred) => cred.id !== 'all-results');
  }, [allCredentialsToDisplay]);

  const credentialDisplayData = useMemo(() => {
    const result = allCredentialsToDisplay
      .map((credential) => {
        const credentialId = credential.id;

        if (credentialId === 'all-results') {
          return {
            credentialId,
            credential,
            isAllResults: true,
          };
        }

        const credentialData = credentialVoteData[credentialId];

        if (!credentialData) return null;

        const isEthHolding = isEthHoldingCredential(credential);
        const isEthHoldingOffChain = isEthHoldingCredentialOffChain(credential);
        const isEthHoldingOnChain = isEthHoldingCredentialOnChain(credential);

        let { options, totalVoters, totalVotesAmount, voteData } =
          credentialData;

        if (isEthHolding) {
          const ethHoldingData =
            contractPollResultData && contractPollResultData.length > 0
              ? contractPollResultData.find((data) => data.id === credentialId)
              : null;

          if (ethHoldingData && ethHoldingData.aggregatedData) {
            const totalEth = ethHoldingData.aggregatedData.reduce(
              (acc: number, data: PollOptionType) =>
                acc + parseFloat(data.totalEth || '0'),
              0
            );

            options = baseOptions.map((baseOption) => {
              const optionData = ethHoldingData.aggregatedData.find(
                (data: PollOptionType) =>
                  data.id === baseOption.id ||
                  data.option_description === baseOption.description
              );

              const ethAmount = optionData
                ? parseFloat(optionData.totalEth || '0')
                : 0;

              const percentage =
                totalEth > 0 ? Math.round((ethAmount / totalEth) * 100) : 0;

              return {
                id: baseOption.id,
                description: baseOption.description,
                votes: ethAmount, // use ETH amount as votes
                percentage,
                color:
                  ChartColors[baseOption.originalIndex % ChartColors.length],
                address: baseOption.address,
              };
            });

            // 更新总投票人数和总ETH数量
            totalVoters = ethHoldingData.aggregatedData.reduce(
              (acc: number, data: PollOptionType) =>
                acc + (data.votersCount || 0),
              0
            );

            totalVotesAmount = totalEth;

            // 更新图表数据
            voteData = ethHoldingData.aggregatedData.map(
              (data: PollOptionType) => ({
                id: data.id || '',
                votes: parseFloat(data.totalEth || '0'),
                credential: credentialId,
                description: data.option_description || '',
                voters_account:
                  data.votersData?.map((voter: any) => voter.address) || [],
              })
            );
          } else {
            // create empty option data
            options = baseOptions.map((baseOption) => ({
              id: baseOption.id,
              description: baseOption.description,
              votes: 0, // 空数据
              percentage: 0,
              color: ChartColors[baseOption.originalIndex % ChartColors.length],
              address: baseOption.address,
            }));

            totalVoters = 0;
            totalVotesAmount = 0;

            // create empty chart data
            voteData = baseOptions.map((baseOption) => ({
              id: baseOption.id,
              votes: 0,
              credential: credentialId,
              description: baseOption.description,
              voters_account: [],
              address: baseOption.address,
            }));
          }
        }

        const selectedSubCredential =
          selectedSubCredentials[credentialId] || null;
        const hasSubCredentials =
          !!subCredentialOptionsMap[credentialId]?.length;
        const subCredentialOptions =
          subCredentialOptionsMap[credentialId] || [];

        let chartData = voteData;
        let chartFilter = selectedSubCredential || credentialId;

        if (selectedSubCredential) {
          if (credentialId === 'zupass') {
            chartData =
              optionsData?.filter(
                (data) => data.credential === selectedSubCredential
              ) || [];
          } else {
            // TODO handle sub credential case, e.g. POAP events
            chartData = chartData.filter(
              (data) =>
                data.credential === selectedSubCredential ||
                data.id.includes(selectedSubCredential)
            );
          }
          chartFilter = selectedSubCredential;
        }

        return {
          credentialId,
          credential: credential,
          chartData,
          chartFilter: chartFilter || credentialId,
          isEthHolding,
          isETHHoldingOffChain: isEthHoldingOffChain,
          isEthHoldingOnChain: isEthHoldingOnChain,
          totalVoters,
          totalVotesAmount,
          options,
          hasSubCredentials,
          subCredentialOptions,
          selectedSubCredential,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return result;
  }, [
    allCredentialsToDisplay,
    credentialVoteData,
    selectedSubCredentials,
    subCredentialOptionsMap,
    optionsData,
    contractPollResultData,
    baseOptions,
  ]);

  const renderPollResultCredential = (
    data: (typeof credentialDisplayData)[0]
  ) => {
    if (data.isAllResults) return null;

    return (
      <PollResultCredential
        key={data.credentialId}
        pollType={pollType}
        credentialId={data.credentialId}
        credentialName={data.credential.credential || data.credentialId}
        totalVoters={data.totalVoters || 0}
        options={data.options || []}
        isEthHolding={!!data.isEthHolding}
        isEthOnChain={!!data.isEthHoldingOnChain}
        isEthOffChain={!!data.isETHHoldingOffChain}
        totalVotesAmount={data.totalVotesAmount}
        hasSubCredentials={data.hasSubCredentials}
        subCredentialOptions={data.subCredentialOptions}
        selectedSubCredential={data.selectedSubCredential}
        onSubCredentialSelect={(subId) =>
          handleSubCredentialSelect(data.credentialId, subId)
        }
        chartData={data.chartData || []}
        chartFilter={data.chartFilter}
        latestBlockNumber={latestBlockNumber}
        endBlockNumber={endBlockNumber}
        onRefresh={onRefresh}
      />
    );
  };

  const allResultsData = credentialDisplayData.find(
    (data) => 'isAllResults' in data
  );
  const otherTabsData = credentialDisplayData.filter(
    (data) => !('isAllResults' in data)
  );

  if ((isLoading || isResultsLoading) && !isPollResultFetched) {
    return (
      <div className="flex flex-col rounded-[10px] bg-transparent animate-pulse pb-[20px]">
        <div className="pt-[20px] pb-[10px] px-[10px] flex flex-col items-center gap-[4px]">
          <Skeleton variant="rounded" width={120} height={30} />
          <Skeleton variant="rounded" width={300} height={18} />
        </div>
        <div className="mt-[10px] flex flex-nowrap gap-[10px] px-[10px]">
          <Skeleton variant="rounded" width={120} height={30} />
          <Skeleton variant="rounded" width={120} height={30} />
          <Skeleton variant="rounded" width={120} height={30} />
          <Skeleton variant="rounded" width={120} height={30} />
        </div>

        <div className="mt-[20px] px-[10px] flex flex-col gap-[20px]">
          {[true, true, true].map((_, index) => {
            return (
              <div
                key={index}
                className="flex flex-col items-center md:flex-row md:items-start gap-[20px]"
              >
                <div className="w-full">
                  <div className="w-full flex-1 flex items-center">
                    <div className="flex-1 flex items-center gap-[10px]">
                      <Skeleton variant="circular" width={20} height={20} />
                      <Skeleton variant="rounded" width={160} height={26} />
                    </div>
                    <Skeleton variant="rounded" width={60} height={20} />
                  </div>

                  <div className="mt-[20px] flex flex-col gap-[10px]">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="flex flex-col gap-[10px]">
                        <div className="flex justify-between items-center">
                          <Skeleton variant="rounded" width={120} height={20} />
                          <Skeleton variant="rounded" width={120} height={20} />
                        </div>

                        <Skeleton variant="rounded" width="100%" height={10} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-[200px] h-[200px] flex flex-col gap-[20px]">
                  <Skeleton variant="circular" width={200} height={200} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const isRefreshing = (isLoading || isResultsLoading) && isPollResultFetched;

  return (
    <div className="relative flex flex-col rounded-[10px] bg-transparent">
      {isRefreshing && (
        <div className="absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center backdrop-blur-[2px] rounded-[10px]">
          <CircularProgress color="inherit" />
        </div>
      )}
      <div>
        <div className="pt-[20px] px-[10px] pb-[10px] text-center">
          <p className="text-[20px] font-[700] leading-[1.6] text-black">
            Poll Results
          </p>
          <p className="text-[13px] font-[500] leading-[1.4] text-black/40">
            IPFS: Update every day at 12 pm CET
          </p>
        </div>

        {otherTabsData.length > 0 ? (
          <Tabs.Root
            defaultValue={defaultTabValue}
            className="w-full mt-[10px]"
          >
            <Tabs.List className="flex overflow-x-auto whitespace-nowrap border-b border-black/10 px-[5px] scrollbar-hide mb-[20px] sticky top-0 z-50 bg-white/80 backdrop-blur-[40px]">
              {allCredentialsToDisplay.map((credential) => (
                <Tabs.Trigger
                  key={credential.id}
                  value={credential.id}
                  className="px-[15px] py-[10px] text-center font-[500] text-[14px] leading-[1.2] whitespace-nowrap flex-shrink-0 data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:opacity-100 data-[state=inactive]:opacity-50 hover:opacity-70"
                >
                  {credential.credential}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <div className="px-[20px]">
              {allResultsData && (
                <Tabs.Content
                  key={allResultsData.credentialId}
                  value={allResultsData.credentialId}
                  className="w-full"
                >
                  <div className="flex flex-col gap-[20px]">
                    {otherTabsData.map((data) => (
                      <div
                        key={data.credentialId}
                        className="border-b border-black/10 pb-[20px] last:border-b-0"
                      >
                        {renderPollResultCredential(data)}
                      </div>
                    ))}
                  </div>
                </Tabs.Content>
              )}

              {otherTabsData.map((data) => (
                <Tabs.Content
                  key={data.credentialId}
                  value={data.credentialId}
                  className="w-full pt-[10px] px-[10px] pb-[20px]"
                >
                  {renderPollResultCredential(data)}
                </Tabs.Content>
              ))}
            </div>
          </Tabs.Root>
        ) : (
          <div className="text-center p-[20px] text-black/60">
            No available credentials and results
          </div>
        )}
      </div>
    </div>
  );
};

export default PollResultComponent;
