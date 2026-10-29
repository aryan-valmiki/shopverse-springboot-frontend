import { axiosInstance } from "../../services/axios.js"

const getAllOrder = async () => {
    try {
        const response = await axiosInstance.get("/order/admin/");
        return response;
    } catch (error) {
        throw error
    }
}

const createProduct = async (data) => {
    try {
        const response = await axiosInstance.post("/product/admin/add", data)
        return response;
    } catch (error) {
        throw error
    }
}

const deleteProduct = async (id) => {
    try {
        const response = await axiosInstance.delete(`/product/admin/delete/${id}`)
        return response
    } catch (error) {
        throw error
    }
}

const updateProductStatus = async (id, status) => {
    try {
        const response = await axiosInstance.patch(`/product/admin/${id}/status?status=${status}`)
        return response;
    } catch (error) {
        throw error
    }
}

const updateOrderStatus = async (id, status) => {
    try {
        const response = await axiosInstance.patch(`/order/admin/${id}/status?status=${status}`)
        return response;
    } catch (error) {
        throw error
    }
}

export { getAllOrder, createProduct, deleteProduct, updateProductStatus, updateOrderStatus }
