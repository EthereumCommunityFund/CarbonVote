import axiosInstance from "../src/axiosInstance"



export const fetchAllPolls = async () => {
    return await axiosInstance.get('/api/polls')
}