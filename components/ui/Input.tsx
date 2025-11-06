import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, ...props }, ref) => {
    const baseClassName = cn(
      'flex w-full rounded-[6px] border px-[12px] py-[10px] text-sm font-normal font-inter placeholder:text-black/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      'bg-[#F9F9F9] border-black/10',
      // 'focus:border-black/20 focus:border-[2px]',
      hasError && 'bg-[#EFEFEF] border-[rgba(255,110,110,0.6)] border-[2px]',
      className
    );

    if (type === 'textarea') {
      return (
        <textarea
          className={cn(baseClassName, 'resize-none')}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        type={type}
        className={cn(baseClassName, 'h-10')}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
