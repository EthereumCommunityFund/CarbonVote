import { CardHolderIcon } from '@/components/icons';
import Button from '@/components/ui/buttons/Button';
import { cn } from '@/styles/cn';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface IButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label: string;
  className?: string;
  isLoading?: boolean;
  loadingContent?: React.ReactNode | string;
}

export const CommonButton = ({
  label,
  onClick,
  className = '',
  icon,
  isLoading,
  loadingContent,
}: IButtonProps) => (
  <Button
    className={cn(
      'w-full h-[30px] px-[10px] rounded-[8px] border border-black/10 bg-transparent focus:outline-none  flex justify-center items-center gap-[10px]',
      className
    )}
    onClick={onClick}
    disabled={isLoading}
  >
    {isLoading && loadingContent ? (
      <div className="absolute inset-0 flex items-center justify-center">
        {loadingContent}
      </div>
    ) : (
      <div className="flex gap-[10px] items-center">
        {icon}
        <span className="text-[14px] font-[500] leading-[1.4] text-black">
          {label}
        </span>
      </div>
    )}
  </Button>
);

interface IConnectButtonProps {
  label?: string;
  className?: string;
  isLoading?: boolean;
  loadingContent?: React.ReactNode | string;
}

const ConnectButton = ({
  label = 'Connect Wallet',
  className = '',
  isLoading,
  loadingContent,
}: IConnectButtonProps) => {
  const { openConnectModal } = useConnectModal();

  return (
    <CommonButton
      label={label}
      onClick={openConnectModal!}
      icon={<CardHolderIcon width={20} height={20} />}
      className={className}
      isLoading={isLoading}
      loadingContent={loadingContent}
    />
  );
};

export default ConnectButton;
