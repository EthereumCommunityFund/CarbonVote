import { POLL_CATEGORIES_MAP } from '@/components/create/constant';

export const getCategoryLabel = (categoryValue: string): string => {
  return POLL_CATEGORIES_MAP[categoryValue] || categoryValue;
};
