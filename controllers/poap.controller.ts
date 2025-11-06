import axiosInstance from '../src/axiosInstance';

export const getPoapEventDetails = async (
  eventId: number,
  address: string | null
) => {
  let url = `/api/poap/poapEventDetails?eventId=${eventId}`;
  if (address) {
    url += `&address=${address}`;
  }
  return await axiosInstance.get(url);
};

export const searchPoaps = async (value: string) => {
  return await axiosInstance.get(`/api/poap/searchPoaps?searchText=${value}`);
};

export const getPoapOwnership = async (
  voter_identifier: string,
  eventId: string
) => {
  return await axiosInstance.get(
    `/api/poap/poapOwnership?voter_identifier=${encodeURIComponent(voter_identifier)}&eventId=${encodeURIComponent(eventId)}`
  );
};
