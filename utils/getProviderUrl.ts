export const getProviderUrl = () => {
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    return process.env.NEXT_PUBLIC_INFURA_URL_PRODUCTION;
  } else {
    return process.env.NEXT_PUBLIC_INFURA_URL_DEVELOPMENT;
  }
};
