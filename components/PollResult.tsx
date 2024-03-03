import { PollResultComponentType, PollTypes } from '@/types';
import { Label } from './ui/Label';
import Button from './ui/buttons/Button';

import { TbChevronDown } from 'react-icons/tb';
import { EthIcon, GitCoinIcon, HeadCountIcon, PoapIcon, ProtocolGuildIcon, ZupassHolderIcon, } from './icons';
import PollResultCredentialComponent from './PollResultCredential';
import { useState } from 'react';
import styles from "@/styles/pollResult.module.css"


export const PollResultComponent = ({ pollType, optionsData }: PollResultComponentType) => {
  const [isZuPassExpanded, setIsZuPassExpanded] = useState<boolean>(true);
  const [isPOAPExpanded, setIsPOAPExpanded] = useState<boolean>(true);
  const [isProtocolExpanded, setIsProtocolExpanded] = useState<boolean>(true);
  const [isGitCoinExpanded, setIsGitCoinExpanded] = useState<boolean>(true);

  const areAllExpanded = isZuPassExpanded && isPOAPExpanded && isProtocolExpanded && isGitCoinExpanded;

  const toggleZuZaluExpanded = () => {
    setIsZuPassExpanded(prevExpanded => !prevExpanded);
  };

  const togglePOAPExpanded = () => {
    setIsPOAPExpanded(prevExpanded => !prevExpanded);
  };

  const toggleProtocolExpanded = () => {
    setIsProtocolExpanded(prevExpanded => !prevExpanded);
  };

  const toggleGitCoinExpanded = () => {
    setIsGitCoinExpanded(prevExpanded => !prevExpanded);
  };

  const toggleExpandAllResults = () => {
    const newValue = !areAllExpanded; // If all are expansed, collapse, otherwise expand
    setIsZuPassExpanded(newValue);
    setIsGitCoinExpanded(newValue);
    setIsPOAPExpanded(newValue);
    setIsProtocolExpanded(newValue);
  };

  return (
    <div className={styles.results_container}>
      <div className="flex justify-between mb-6">
        <Label className={styles.results_header}>Final Poll Results</Label>
        <Button variant="primary" className="rounded-md" onClick={toggleExpandAllResults}>
          {areAllExpanded ? 'Collapse' : 'Expand'} All Results
        </Button>
      </div>
      <div className='w-full flex flex-col gap-2.5'>
        <Label className={styles.cred_header}><EthIcon />Ether Holding Credential</Label>
        <Label className={styles.cred_header_small}>Ether Holding results are updated every n block until the end of the poll's selected time.</Label>
        <Button variant="primary" className={styles.dropdown}>
          <Label className={styles.cred_flex}><EthIcon />Ether Holding Results</Label>
          <TbChevronDown />
        </Button>
      </div>
      <div className='w-full flex flex-col gap-2.5 mt-5'>
        <Label className={styles.cred_header}><HeadCountIcon />Head Count Credentials</Label>
        <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Zuppass Holder Results'} icon={ZupassHolderIcon} optionsData={optionsData} toggleExpanded={toggleZuZaluExpanded} isExpanded={isZuPassExpanded} />
        <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'POAP Holder Results'} icon={PoapIcon} optionsData={optionsData} toggleExpanded={togglePOAPExpanded} isExpanded={isPOAPExpanded} />
        <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Protocol Guild Member Results'} icon={ProtocolGuildIcon} optionsData={optionsData} toggleExpanded={toggleProtocolExpanded} isExpanded={isProtocolExpanded} />
        <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Gitcoin Passport Results'} icon={GitCoinIcon} optionsData={optionsData} toggleExpanded={toggleGitCoinExpanded} isExpanded={isGitCoinExpanded} />
      </div>
    </div>
  );
};
