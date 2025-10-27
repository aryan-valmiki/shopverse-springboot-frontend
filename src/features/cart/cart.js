import { axiosInstance } from "../../services/axios.js"

const addToCart = async (data) => {
    try {
        const response = await axiosInstance.post("/cart/", data);
        return response
    } catch (error) {
        throw error
    }
}

const getCart = async () => {
    try {
        const response = await axiosInstance.get("/cart/");
        return response;
    } catch (error) {
        throw error
    }
}

const updateQuantity = async (data) => {
    try {
        const response = await axiosInstance.patch(`/cart/`, data);
        return response
    } catch (error) {
        throw error
    }
}

const deleteItem = async (id) => {
    try {
        const response = await axiosInstance.delete(`/cart/${id}`)
        return response
    } catch (error) {
        throw error
    }
}


export { addToCart, getCart, updateQuantity, deleteItem }