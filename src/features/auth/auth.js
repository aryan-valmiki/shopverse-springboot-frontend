import { axiosInstance } from "../../services/axios.js"

const loginUser = async (data) => {
    try {
        const response = await axiosInstance.post("/auth/login", data)
        return response;
    } catch (error) {
        throw error;
    }
}

const registerUser = async (data) => {
    try {
        const response = await axiosInstance.post("/auth/register", data)
        return response;
    } catch (error) {
        throw error;
    }
}

const logoutUser = async () => {
    try {
        const response = await axiosInstance.post("/auth/logout")
        return response;
    } catch (error) {
        throw error;
    }
}



export { loginUser, registerUser, logoutUser }