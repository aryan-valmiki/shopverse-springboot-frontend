import { axiosInstance } from "../../services/axios.js"


const fetchProducts = async () => {
    try {
        const response = await axiosInstance.get("/product/");
        return response.data;
    } catch (error) {
        throw error;
    }
}

const fetchProductById = async (id) => {
    try {
        const response = await axiosInstance.get(`/product/${id}`);
        return response.data;
    } catch (error) {
        throw error
    }
}


export { fetchProducts, fetchProductById }