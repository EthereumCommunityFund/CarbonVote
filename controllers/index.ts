import axiosInstance from '../src/axiosInstance';

export type ScoreRequestData = {
    address: string;
    scorerId: string;
};

export const fetchScore = async (scoreData: ScoreRequestData) => {
    return await axiosInstance.post('/api/gitcoin_passport', scoreData);
};