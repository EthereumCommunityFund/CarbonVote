import React from 'react';
import { Label } from '@/components/ui/Label';
import { Poll } from '@/types';
import { Skeleton } from '@mui/material';
import EditorPro from '@/components/editorPro';
import dayjs from 'dayjs';
import { cn } from '@/lib/utils';

interface PollDescriptionProps {
  poll: Poll | null | undefined;
  isLoading?: boolean;
}

const isValidEditorContent = (str: string): boolean => {
  try {
    const parsed = JSON.parse(str);
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.content === 'string'
    );
  } catch (e) {
    return false;
  }
};

const PollDescription: React.FC<PollDescriptionProps> = ({
  poll,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-0 md:px-[10px] animate-pulse">
        <Skeleton variant="rounded" width={100} height={20} />
        <Skeleton
          variant="rounded"
          width="100%"
          height={300}
          className="mt-[10px]"
        />

        <div className="pt-[20px] px-[10px] flex gap-[5px] flex-wrap items-center border-t border-black/10">
          <Skeleton variant="rounded" width={40} height={24} />
          {[1, 2, 3].map((tag, index) => (
            <Skeleton variant="rounded" key={index} width={100} height={24} />
          ))}
        </div>

        <div className="mt-[10px] px-[10px] flex gap-[4px]">
          <Skeleton variant="rounded" width={40} height={20} />
          <Skeleton variant="rounded" width={60} height={20} />
        </div>
      </div>
    );
  }

  if (!poll || !poll.description) {
    return null;
  }

  const isRichTextContent = isValidEditorContent(poll.description);

  return (
    <div className="p-[10px] md:px-[20px]">
      <div>
        <Label className="text-sm uppercase text-black opacity-50 font-extrabold">
          Description:
        </Label>
      </div>
      <div>
        {isRichTextContent ? (
          <EditorPro
            value={poll.description}
            isEdit={false}
            className={{
              base: 'min-h-auto p-0 bg-transparent border-none',
              editorWrapper: 'p-0',
              editor: 'p-0',
            }}
          />
        ) : (
          <span dangerouslySetInnerHTML={{ __html: poll.description }} />
        )}
      </div>

      <div className="pt-[20px] px-[10px] flex gap-[5px] flex-wrap items-center border-t border-black/10">
        <span className="text-[14px] text-black/70 font-[500] leading-[1.4]">
          Tags:
        </span>
        {poll.tags?.map((tag, index) => (
          <span
            key={index}
            className={cn(
              'px-[8px] py-[2px] rounded-full bg-[#EBEBEB]',
              'text-[14px] text-black font-[500] leading-[20px]'
            )}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-[10px] px-[10px] text-[14px] text-black/70 font-[500] leading-[1.4]">
        Created:{' '}
        <span className="ml-[10px] text-black/50">
          {dayjs(poll.created_at).format('ddd, MMM D, YYYY')}
        </span>
      </div>
    </div>
  );
};

export default PollDescription;
