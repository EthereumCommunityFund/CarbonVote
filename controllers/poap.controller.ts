import axiosInstance from '../src/axiosInstance';

export const getPoapEventDetails = async (eventId: number, address: string | null) => {
    let url = `/api/poap/poapEventDetails?eventId=${eventId}`;
    if (address) {
        url += `&address=${address}`;
    }
    return await axiosInstance.get(url);
};

export const searchPoaps = async (value: string) => {
    return await axiosInstance.get(`/api/poap/searchPoaps?searchText=${value}`);
};