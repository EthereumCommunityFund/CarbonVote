import { useState, useEffect } from 'react';
import styles from '@/styles/pollResult.module.css';
import { CREDENTIALS } from '@/src/constants';
import { PollResultComponentType, CredentialTable, VoteData } from '@/types';
import { Label } from './ui/Label';
import Button from './ui/buttons/Button';
import { TbChevronDown } from 'react-icons/tb';
import {
  EthIcon,
  GitCoinIcon,
  HeadCountIcon,
  PoapIcon,
  ProtocolGuildIcon,
  ZupassHolderIcon,
  StakerIcon,
} from './icons';
import PollResultCredentialComponent from './PollResultCredential';
import PieChartComponent from './ui/PieChart';
const getCredentialIcon = (credentialId: string) => {
  switch (credentialId) {
    case CREDENTIALS.POAPapi.id:
      return PoapIcon;
    case CREDENTIALS.GitcoinPassport.id:
      return GitCoinIcon;
    case CREDENTIALS.ProtocolGuildMember.id:
      return ProtocolGuildIcon;
    case 'zupass':
      return ZupassHolderIcon;
    case CREDENTIALS.EthSoloStaker.id:
      return StakerIcon;
    case CREDENTIALS.EthHoldingOffchain.id:
      return EthIcon;
    default:
      return HeadCountIcon;
  }
};

export const PollResultComponent = ({
  pollType,
  optionsData,
  credentialTable,
}: PollResultComponentType) => {
  const [expandedStates, setExpandedStates] = useState<{
    [key: string]: boolean;
  }>(
    credentialTable.reduce(
      (acc, credential) => ({ ...acc, [credential.id]: true }),
      {}
    )
  );
  const [showZupassDetails, setShowZupassDetails] = useState(true);
  const [selectedZupassCredential, setSelectedZupassCredential] =
    useState<string>('');
  const toggleExpanded = (id: string) => {
    setExpandedStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const zupassIds = [
    CREDENTIALS.DevConnect.id,
    CREDENTIALS.ZuConnectResident.id,
    CREDENTIALS.ZuzaluResident.id,
  ];
  useEffect(() => {
    setExpandedStates(
      credentialTable.reduce(
        (acc, credential) => ({ ...acc, [credential.id]: true }),
        {}
      )
    );
  }, [credentialTable]);
  const zupassCredentials = credentialTable.filter((credential) =>
    zupassIds.includes(credential.id)
  );
  let mergedZupassVoteData: VoteData[] = [];
  if (optionsData) {
    const voteZupassCredentials = optionsData.filter((credential) =>
      zupassIds.includes(credential.credential)
    );
    const mergeVoteData = (voteZupassCredentials: VoteData[]): VoteData[] => {
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

      return Array.from(votesMap.values());
    };

    mergedZupassVoteData = mergeVoteData(voteZupassCredentials);
  }

  const areAllExpanded = Object.values(expandedStates).every(
    (expanded) => expanded
  );

  const toggleExpandAllResults = () => {
    const newValue = !areAllExpanded;
    let newExpandedStates = { ...expandedStates };

    normalCredentials.forEach(({ id }) => {
      newExpandedStates[id] = newValue;
    });

    setShowZupassDetails(newValue);

    setExpandedStates(newExpandedStates);
  };

  const toggleZupassDetails = () => {
    setShowZupassDetails((prev) => !prev);
  };
  const processedCredentialTable = credentialTable.map(
    (credential) => credential
  );
  const handleZupassSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedZupassCredential(selectedValue);
  };

  const zupassOptions = [
    { value: 'all', label: 'All' },
    ...zupassCredentials.map((credential) => ({
      value: credential.id,
      label: credential.credential,
    })),
  ];

  const shouldShowZupass = processedCredentialTable.some((credential) =>
    zupassIds.includes(credential.id)
  );

  const normalCredentials = credentialTable.filter(
    (credential) =>
      !zupassIds.includes(credential.id) &&
      credential.id !== CREDENTIALS.EthHoldingOffchain.id &&
      credential.credential !== 'EthHolding on-chain'
  );

  return (
    <div className={styles.results_container}>
      <div className="flex justify-between mb-6">
        <Label className={styles.results_header}>Final Poll Results</Label>
        <Button
          variant="primary"
          className="rounded-md"
          onClick={toggleExpandAllResults}
        >
          {areAllExpanded ? 'Collapse' : 'Expand'} All Results
        </Button>
      </div>

      {normalCredentials.map((credential) => (
        <div key={credential.id} className="w-full flex flex-col gap-2.5 mt-5">
          <PollResultCredentialComponent
            pollType={pollType}
            credentialid={credential.id || ''}
            credentialname={credential.credential || ''}
            icon={getCredentialIcon(credential.id) || HeadCountIcon}
            optionsData={optionsData}
            isExpanded={expandedStates[credential.id || '']}
            toggleExpanded={() => toggleExpanded(credential.id)}
          />
        </div>
      ))}

      {zupassCredentials.length > 0 && (
        <div className="w-full flex flex-col gap-2.5 mt-5">
          <Button
            variant="primary"
            className={styles.dropdown}
            onClick={toggleZupassDetails}
          >
            <div className={styles.cred_flex}>
              <ZupassHolderIcon /> Zupass
            </div>
            <TbChevronDown />
          </Button>
          {showZupassDetails && (
            <div>
              <div className={styles.cred_dropdown_container}>
                <select
                  onChange={handleZupassSelect}
                  className={styles.select_dropdown}
                  title="Zupass Credential"
                >
                  <option value="" disabled>
                    Select Credentials
                  </option>
                  {zupassOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {selectedZupassCredential === 'all' ||
              selectedZupassCredential === '' ? (
                <PieChartComponent
                  voteData={mergedZupassVoteData}
                  votingType={`${pollType}`}
                  credentialFilter="All"
                />
              ) : (
                <PieChartComponent
                  voteData={optionsData}
                  votingType={`${pollType}`}
                  credentialFilter={selectedZupassCredential as string}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
