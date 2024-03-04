

import Button from './ui/buttons/Button';

import { Label } from './ui/Label';

import { TbChevronDown } from 'react-icons/tb';
import PieChartComponent from './ui/PieChart';
import { HeadCountCredential, PollOptionType, PollTypes } from '@/types';
import { IconType } from 'react-icons';
import styles from "@/styles/pollResult.module.css"

interface IPollResultCredentialComponent {
  pollType: PollTypes,
  credentialType: string,
  icon: IconType,
  optionsData: PollOptionType[],
  isExpanded: boolean,
  toggleExpanded: () => void;
}

export const PollResultCredentialComponent: React.FC<IPollResultCredentialComponent> = ({ icon: Credential_Icon, pollType, credentialType, optionsData, isExpanded, toggleExpanded }) => {

  return (
    <>
      <Button variant="primary" className={styles.dropdown} onClick={toggleExpanded}>
        <Label className={styles.cred_flex}><Credential_Icon />{credentialType}</Label>
        <TbChevronDown />
      </Button>
      {isExpanded &&
        <><PieChartComponent votes={optionsData} votingType={pollType} /></>
      }
    </>
  );
};

export default PollResultCredentialComponent;