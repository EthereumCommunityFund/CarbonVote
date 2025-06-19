import { IS_PROD } from '@/src/constants';

export const devLog = (label: string, ...args: any[]) => {
  if (!IS_PROD) {
    const color = '#ff7f7f';
    console.log(
      `%c[CarbonVote] ${label}`,
      `background: ${color}; color: white; padding: 2px 4px; border-radius: 3px; font-weight: bold;`,
      ...args
    );
  }
};
