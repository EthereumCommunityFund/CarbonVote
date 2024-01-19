import axiosInstance from '../src/axiosInstance';

export type PollRequestData = {
    title: string;
    description: string;
    time_limit: number;
    votingMethod: string;
    options: OptionData[];
    credentials: string[];
    poap_events: number[];
};

export type VoteRequestData = {
    option_id: string;
    voter_identifier: string | null;
    poll_id: string;
};

export type CheckVoteData = {
    id: string;
    identifier: string | null;
};


export type OptionData = {
    option_description: string;
};

export const fetchAllPolls = async () => {
    return await axiosInstance.get('/api/polls');
};

export const fetchPollById = async (pollId: string) => {
    return await axiosInstance.get(`/api/polls/${pollId}`);
};

export const createPoll = async (pollData: PollRequestData) => {
    return await axiosInstance.post('/api/polls/create', pollData);
};

export const castVote = async (voteData: VoteRequestData) => {
    return await axiosInstance.post('/api/polls/vote', voteData);
};

export const fetchVote = async (checkData: CheckVoteData) => {
    return await axiosInstance.get(`/api/polls/checkvote`, { params: checkData });
};