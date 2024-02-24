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
    if (isZuPassExpanded && isPOAPExpanded && isProtocolExpanded && isGitCoinExpanded) {
      setIsZuPassExpanded(false);
      setIsGitCoinExpanded(false);
      setIsPOAPExpanded(false);
      setIsProtocolExpanded(false);
    } else {
      setIsZuPassExpanded(true);
      setIsGitCoinExpanded(true);
      setIsPOAPExpanded(true);
      setIsProtocolExpanded(true);
    }
  }

  return (
    <div className='bg-white pt-5 px-3 rounded-md'>
      <div className="flex justify-between mb-6">
        <Label className="text-2xl">Poll Results</Label>
        <Button variant="primary" className="rounded-md" onClick={toggleExpandAllResults}>
          Expand All Results
        </Button>
      </div>
      {pollType === PollTypes.ETH_HOLDING ?
        <div className='w-full flex flex-col gap-2.5'>
          <Label className='flex gap-2.5 items-center text-base'><EthIcon />Ether Holding Credential</Label>
          <Label className='text-xs'>Ether Holding results are updated every n block until the end of the poll's selected time.</Label>
          <Button variant="primary" className='w-full rounded-md flex justify-between'>
            <Label className='flex gap-2.5 items-center text-base'><EthIcon />Ether Holding Results</Label>
            <TbChevronDown />
          </Button>
        </div> :
        <div className='w-full flex flex-col gap-2.5'>
          <Label className='flex gap-2.5 items-center text-base'><HeadCountIcon />Head Count Credentials</Label>
          <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Zuppass Holder Results'} icon={ZupassHolderIcon} optionsData={optionsData} toggleExpanded={toggleZuZaluExpanded} isExpanded={isZuPassExpanded} />
          <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'POAP Holder Results'} icon={PoapIcon} optionsData={optionsData} toggleExpanded={togglePOAPExpanded} isExpanded={isPOAPExpanded} />
          <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Protocol Guild Member Results'} icon={ProtocolGuildIcon} optionsData={optionsData} toggleExpanded={toggleProtocolExpanded} isExpanded={isProtocolExpanded} />
          <PollResultCredentialComponent pollType={PollTypes.HEAD_COUNT} credentialType={'Gitcoin Passport Results'} icon={GitCoinIcon} optionsData={optionsData} toggleExpanded={toggleGitCoinExpanded} isExpanded={isGitCoinExpanded} />
        </div>
      }
    </div>
  );
};
