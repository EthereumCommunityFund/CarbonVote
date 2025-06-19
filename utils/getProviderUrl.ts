import { IS_PROD } from '@/src/constants';

export const getProviderUrl = () => {
  if (IS_PROD) {
    return process.env.NEXT_PUBLIC_INFURA_URL_PRODUCTION;
  } else {
    return process.env.NEXT_PUBLIC_INFURA_URL_DEVELOPMENT;
  }
};
