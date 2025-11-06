import axios, { AxiosInstance } from 'axios';
import Router from 'next/router';
import { IS_PROD } from './constants';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: typeof window === 'undefined' ? 'http://localhost:3000' : '',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          Router.push('/');
          break;
        case 403:
          Router.push('/');
          break;
        case 500:
          console.error('Server error:', error);
          break;
        // default:
        //   console.error('Request error:', error);
      }
    } else {
      console.error('Network error:', error);
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
