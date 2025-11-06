import React from 'react';
import Button from '../../ui/buttons/Button';
import { TbChevronDown } from 'react-icons/tb';
import PieChartComponent from './PieChart';
import { PollTypes, VoteData } from '@/types';
import { IconType } from 'react-icons';

interface IPollResultCredentialComponent {
  pollType: PollTypes;
  credentialid: string;
  credentialname: string;
  icon: IconType;
  optionsData: VoteData[];
  isExpanded: boolean;
  toggleExpanded: () => void;
}

const PollResultCredentialComponent: React.FC<
  IPollResultCredentialComponent
> = ({
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
      <Button
        variant="primary"
        className="w-full bg-[#e9e9e9] rounded-full p-[10px] flex items-center justify-between"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-[20px] font-bold text-black text-[16px]">
          <Credential_Icon /> {credentialname}
        </div>
        <TbChevronDown />
      </Button>
      {isExpanded && (
        <>
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
