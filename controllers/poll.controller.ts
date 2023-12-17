import axiosInstance from "../src/axiosInstance"



export type PollRequestData = {
    title: string;
    description: string;
    time_limit: number;
    voting_method: 'headCount'
    options: OptionData[];
    credentials: string[]
};

export type VoteRequestData = {
    option_id: string;
    voter_identifier: string;
    poll_id: string;
};


export type OptionData = {
    description: string;
};





export const fetchAllPolls = async () => {
    return await axiosInstance.get('/api/polls')
}

export const fetchPollById = async (pollId: string) => {
    return await axiosInstance.get(`/api/polls/${pollId}`);
}


export const createPoll = async (pollData: PollRequestData) => {
    return await axiosInstance.post('/api/polls', pollData);
}


export const castVote = async (voteData: VoteRequestData) => {
    return await axiosInstance.post('/api/vote', voteData);
}
