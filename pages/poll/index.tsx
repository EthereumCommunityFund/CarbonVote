'use client';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { ArrowLeftIcon } from '@/components/icons';
import Button from '@/components/ui/buttons/Button';
import { useRouter } from 'next/router';
import { useUserPassportContext } from '@/context/PassportContext';
import { useAccount, useConfig } from 'wagmi';
import {
  PollTypes,
  VoteData,
  CredentialTable,
  SelectedOptionData,
} from '@/types';
import { CREDENTIALS } from '@/src/constants';
import PollResultComponent from '@/components/poll/result/PollResult';
import usePollData from '@/hooks/poll/usePollData';
import useUserData from '@/hooks/poll/useUserData';
import usePollResults from '@/hooks/poll/usePollResults';
import useVoting from '@/hooks/poll/useVoting';
import PollHeader from '@/components/poll/PollHeader';
import PollDescription from '@/components/poll/PollDescription';
import PollDetails from '@/components/poll/PollDetails';
import CredentialsSection from '@/components/poll/credential/CredentialsSection';
import PollVotingArea from '@/components/poll/PollVotingArea';
import VotingPopup from '@/components/poll/vote/VotingPopup';
import { cn } from '@/styles/cn';
import ResultQuickAccessTab from '@/components/poll/ResultQuickAccessTab';
import { devLog } from '@/utils/devLog';
import VoteProcessPopup from '@/components/poll/vote/VoteProcessPopup';
import useEthOnChainData from '@/hooks/poll/useEthOnChainData';
import { getHost } from '@/utils/url';

const PollPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const {
    poll,
    options,
    credentialTable,
    isContractPoll,
    isEthHoldingPoll,
    pollIsLive,
    endBlockNumber,
    requiredGitScore,
    isFetchFinish,
    isLoading: isPollDataLoading,
    error: pollDataError,
  } = usePollData(id);

  const {
    userVotedOption,
    refreshData: refreshEthData,
    optionsVotersData,
    hasEthOnChainOption,
  } = useEthOnChainData(options, pollIsLive, poll?.end_block_number);

  const {
    signIn,
    isPassportConnected,
    verifyZuconnectticket,
    devconnectVerify,
    zuzaluVerify,
  } = useUserPassportContext();
  const { address: account } = useAccount();
  const config = useConfig();

  const {
    userAvailableCredentials,
    userScore,
    credentialCardReady,
    checkCredentials,
    isLoading: isUserDataLoading,
    isUserDataFetched,
    error: userDataError,
  } = useUserData({
    poll: poll ?? null,
    pollIsLive,
    credentialTable,
    userVotedOption,
    options,
    account,
    isPassportConnected,
    pollId: id as string | undefined,
    isPollDataFetched: isFetchFinish,
  });

  const [voteTable, setVoteTable] = useState<string[]>([]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedOptionData, setSelectedOptionData] =
    useState<SelectedOptionData>();
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [eventDetails, setEventDetails] = useState<any[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [zupasspoll] = useState(false);

  const [activeTab, setActiveTab] = useState<'info' | 'results'>('info');
  const resultsRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);

  const hasAvailableCredential = userAvailableCredentials.length > 0;

  const hasWhitelist = useMemo(() => {
    return (
      poll?.white_list &&
      Array.isArray(poll.white_list) &&
      poll.white_list.length > 0
    );
  }, [poll?.white_list]);

  const isAddressInWhitelist = useMemo(() => {
    if (!account || !poll?.white_list || !Array.isArray(poll.white_list))
      return false;
    return poll.white_list.some(
      (address: string) => address.toLowerCase() === account.toLowerCase()
    );
  }, [account, poll?.white_list]);

  const {
    pollResultData,
    contractPollResultData,
    isLoading: isResultsLoading,
    error: resultsError,
    refreshResults: refreshPollResults,
    latestBlockNumber,
    isPollResultFetched,
  } = usePollResults({
    pollId: id as string | undefined,
    poll: poll || null,
    pollIsLive,
    options,
    credentialTable,
    isEthHoldingPoll,
    endBlockNumber,
    isFetchFinish,
    optionsVotersData,
    hasEthOnChainOption,
  });

  const {
    castVoteFlow,
    votingProcess,
    onVoteProcessPopupClose,
    initializeVoting,
    processCurrentCredential,
    retryCurrentCredential,
    skipCurrentCredential,
    processNextCredential,
  } = useVoting({
    poll: poll ?? null,
    credentialTable,
    options,
    userScore,
    config,
    isPassportConnected,
    refreshResults: refreshPollResults as () => Promise<void>,
    checkCredentials: checkCredentials as () => Promise<void>,
    setVoteTable,
    setShowConfirmationPopup,
  });

  const handleVotesRadioChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const credentialId = event.target.value;
      const isCurrentlyChecked = event.target.checked;

      setVoteTable((prevVoteTable) => {
        if (isCurrentlyChecked && !prevVoteTable.includes(credentialId)) {
          return [...prevVoteTable, credentialId];
        } else if (!isCurrentlyChecked) {
          return prevVoteTable.filter((id) => id !== credentialId);
        }
        return prevVoteTable;
      });
    },
    []
  );

  const handleSelectAllClick = useCallback(() => {
    const allAvailableCredentialIds = credentialTable.reduce(
      (acc: string[], cred) => {
        const credentialDetail = userAvailableCredentials.find(
          (availableCred: CredentialTable) => availableCred.id === cred.id
        );

        const isAvailable =
          !!credentialDetail &&
          (!credentialDetail.votedOption ||
            credentialDetail.votedOptionName !==
              selectedOptionData?.option_description);

        if (isAvailable) {
          acc.push(cred.id);
        }
        return acc;
      },
      []
    );

    const isAllSelected =
      allAvailableCredentialIds.every((id) => voteTable.includes(id)) &&
      voteTable.length === allAvailableCredentialIds.length;

    setVoteTable(isAllSelected ? [] : allAvailableCredentialIds);
  }, [
    credentialTable,
    userAvailableCredentials,
    voteTable,
    selectedOptionData,
  ]);

  const handleOptionSelect = useCallback(
    (
      optionId: string,
      optionIndex: number | undefined,
      option_description: string
    ) => {
      setVoteTable([]);
      setSelectedOptionData({
        optionId,
        optionIndex,
        option_description,
      });
      setIsPopupOpen(true);
    },
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const scrollContainer = document.getElementById('main-scroll-container');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [id]);

  useEffect(() => {
    if (!isPopupOpen && !showConfirmationPopup) {
      setSelectedOptionData(undefined);
    }
  }, [isPopupOpen, showConfirmationPopup]);

  const handleAddressToggleExpanded = useCallback(() => {
    setIsAddressExpanded((prev) => !prev);
  }, []);

  const scrollToResults = useCallback(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // setActiveTab('results');
    }
  }, []);

  const scrollToDetails = useCallback(() => {
    if (detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleBackClick = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleZupassConnect = useCallback(
    async (credentialId: string) => {
      try {
        switch (credentialId) {
          case CREDENTIALS.DevConnect.id:
            await devconnectVerify();
            await checkCredentials();
            break;
          case CREDENTIALS.ZuConnectResident.id:
            await verifyZuconnectticket();
            await checkCredentials();
            break;
          case CREDENTIALS.ZuzaluResident.id:
            await zuzaluVerify();
            await checkCredentials();
            break;
        }
      } catch (error) {
        console.error('Error handling Zupass connect:', error);
      }
    },
    [devconnectVerify, verifyZuconnectticket, zuzaluVerify, checkCredentials]
  );

  const isPollCoreLoading = isPollDataLoading || !isFetchFinish;
  const isVotingLoading = isPollCoreLoading || !options;
  const isResultsDisplayLoading = isResultsLoading;
  const isCredentialsLoading = isUserDataLoading;

  const handlePopupClose = useCallback(() => {
    setIsPopupOpen(false);
  }, []);

  const userHasVoted = useMemo(() => {
    return (
      userAvailableCredentials?.some((cred) => !!cred.votedOptionName) ?? false
    );
  }, [userAvailableCredentials]);

  const onRefreshAfterVote = useCallback(() => {
    refreshEthData();
    refreshPollResults();
    checkCredentials();
  }, [refreshEthData, refreshPollResults, checkCredentials]);

  // Generate OG image URL with timestamp for Twitter cache busting
  const ogImageUrl = useMemo(() => {
    if (!id) return '';
    const timestamp = Date.now();
    return `${getHost()}/api/og/${id}?t=${timestamp}`;
  }, [id]);

  const pageTitle = poll?.title ? `${poll.title} - Carbonvote` : 'Carbonvote';
  const pageDescription =
    poll?.description ||
    'Decentralized voting platform for the Ethereum community';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        {/* Open Graph Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={`${getHost()}/poll?id=${id}`} />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
      </Head>

      <div
        className={cn(
          'w-full',
          'flex flex-col px-[10px] pt-[20px] pb-[70px] gap-[10px]',
          'md:flex-row md:justify-center md:pt-[40px] md:gap-[10px] xl:gap-[32px]',
          'text-black'
        )}
      >
        <div className="flex-1 min-w-0 flex flex-col gap-2.5 md:max-w-[760px] xl:max-w-[800px]">
          <div className="flex flex-col gap-[20px]">
            <div>
              <Button
                className="rounded-[10px] bg-transparent border-none shadow-none text-[16px] font-[700] px-[14px] py-[10px]"
                leftIcon={<ArrowLeftIcon />}
                onClick={handleBackClick}
              >
                Back
              </Button>
            </div>

            <ResultQuickAccessTab
              onDefaultTab={() => setActiveTab('info')}
              onScrollToResults={scrollToResults}
              onScrollToDetails={scrollToDetails}
            />
          </div>

          <div className="bg-white flex flex-col gap-[10px] rounded-xl border border-black border-opacity-10">
            <PollHeader
              poll={poll}
              pollIsLive={pollIsLive}
              isLoading={isPollCoreLoading}
            />

            <PollDescription poll={poll} isLoading={isPollCoreLoading} />

            <div className="p-[10px] md:p-[20px]">
              <PollVotingArea
                pollIsLive={pollIsLive}
                hasAvailableCredential={hasAvailableCredential}
                options={options}
                selectedOptionData={selectedOptionData}
                handleOptionSelect={handleOptionSelect}
                isContractPoll={isContractPoll}
                isEthHoldingPoll={isEthHoldingPoll}
                isAddressExpanded={isAddressExpanded}
                handleAddressToggleExpanded={handleAddressToggleExpanded}
                contractPollResultData={contractPollResultData}
                latestBlockNumber={latestBlockNumber}
                endBlockNumber={endBlockNumber}
                refreshResults={refreshPollResults}
                isLoading={isVotingLoading}
                userHasVoted={userHasVoted}
              />
            </div>
          </div>

          <div
            ref={resultsRef}
            className="bg-white border border-black/10 rounded-[10px]"
          >
            <PollResultComponent
              pollOptions={options}
              pollType={PollTypes.HEAD_COUNT}
              optionsData={pollResultData as VoteData[]}
              credentialTable={credentialTable}
              isLoading={isPollCoreLoading}
              isResultsLoading={isResultsDisplayLoading}
              isPollResultFetched={isPollResultFetched}
              latestBlockNumber={latestBlockNumber || 0}
              endBlockNumber={endBlockNumber || 0}
              onRefresh={refreshPollResults}
              contractPollResultData={contractPollResultData}
            />
          </div>
        </div>

        <div
          ref={detailsRef}
          className="flex flex-col pb-4 gap-5 w-full shrink-0 md:w-[325px]"
        >
          <PollDetails
            poll={poll}
            credentialTable={credentialTable}
            isLoading={isPollCoreLoading}
          />

          <CredentialsSection
            pollIsLive={pollIsLive}
            credentialTable={credentialTable}
            userAvailableCredentials={userAvailableCredentials}
            expandedIds={expandedIds}
            setExpandedIds={setExpandedIds}
            zupasspoll={zupasspoll}
            isPassportConnected={isPassportConnected}
            signIn={signIn}
            handleZupassConnect={handleZupassConnect}
            account={account}
            userScore={userScore}
            endBlockNumber={endBlockNumber}
            requiredGitScore={requiredGitScore}
            poll={poll ?? null}
            eventDetails={eventDetails}
            setEventDetails={setEventDetails}
            isLoading={isCredentialsLoading}
            isUserDataFetched={isUserDataFetched}
            userHasVoted={userHasVoted}
          />
        </div>

        <VotingPopup
          selectedOptionData={selectedOptionData}
          credentialTable={credentialTable || []}
          userAvailableCredentials={userAvailableCredentials || []}
          voteTable={voteTable}
          handleVotesRadioChange={handleVotesRadioChange}
          handleSelectAllClick={handleSelectAllClick}
          setShowConfirmationPopup={setShowConfirmationPopup}
          initializeVoting={initializeVoting}
          castVoteFlow={castVoteFlow}
          isOpen={isPopupOpen}
          onClose={handlePopupClose}
          poll={poll ?? null}
          account={account}
          checkCredentials={checkCredentials}
          isCredentialsLoading={isUserDataLoading}
        />

        <VoteProcessPopup
          onClose={onVoteProcessPopupClose}
          onRefresh={onRefreshAfterVote}
          option_description={selectedOptionData?.option_description || ''}
          isOpen={showConfirmationPopup}
          selectedOptionData={selectedOptionData}
          credentialTable={credentialTable || []}
          voteTable={voteTable}
          votingProcess={votingProcess}
          castVoteFlow={castVoteFlow}
          autoMode={true}
          initializeVoting={initializeVoting}
          processCurrentCredential={processCurrentCredential}
          retryCurrentCredential={retryCurrentCredential}
          skipCurrentCredential={skipCurrentCredential}
          processNextCredential={processNextCredential}
        />
      </div>
    </>
  );
};

export default PollPage;
