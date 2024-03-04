import Pie from '@/public/images/pie.svg';
import Image from 'next/image';

export const PieIcon = () => {
  return (
    <Image className='w-6 h-6' src={Pie} alt='pie' />
  )
}