import POAP from '@/public/images/poap.png';
import { cn } from '@/styles/cn';
import Image from 'next/image';

export const PoapIcon = ({ className = '' }: { className?: string }) => {
  return <Image className={cn('w-6 h-6', className)} src={POAP} alt="poap" />;
};
