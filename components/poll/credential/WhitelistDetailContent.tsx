import React, { useState } from 'react';
import { CommonButton } from '@/components/poll/credential/ConnectButton';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';
import { X as XIcon } from 'lucide-react';
import Button from '@/components/ui/buttons/Button';
import { Poll } from '@/types';

interface WhitelistDetailContentProps {
  poll: Poll | null;
}

const WhitelistDetailContent: React.FC<WhitelistDetailContentProps> = ({
  poll,
}) => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  if (
    !poll?.white_list ||
    !Array.isArray(poll.white_list) ||
    poll.white_list.length === 0
  ) {
    return null;
  }

  return (
    <div className="">
      <CommonButton
        label="View Whitelist"
        onClick={() => setIsListModalOpen(true)}
      />

      <Modal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        contentClassName="gap-0 p-0"
      >
        <div className="flex items-center justify-between p-[14px] border-b border-black/10">
          <div className="flex items-center gap-[5px] opacity-50">
            <Image
              src="/images/address_book.svg"
              alt="Credential"
              className="image-class-name"
              width={24}
              height={24}
            />
            <p className="text-[16px] font-[500] leading-[1.6] text-black">
              Whitelist Addresses
            </p>
          </div>
          <button
            onClick={() => setIsListModalOpen(false)}
            className="w-[34px] h-[34px] rounded-full bg-black/10 opacity-70 flex items-center justify-center hover:bg-black/30"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="w-full bg-white p-[14px]">
          <div className="max-h-[240px] overflow-y-auto bg-[#F5F5F5] rounded-[10px] p-[10px]">
            {poll.white_list.map((address: string, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between py-2"
              >
                <div className="text-[14px] truncate">{address}</div>
              </div>
            ))}
          </div>

          <div className="mt-[10px]">
            <Button
              className="w-full h-[40px] bg-[#EBEBEB] rounded-full justify-center"
              onClick={() => setIsListModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default WhitelistDetailContent;
