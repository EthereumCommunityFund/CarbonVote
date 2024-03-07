import React from 'react';
import Button from './ui/buttons/Button';
import { Label } from './ui/Label';
import { TbChevronDown } from 'react-icons/tb';
import PieChartComponent from './ui/PieChart';
import { PollOptionType, PollTypes } from '@/types';
import { IconType } from 'react-icons';
import styles from "@/styles/pollResult.module.css"

interface VoteData {
  id: string;
  votes: number;
  credential: string; 
}


interface IPollResultCredentialComponent {
  pollType: PollTypes,
  credentialType: string,
  icon: IconType,
  optionsData: VoteData[], 
  isExpanded: boolean,
  toggleExpanded: () => void;
}

const PollResultCredentialComponent: React.FC<IPollResultCredentialComponent> = ({
  icon: Credential_Icon,
  pollType,
  credentialType,
  optionsData,
  isExpanded,
  toggleExpanded,
}) => {

  return (
    <>
      <Button variant="primary" className={styles.dropdown} onClick={toggleExpanded}>
        <div className={styles.cred_flex}><Credential_Icon />{credentialType}</div>
        <TbChevronDown />
      </Button>
      {isExpanded &&
      <PieChartComponent 
        voteData={optionsData} 
        votingType={`${pollType}`} 
        credentialFilter={credentialType}
      />
      }
    </>
  );
};

export default PollResultCredentialComponent;