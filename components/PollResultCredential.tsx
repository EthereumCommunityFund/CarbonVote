import React from 'react';
import Button from './ui/buttons/Button';
import { Label } from './ui/Label';
import { TbChevronDown } from 'react-icons/tb';
import PieChartComponent from './ui/PieChart';
import { PollOptionType, PollTypes, VoteData } from '@/types';
import { IconType } from 'react-icons';
import styles from "@/styles/pollResult.module.css"


interface IPollResultCredentialComponent {
  pollType: PollTypes,
  credentialid: string,
  credentialname: string,
  icon: IconType,
  optionsData: VoteData[], 
  isExpanded: boolean,
  toggleExpanded: () => void;
}

const PollResultCredentialComponent: React.FC<IPollResultCredentialComponent> = ({
  icon: Credential_Icon,
  pollType,
  credentialid,
  credentialname,
  optionsData,
  isExpanded,
  toggleExpanded,
}) => {

  return (
    <>
      <Button variant="primary" className={styles.dropdown} onClick={toggleExpanded}>
        <div className={styles.cred_flex}><Credential_Icon />{credentialname}</div>
        <TbChevronDown />
      </Button>
      {isExpanded &&
      <PieChartComponent 
        voteData={optionsData} 
        votingType={`${pollType}`} 
        credentialFilter={credentialid}
      />
      }
    </>
  );
};

export default PollResultCredentialComponent;