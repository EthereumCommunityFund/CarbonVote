import POAP from '@/public/images/poap.png';
import Image from 'next/image';

export const PoapIcon = () => {
  return (
    <Image className='w-6 h-6' src={POAP} alt='poap' />
  )
}