import axios, { AxiosInstance } from 'axios';
import Router from 'next/router';

const axiosInstance: AxiosInstance = axios.create({
  // baseURL: 'https://zuzapp-test-v1-events-app-delta.vercel.app', // replace with your API endpoin
  // baseURL: 'https://www.zuzalu.city',
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// const axiosInstance: AxiosInstance = axios.create({
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// axiosInstance.interceptors.request.use((config) => {
//     const currentURL = window.location.href; // this assumes you're in a browser environment
//     const newBaseURL = extractBaseURL(currentURL); // a function to extract baseURL from the currentURL
//     config.baseURL = newBaseURL;
//     return config;
// });

// function extractBaseURL(url: string): string {
//     const urlObj = new URL(url);
//     return `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? ':' + urlObj.port : ''}`;
// }

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Do something with the response data
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          Router.push('/');
          break;
        // case 403:

        //     alert('Forbidden. You do not have permission.');
        //     break;
        // case 500:

        //     alert('Server error. Please try again later.');
        //     break;
        // default:

        //     alert('Something went wrong.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
