import React, { ReactNode, forwardRef } from 'react';
import { cn } from '@/styles/cn';
import { Z_INDEX_MAP } from '@/styles/styleConstants';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  containerClassName?: string;
  contentClassName?: string;
  keepMounted?: boolean;
  closeOnOutsideClick?: boolean;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      children,
      containerClassName,
      contentClassName,
      keepMounted = true,
      closeOnOutsideClick = true,
    },
    ref
  ) => {
    if (!keepMounted && !isOpen) return null;

    return (
      <div
        className={cn(
          'fixed w-full h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0000008a] grid place-items-center',
          !isOpen && 'hidden',
          containerClassName
        )}
        style={{
          zIndex: Z_INDEX_MAP.modal,
        }}
        onClick={closeOnOutsideClick ? onClose : undefined}
      >
        <div
          ref={ref}
          className={cn(
            'p-[20px] flex flex-col gap-[20px] bg-white rounded-[10px] border border-[rgba(0,0,0,0.2)] backdrop-blur-[20px] shadow-[0px_20px_34px_0px_rgba(0,0,0,0.14)] overflow-hidden',
            'max-w-[85%] md:w-[500px] md:max-w-[500px]',
            contentClassName
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
