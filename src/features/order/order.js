import { axiosInstance } from "../../services/axios.js"

const createorder = async () => {
    try {
        const response = await axiosInstance.post("/order/")
        return response;
    } catch (error) {
        throw error
    }
}


const getOrder = async () => {
    try {
        const response = await axiosInstance.get("/order/")
        return response;
    } catch (error) {
        throw error
    }
}




export { createorder, getOrder }