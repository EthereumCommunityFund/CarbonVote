import { PollResultComponentType, PollTypes } from '@/types';
import { Label } from './ui/Label';
import Button from './ui/buttons/Button';

import { TbChevronDown } from 'react-icons/tb';
import { EthIcon, GitCoinIcon, HeadCountIcon, PoapIcon, ProtocolGuildIcon, ZupassHolderIcon } from './icons';
import PollResultCredentialComponent from './PollResultCredential';
import { useState } from 'react';


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
    <div className='bg-white pt-5 px-3 rounded-md'>
      <div className="flex justify-between mb-6">
        <Label className="text-2xl">Poll Results</Label>
        <Button variant="primary" className="rounded-md" onClick={toggleExpandAllResults}>
          {areAllExpanded ? 'Collapse' : 'Expand'} All Results
        </Button>
      </div>
      <div className='w-full flex flex-col gap-2.5'>
        <Label className='flex gap-2.5 items-center text-base'><EthIcon />Ether Holding Credential</Label>
        <Label className='text-xs'>Ether Holding results are updated every n block until the end of the poll's selected time.</Label>
        <Button variant="primary" className='w-full rounded-md flex justify-between'>
          <Label className='flex gap-2.5 items-center text-base'><EthIcon />Ether Holding</Label>
          <TbChevronDown />
        </Button>
      </div>
      <div className='w-full flex flex-col gap-2.5'>
        <Label className='flex gap-2.5 items-center text-base'><HeadCountIcon />Head Count Credentials</Label>
        <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Zuppass Holder'} icon={ZupassHolderIcon} optionsData={optionsData} toggleExpanded={toggleZuZaluExpanded} isExpanded={isZuPassExpanded} />
        <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'POAP Holder'} icon={PoapIcon} optionsData={optionsData} toggleExpanded={togglePOAPExpanded} isExpanded={isPOAPExpanded} />
        <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Protocol Guild Member'} icon={ProtocolGuildIcon} optionsData={optionsData} toggleExpanded={toggleProtocolExpanded} isExpanded={isProtocolExpanded} />
        <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Gitcoin Passport'} icon={GitCoinIcon} optionsData={optionsData} toggleExpanded={toggleGitCoinExpanded} isExpanded={isGitCoinExpanded} />
      </div>
    </div>
  );
};
