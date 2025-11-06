import React, { useState } from 'react';
import CountdownTimer from '@/components/ui/CountDownTimer';
import { Label } from '@/components/ui/Label';
import { Poll } from '@/types';
import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Button from '../ui/buttons/Button';
import { ShareIcon } from '../icons';
import Modal from '../ui/Modal';
import { useToast } from '../ui/use-toast';
import { CopyIcon, TwitterIcon, XIcon } from '../icons';
import Link from 'next/link';
import { getHost } from '@/utils/url';
import { cn } from '@/styles/cn';
import { getCategoryLabel } from '@/utils/category';
import { POLL_CATEGORIES_MAP } from '../create/constant';

interface PollHeaderProps {
  pollIsLive: boolean;
  poll: Poll | null | undefined;
  isLoading?: boolean;
}

const PollHeader: React.FC<PollHeaderProps> = ({
  pollIsLive,
  poll,
  isLoading, // Destructure isLoading
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { toast } = useToast();

  const handleOpenShareModal = () => {
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Success',
        description: 'Link copied to clipboard!',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col p-5 gap-[20px] border-b border-black border-opacity-10 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="flex gap-[10px] items-center">
            <Skeleton variant="rounded" width={30} height={24} />{' '}
            <Skeleton variant="circular" width={16} height={16} />{' '}
            <Skeleton variant="rounded" width={150} height={20} />
          </div>
          <Skeleton variant="rounded" width={80} height={20} />
        </div>

        <div className="flex flex-col gap-[10px]">
          <Skeleton variant="rounded" width={80} height={24} />{' '}
          <Skeleton variant="rounded" width="100%" height={60} />
          <div className="flex justify-start flex-wrap gap-[10px]">
            {[1, 2, 3].map((category, index) => (
              <Skeleton key={index} variant="rounded" width={100} height={30} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const frameShareUrl = `${getHost()}/frames/${poll.id}`;
  const pollShareUrl = `${getHost()}/poll?id=${poll.id}`;

  return (
    <div className="flex flex-col p-[14px] md:p-[20px] gap-[20px] border-b border-black border-opacity-10">
      <div className="w-full flex justify-between items-center gap-[20px]">
        <div className="flex-1 flex justify-start items-center gap-[14px]">
          {pollIsLive ? (
            <div className="px-[10px] py-[6px] bg-[#F84A4A33] bg-opacity-20 rounded-[10px]">
              <p className="text-[14px] text-[#F84A4A] font-[700] leading-[1.4]">
                Live
              </p>
            </div>
          ) : (
            <div className="px-[10px] py-[6px] bg-black/5 opacity-60 rounded-[10px]">
              <p className="text-[13px] text-black font-[700] leading-[1.4]">
                Ended
              </p>
            </div>
          )}

          <div className="flex items-center gap-[5px] font-[500] text-[#666666] text-[14px]">
            <Image
              src="/images/clock.svg"
              className="opacity-50"
              width={20}
              height={20}
              alt="clock"
            />
            <CountdownTimer endTime={poll.endTime} />
          </div>
        </div>
        <div>
          <Button
            className="bg-transparent border border-black/10 px-[10px] py-[5px] rounded-[10px] flex gap-[10px] opacity-50 hover:opacity-80"
            onClick={handleOpenShareModal}
          >
            <ShareIcon width={18} height={18} />
            <span>Share</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-[10px]">
        <p className="text-black/50  text-[16px] font-extrabold leading-[1.4] uppercase">
          Motion:
        </p>
        <p className="text-[25px] font-[700] text-black leading-[1.2]">
          {poll?.title || poll?.name}
        </p>
        <div className="flex justify-start flex-wrap gap-[10px]">
          {poll?.categories?.map((category, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-[5px] rounded-[8px] px-[10px] h-[30px] bg-[#EBEBEB]',
                'text-[16px] text-black font-[500] leading-[1.25]'
              )}
            >
              <span className="opacity-30">#</span>
              <span>{getCategoryLabel(category)}</span>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isShareModalOpen}
        onClose={handleCloseShareModal}
        contentClassName="gap-0 p-0"
      >
        <div className="flex items-center justify-between px-[20px] py-[10px] border-b border-black/10">
          <div className="flex items-center gap-[5px] opacity-50">
            <ShareIcon width={24} height={24} />
            <p className="text-[16px] font-[500] leading-[1.6] text-black">
              Share
            </p>
          </div>
          <button
            onClick={handleCloseShareModal}
            className="p-[10px] rounded-full bg-black/10 opacity-70 flex items-center justify-center hover:bg-black/30"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>

        <div className="p-[20px] flex flex-col gap-[30px]">
          {/* share by link */}
          <div className="flex flex-col gap-[14px]">
            <p className="text-[18px] font-[600] leading-[1] text-black">
              Share via link
            </p>
            <p className="text-[14px] font-[400] leading-[18px] text-black">
              Use this link to share the poll with your community
            </p>
            <div className="flex items-center rounded-[6px] border border-black/10 overflow-hidden">
              <div className="flex-1 h-[40px] px-[10px] flex items-center text-black/50 truncate">
                <span className="truncate">{pollShareUrl}</span>
              </div>
              <button
                onClick={() => copyToClipboard(pollShareUrl)}
                className="p-3 bg-transparent hover:bg-gray-200"
              >
                <CopyIcon width={20} height={20} />
              </button>
            </div>
          </div>

          {/* social share */}
          <div className="flex flex-col gap-[14px]">
            <p className="text-[18px] font-[600] leading-[1] text-black">
              Share on social media
            </p>
            <p className="text-[14px] font-[400] leading-[18px] text-black">
              Share this poll with friends and followers on social media
              channels
            </p>
            <div className="flex justify-between flex-wrap gap-[14px]">
              <Link
                href={`https://warpcast.com/~/compose?text=${encodeURIComponent(`Check out this poll: ${poll.title || poll.name} ${pollShareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 shrink-0 min-w-[220px]"
              >
                <Button className="w-full  md:min-w-[216px] rounded-[6px] flex justify-start gap-[10px] px-[12px] py-[10px] text-[16px] font-[500] ">
                  <Image
                    src={'/images/Farcaster.svg'}
                    width={20}
                    height={20}
                    alt="Farcaster"
                  />
                  <span className="shrink-0">Farcaster</span>
                </Button>
              </Link>
              <Link
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this poll: ${poll.title || poll.name}`)}&url=${encodeURIComponent(pollShareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 shrink-0 min-w-[220px]"
              >
                <Button className="w-full md:min-w-[216px] rounded-[6px] flex justify-start gap-[10px] px-[12px] py-[10px] text-[16px] font-[500]">
                  <TwitterIcon width={20} height={20} />
                  <span className="shrink-0">X (formerly Twitter)</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Farcaster Frame */}
        <div className="flex flex-col gap-[14px] bg-[#F5F5F5] p-[20px] border-t border-black/10">
          <p className="text-[18px] font-[600] leading-[1] text-black">
            Farcaster Frame
          </p>
          <p className="text-[14px] font-[400] leading-[18px] text-black">
            Share an embeddable frame on Farcaster with this link
          </p>
          <div className="flex items-center rounded-[6px] border border-black/10 overflow-hidden">
            <div className="flex-1 h-[40px] px-[10px] flex items-center text-black/50 truncate">
              <span className="truncate">{frameShareUrl}</span>
            </div>
            <button
              onClick={() => copyToClipboard(frameShareUrl)}
              className="p-3 bg-transparent hover:bg-gray-200"
            >
              <CopyIcon width={20} height={20} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PollHeader;
