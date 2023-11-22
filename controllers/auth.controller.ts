import axiosInstance from "../src/axiosInstance"



export const verifyProof = async (pcd: string) => {
    return await axiosInstance.post('/api/auth/verify', { pcd })
}