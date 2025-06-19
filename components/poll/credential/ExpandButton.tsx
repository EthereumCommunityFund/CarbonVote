import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React, { useCallback } from 'react';

interface ExpandButtonProps {
  id: string;
  expandedIds: string[];
  setExpandedIds: React.Dispatch<React.SetStateAction<string[]>>;
}

const ExpandButton: React.FC<ExpandButtonProps> = ({
  id,
  expandedIds,
  setExpandedIds,
}) => {
  const isExpanded = expandedIds.includes(id);

  const toggleExpand = useCallback(() => {
    setExpandedIds(
      isExpanded
        ? expandedIds.filter((expandedId) => expandedId !== id)
        : [...expandedIds, id]
    );
  }, [id, expandedIds, setExpandedIds, isExpanded]);

  return (
    <div>
      <button
        className="flex gap-1.5 text-sm text-black opacity-60 font-medium"
        onClick={toggleExpand}
      >
        <span className="w-[90px]">
          {isExpanded ? 'Hide Details' : 'Show Details'}
        </span>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};

export default React.memo(ExpandButton);
