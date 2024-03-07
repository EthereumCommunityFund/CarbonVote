import { PollResultComponentType, PollTypes } from '@/types';
import { Label } from './ui/Label';
import Button from './ui/buttons/Button';

import { TbChevronDown } from 'react-icons/tb';
import { EthIcon, GitCoinIcon, HeadCountIcon, PoapIcon, ProtocolGuildIcon, ZupassHolderIcon, StakerIcon} from './icons';
import PollResultCredentialComponent from './PollResultCredential';
import { useState } from 'react';
import styles from "@/styles/pollResult.module.css"
import { CREDENTIALS } from '@/src/constants';


const getCredentialIcon = (credentialId: string) => {
  switch (credentialId) {
    case CREDENTIALS.POAPapi.id: return PoapIcon;
    case CREDENTIALS.GitcoinPassport.id: return GitCoinIcon;
    case CREDENTIALS.ProtocolGuildMember.id: return ProtocolGuildIcon;
    case CREDENTIALS.ZuConnectResident.id:
    case CREDENTIALS.DevConnect.id: 
    case CREDENTIALS.ZuzaluResident.id: 
    return ZupassHolderIcon;
    case CREDENTIALS.EthSoloStaker.id: return StakerIcon;
    case CREDENTIALS.EthHoldingOffchain.id: return EthIcon;
  }
};
export const PollResultComponent = ({ pollType, optionsData, credentialTable }: PollResultComponentType) => {
  const [expandedStates, setExpandedStates] = useState<{ [key: string]: boolean }>(
    credentialTable.reduce((acc, credential) => ({ ...acc, [credential.id]: true }), {})
  );

  const toggleExpanded = (id: string) => {
    setExpandedStates(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const areAllExpanded = Object.values(expandedStates).every(expanded => expanded);
  
  const toggleExpandAllResults = () => {
    const newValue = !areAllExpanded;
    const newExpandedStates: { [key: string]: boolean } = {};
    credentialTable.forEach(({ id }) => {
      newExpandedStates[id] = newValue;
    });
    setExpandedStates(newExpandedStates);
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
      {credentialTable.map((credential) => (
        <div key={credential.id} className='w-full flex flex-col gap-2.5 mt-5'>
          <PollResultCredentialComponent
            pollType={pollType}
            credentialType={credential.credential || ''}
            icon={getCredentialIcon(credential.id) || HeadCountIcon} 
            optionsData={optionsData}
            isExpanded={expandedStates[credential.id]}
            toggleExpanded={() => toggleExpanded(credential.id)}
          />
        </div>
      ))}
    </div>
  );
};