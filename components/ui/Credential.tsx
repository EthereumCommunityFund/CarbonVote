import * as React from 'react';
import { FingerprintIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CredentialProps {
  credentials: string[];
  maxDisplay?: number;
  className?: string;
  icon?: React.ReactNode;
  showCount?: boolean;
}

const Credential: React.FC<CredentialProps> = ({
  credentials,
  maxDisplay = 3,
  className,
  icon,
  showCount = true,
}) => {
  // Filter out empty/undefined credentials
  const validCredentials = credentials.filter(Boolean);

  if (validCredentials.length === 0) {
    return null;
  }

  const displayCredentials = validCredentials.slice(0, maxDisplay);
  const remainingCount = validCredentials.length - maxDisplay;
  const hasMore = remainingCount > 0;

  return (
    <div
      className={cn(
        'flex w-fit items-center gap-2 px-2.5 py-1.5',
        'rounded-lg bg-black/5 text-sm',
        className
      )}
    >
      <div className="flex-shrink-0">
        {icon || <FingerprintIcon size={16} className="opacity-50" />}
      </div>

      <div className="flex items-center gap-1">
        {showCount && (
          <span className="font-medium text-black/50">
            Credentials ({validCredentials.length})
          </span>
        )}

        <span className="text-black/30">•</span>

        <span className="font-semibold text-black">
          {displayCredentials.join(', ')}
          {hasMore && (
            <span className="text-black/60 font-normal">
              {' '}
              +{remainingCount} more
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default Credential;
