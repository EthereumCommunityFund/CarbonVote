import React, { useMemo } from 'react';
import { cn } from '@/styles/cn';
import ExpandButton from './ExpandButton';

interface CredentialItemContainerProps {
  id: string;
  expandedIds: string[];
  setExpandedIds: React.Dispatch<React.SetStateAction<string[]>>;
  label: React.ReactNode;
  statusIcon: React.ReactNode;
  children?: React.ReactNode;
  detailContent?: React.ReactNode;
  footer?: React.ReactNode;
}

const CredentialItemContainer: React.FC<CredentialItemContainerProps> = ({
  id,
  expandedIds,
  setExpandedIds,
  label,
  statusIcon,
  children,
  detailContent,
  footer,
}) => {
  const isExpanded = useMemo(() => expandedIds.includes(id), [expandedIds, id]);

  return (
    <div className="flex flex-col bg-[#F5F5F5] rounded-[10px] overflow-hidden">
      <div className="flex flex-col gap-[10px] p-[10px]">
        <div className="flex justify-between">
          {label}
          {statusIcon}
        </div>
        <ExpandButton
          id={id}
          expandedIds={expandedIds}
          setExpandedIds={setExpandedIds}
        />
      </div>

      <div
        className={cn(
          'flex flex-col gap-[10px]',
          'bg-[#EBEBEB]',
          isExpanded ? 'p-[10px]' : 'hidden'
        )}
      >
        {children}

        {detailContent && (
          <div
            className={cn(
              'flex flex-col gap-[10px]',
              'text-[13px] font-[400] leading-[1.4] text-black/50'
            )}
          >
            {detailContent}
          </div>
        )}
      </div>

      <div className="bg-[#EBEBEB] w-full px-[10px]">
        {footer && (
          <div
            className={cn(
              'w-full py-[10px] text-[14px] font-[500] leading-[1.4] flex justify-start gap-[5px]',
              isExpanded ? 'border-t border-black/10' : ''
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default CredentialItemContainer;
