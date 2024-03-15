/*import { PollResultComponentType, PollTypes, CredentialTable} from '@/types';
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
    case 'zupass': return ZupassHolderIcon;
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
  const zupassIds = [CREDENTIALS.DevConnect.id, CREDENTIALS.ZuConnectResident.id, CREDENTIALS.ZuzaluResident.id];
  const processedCredentialTable = credentialTable.map(credential => {
    if (zupassIds.includes(credential.id)) {
      return {
        ...credential,
        credential: 'Zupass', 
        id: 'zupass' 
      };
    }
    return credential;
  });
  const uniqueCredentials: CredentialTable[] = processedCredentialTable.reduce((acc, current) => {
    const x = acc.find(item => item.credential === current.credential);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as CredentialTable[]);

  const toggleExpandAllResults = () => {
    const newValue = !areAllExpanded;
    let newExpandedStates = { ...expandedStates };
  
    uniqueCredentials.forEach(({ id }) => {
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
      <Label className={styles.cred_header}><HeadCountIcon />Head Count Credentials</Label>
      {uniqueCredentials.filter(credential => credential.id !== CREDENTIALS.EthHoldingOffchain.id && credential.credential !== 'EthHolding on-chain').map((credential) => (
        <div key={credential.id} className='w-full flex flex-col gap-2.5 mt-5'>
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
      </div>
    </div>
  );
};*/
import { useState } from 'react';
import styles from "@/styles/pollResult.module.css";
import { CREDENTIALS } from '@/src/constants';
import { PollResultComponentType, CredentialTable } from '@/types';
import { Label } from './ui/Label';
import Button from './ui/buttons/Button';
import { TbChevronDown } from 'react-icons/tb';
import {
  EthIcon, GitCoinIcon, HeadCountIcon, PoapIcon,
  ProtocolGuildIcon, ZupassHolderIcon, StakerIcon
} from './icons';
import PollResultCredentialComponent from './PollResultCredential';

const getCredentialIcon = (credentialId: string) => {
  switch (credentialId) {
    case CREDENTIALS.POAPapi.id: return PoapIcon;
    case CREDENTIALS.GitcoinPassport.id: return GitCoinIcon;
    case CREDENTIALS.ProtocolGuildMember.id: return ProtocolGuildIcon;
    case 'zupass': return ZupassHolderIcon;
    case CREDENTIALS.EthSoloStaker.id: return StakerIcon;
    case CREDENTIALS.EthHoldingOffchain.id: return EthIcon;
    default: return HeadCountIcon;
  }
};

export const PollResultComponent = ({ pollType, optionsData, credentialTable }: PollResultComponentType) => {
  const [expandedStates, setExpandedStates] = useState<{ [key: string]: boolean }>(
    credentialTable.reduce((acc, credential) => ({ ...acc, [credential.id]: true }), {})
  );
  const [showZupassDetails, setShowZupassDetails] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const areAllExpanded = Object.values(expandedStates).every(expanded => expanded);

  const zupassIds = [CREDENTIALS.DevConnect.id, CREDENTIALS.ZuConnectResident.id, CREDENTIALS.ZuzaluResident.id];
  const toggleExpandAllResults = () => {
    const newValue = !areAllExpanded;
    let newExpandedStates = { ...expandedStates };
  
    finalCredentials.forEach(({ id }) => {
      newExpandedStates[id] = newValue;
    });
  
    setExpandedStates(newExpandedStates);
  };

  const toggleZupassDetails = () => {
    setShowZupassDetails(prev => !prev);
  };
  const processedCredentialTable = credentialTable.map(credential => credential);

const shouldShowZupass = processedCredentialTable.some(credential => zupassIds.includes(credential.id));

const filteredCredentials = shouldShowZupass ? 
  processedCredentialTable.filter(credential => !zupassIds.includes(credential.id)) : 
  processedCredentialTable;


const finalCredentials = shouldShowZupass ?
  [...filteredCredentials, { id: 'zupass', credential: 'Zupass' }] :
  filteredCredentials;

  
  const zupassDetailCredentials = credentialTable.filter(credential => zupassIds.includes(credential.id));
const finalCredentialsWithDetails = finalCredentials.map(credential => {
  if (credential.id === 'zupass') {
    return {...credential, subCredentials: zupassDetailCredentials};
  }
  return credential;
});
console.log(finalCredentialsWithDetails,'final credentials')
  /*const processedCredentialTable = credentialTable.map(credential => {
    if (zupassIds.includes(credential.id)) {
      return {
        ...credential,
        credential: 'Zupass', 
        id: 'zupass' 
      };
    }
    return credential;
  });

  const uniqueCredentials: CredentialTable[] = processedCredentialTable.reduce((acc, current) => {
    const x = acc.find(item => item.credential === current.credential);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as CredentialTable[]);*/

  return (
    <div className={styles.results_container}>
      <div className="flex justify-between mb-6">
        <Label className={styles.results_header}>Final Poll Results</Label>
        <Button variant="primary" className="rounded-md" onClick={toggleExpandAllResults}>
          {areAllExpanded ? 'Collapse' : 'Expand'} All Results
        </Button>
      </div>
      {finalCredentialsWithDetails.filter(credential => credential.id !== CREDENTIALS.EthHoldingOffchain.id && credential.credential !== 'EthHolding on-chain').map((credential) => (
        <div key={credential.id} className='w-full flex flex-col gap-2.5 mt-5'>
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
    </div>
  );
};
