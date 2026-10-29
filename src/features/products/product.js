import { axiosInstance } from "../../services/axios.js"

const fetchProducts = async (sortBy = "", sortDir = "asc") => {
    try {
        const url = sortBy ? `/product/?sortBy=${sortBy}&sortDir=${sortDir}` : "/product/";
        const response = await axiosInstance.get(url);
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
        throw error;
    }
}

export { fetchProducts, fetchProductById }
