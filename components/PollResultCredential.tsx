

import Button from './ui/buttons/Button';

import { Label } from './ui/Label';

import { TbChevronDown } from 'react-icons/tb';
import PieChartComponent from './ui/PieChart';
import { HeadCountCredential, PollOptionType, PollTypes } from '@/types';
import { IconType } from 'react-icons';
import { useState } from 'react';

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
      <Button variant="primary" className='w-full rounded-md flex justify-between' onClick={toggleExpanded}>
        <Label className='flex gap-2.5 items-center text-base'><Credential_Icon />{credentialType}</Label>
        <TbChevronDown />
      </Button>
      {isExpanded &&
        <><PieChartComponent votes={optionsData} votingType={pollType} /></>
      }
    </>
  );
};

export default PollResultCredentialComponent;