import * as React from 'react';
import { IconType } from 'react-icons';

import { cn } from '@/lib/utils';

type SelectProps = {
  leftIcon?: IconType,
  defaultText?: string,
} & React.ComponentPropsWithRef<'select'>

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      children,
      leftIcon,
      defaultText,
      ...rest
    },
    ref
  ) => {
    return (
      <select
        className={cn(
          'flex items-center gap-2.5',
          'pt-2.5 pb-2.5 pr-3.5 pl-3.5 w-32',
          'rounded-[10px] opacity-70 bg-[#0000001a]'
        )}
      >
        <option selected>{defaultText}</option>
      </select >
    )
  }
)

export default Select;