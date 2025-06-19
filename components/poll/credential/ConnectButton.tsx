import { CardHolderIcon } from '@/components/icons';
import Button from '@/components/ui/buttons/Button';
import { cn } from '@/styles/cn';
import { useConnectModal } from '@rainbow-me/rainbowkit';

interface IButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

export const CommonButton = ({
  label,
  onClick,
  className = '',
  icon,
}: IButtonProps) => (
  <Button
    className={cn(
      'w-full h-[30px] px-[10px] rounded-[8px] border border-black/10 bg-transparent focus:outline-none  flex justify-center items-center gap-[10px]',
      className
    )}
    onClick={onClick}
  >
    {icon}
    <span className="text-[14px] font-[500] leading-[1.4] text-black">
      {label}
    </span>
  </Button>
);

const ConnectButton = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <CommonButton
      label="Connect Wallet"
      onClick={openConnectModal!}
      icon={<CardHolderIcon width={20} height={20} />}
    />
  );
};

export default ConnectButton;
