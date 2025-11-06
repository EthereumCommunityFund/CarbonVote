import { IS_PROD } from '@/src/constants';

let hostUrl: string | undefined;

export const getHost = (): string => {
  if (typeof window === 'undefined') {
    return IS_PROD ? 'https://carbonvote.com' : 'https://beta.carbonvote.com';
  }

  if (hostUrl) {
    return hostUrl;
  }

  const { protocol, host } = window.location;
  hostUrl = `${protocol}//${host}`;
  return hostUrl;
};
