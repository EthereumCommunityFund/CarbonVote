import axiosInstance from '../src/axiosInstance';

export const getPoapEventDetails = async (eventId: number, address: string | null) => {
    return await axiosInstance.get(`/api/poap/poapEventDetails?eventId=${eventId}&address=${address}`);
};

export const searchPoaps = async (value: string) => {
    return await axiosInstance.get(`/api/poap/searchPoaps?searchText=${value}`);
};