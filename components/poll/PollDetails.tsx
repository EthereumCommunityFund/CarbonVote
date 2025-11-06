import React, { useMemo } from 'react';
import { Label } from '@/components/ui/Label';
import { EthLogoIcon, MultiplePeopleIcon, StackIcon } from '@/components/icons';
import { toast } from '@/components/ui/use-toast';
import { Poll, CredentialTable } from '@/types';
import Image from 'next/image';
import { Skeleton } from '@mui/material';
import { getTimezoneAbbreviation, formatDateTime } from '@/utils/time';
import { devLog } from '@/utils/devLog';
import { isEthHoldingCredential } from '@/utils/pollUtils';
import { getHost } from '@/utils/url';

interface PollDetailsProps {
  poll: Poll | null | undefined;
  credentialTable: CredentialTable[];
  isLoading?: boolean;
}

const PollDetails: React.FC<PollDetailsProps> = ({
  poll,
  credentialTable,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-black border-opacity-10 animate-pulse">
        <div className="w-full px-[20px] py-[10px]">
          <Skeleton variant="rounded" width={100} height={28} />
        </div>
        <div className="border-b border-black border-opacity-10" />
        <div className="w-full flex flex-col p-[14px] gap-3.5">
          <div className="flex flex-col gap-2.5">
            <Skeleton variant="rounded" width={80} height={24} />
            <div className="flex gap-[10px]">
              <Skeleton variant="rounded" width={120} height={28} />
              <Skeleton variant="rounded" width={100} height={28} />
            </div>
          </div>
          <div className="flex flex-col gap-2.5 py-2.5 border-t border-black border-opacity-10">
            <Skeleton variant="rounded" width={100} height={24} />
            <Skeleton variant="rounded" width="85%" height={28} />
            <Skeleton variant="rounded" width={40} height={20} />
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const copyFrameLink = async () => {
    try {
      await navigator.clipboard.writeText(`${getHost()}/frames/${poll.id}`);
      toast({
        title: 'Success',
        description: 'Link copied to clipboard!',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const isNestedPoll = credentialTable.length > 1;
  const hasEthHolding = credentialTable.some((credential) =>
    isEthHoldingCredential(credential)
  );
  const isHeadCount = credentialTable.some(
    (credential) => !isEthHoldingCredential(credential)
  );

  const renderIndicateButton = (text: string, icon: React.ReactNode) => {
    return (
      <div className="flex px-2.5 py-1 gap-1 bg-black bg-opacity-5 rounded-xl">
        {icon}
        <Label className="text-black text-opacity-50 font-bold text-sm">
          {text}
        </Label>
      </div>
    );
  };
  return (
    <div className="bg-white rounded-lg border border-black border-opacity-10">
      <div className="w-full px-5 py-2.5">
        <Label className="text-lg font-semibold">Details</Label>
      </div>

      <div className="border-b border-black border-opacity-10" />

      <div className="w-full flex flex-col p-3.5 gap-3.5">
        <div className="flex flex-col gap-2.5">
          <Label className="text-base opacity-80">Method:</Label>

          <div className="flex flex-wrap items-center gap-1">
            {isHeadCount &&
              renderIndicateButton(
                'HeadCount',
                <MultiplePeopleIcon className="size-[20px]" />
              )}
            {hasEthHolding && isHeadCount && '/'}
            {hasEthHolding &&
              renderIndicateButton(
                'ETHCount',
                <EthLogoIcon className="size-[20px]" />
              )}
            {/* {isNestedPoll &&
              renderIndicateButton(
                'Nested Credentials',
                <StackIcon className="size-[20px]" />
              )} */}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 py-2.5 border-t border-black border-opacity-10">
          <Label className="text-black/80 text-[16px] font-[600] leading-[1.6]">
            End Date:
          </Label>
          <Label className="text-lg font-bold">
            {formatDateTime(Number(poll?.endTime))}
          </Label>
          <Label className=" text-black opacity-40 text-sm font-medium">
            {getTimezoneAbbreviation()}
          </Label>
        </div>
      </div>
    </div>
  );
};

export default PollDetails;
