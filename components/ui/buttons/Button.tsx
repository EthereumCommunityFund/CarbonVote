import * as React from 'react';
import { cn } from '@/lib/utils';

const ButtonVariant = ['primary'] as const;
const ButtonSize = ['sm', 'base', 'lg'] as const;

type ButtonProps = {
  isLoading?: boolean;
  isDarkBg?: boolean;
  variant?: (typeof ButtonVariant)[number];
  size?: (typeof ButtonSize)[number];
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  classNames?: {
    leftIcon?: string;
    rightIcon?: string;
  };
} & React.ComponentPropsWithRef<'button'>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled: buttonDisabled,
      isLoading,
      variant = 'primary',
      size = 'base',
      isDarkBg = false,
      leftIcon,
      rightIcon,
      classNames,
      ...rest
    },
    ref
  ) => {
    const isDisabled = isLoading || buttonDisabled;

    const sizeStyles = {
      sm: 'px-2 py-1 text-xs md:text-sm',
      base: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-lg md:text-xl font-semibold',
    };

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'transition-all duration-200 ease-in-out',
          'rounded-md border-0',
          sizeStyles[size],
          variant === 'primary' && [
            'bg-gray-100 text-gray-900 hover:bg-gray-200',
            'active:bg-gray-300',
          ],
          isDisabled && 'opacity-50 cursor-not-allowed',
          isLoading && 'relative',
          className
        )}
        {...rest}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        <div className={cn('flex items-center', isLoading && 'invisible')}>
          {leftIcon && (
            <span className={cn('mr-2', classNames?.leftIcon)}>{leftIcon}</span>
          )}

          {children}

          {rightIcon && (
            <span className={cn('ml-2', classNames?.rightIcon)}>
              {rightIcon}
            </span>
          )}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
