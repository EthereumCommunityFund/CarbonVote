import React from 'react';
import Button from './ui/buttons/Button';
import { TbChevronDown } from 'react-icons/tb';
import PieChartComponent from './ui/PieChart';
import { PollTypes, VoteData } from '@/types';
import { IconType } from 'react-icons';
import styles from "@/styles/pollResult.module.css";
import { CREDENTIALS } from '@/src/constants';

interface IPollResultCredentialComponent {
  pollType: PollTypes,
  credentialid: string,
  credentialname: string,
  icon: IconType,
  optionsData: VoteData[],
  isExpanded: boolean,
  toggleExpanded: () => void,
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
  const shouldShowOptions = [CREDENTIALS.DevConnect.name, CREDENTIALS.ZuConnectResident.name, CREDENTIALS.ZuzaluResident.name].some(num => credentialname.includes(num));

  return (
    <>
      <Button variant="primary" className={styles.dropdown} onClick={toggleExpanded}>
        <div className={styles.cred_flex}><Credential_Icon /> {credentialname}</div>
        <TbChevronDown />
      </Button>
      {isExpanded && (
        <>
          {shouldShowOptions && (
            <div className={styles.optionsContainer}>
              {credentialname.includes(CREDENTIALS.DevConnect.name) && <div className={styles.optionItem}>Devconnect</div>}
              {credentialname.includes(CREDENTIALS.ZuConnectResident.name) && <div className={styles.optionItem}>Zuconnect Resident</div>}
              {credentialname.includes(CREDENTIALS.ZuzaluResident.name) && <div className={styles.optionItem}>Zuzalu Resident</div>}
            </div>
          )}
          <PieChartComponent
            voteData={optionsData}
            votingType={`${pollType}`}
            credentialFilter={credentialid}
          />
        </>
      )}
    </>
  );
};

export default PollResultCredentialComponent;
