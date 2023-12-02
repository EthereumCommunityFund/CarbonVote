import axiosInstance from "../src/axiosInstance"



export const verifyProof = async (pcd: string) => {
    return await axiosInstance.post('/api/auth/verify', { pcd })
}
export const generate_signature = async () => {
    return await axiosInstance.post('/api/auth/generate_signature')
}