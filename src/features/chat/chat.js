import { axiosInstance } from "../../services/axios.js";

// Customer: send message to seller/admin
export const sendChatMessage = async (message, targetUserId = null) => {
  try {
    const payload = { message };
    if (targetUserId) {
      payload.targetUserId = targetUserId;
    }
    const response = await axiosInstance.post("/chat/send", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Customer: get my chat history with seller
export const getMyChatMessages = async () => {
  try {
    const response = await axiosInstance.get("/chat/messages");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: get list of customer conversations
export const getAdminChatConversations = async () => {
  try {
    const response = await axiosInstance.get("/chat/admin/conversations");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin: get chat messages for specific customer
export const getAdminCustomerMessages = async (userId) => {
  try {
    const response = await axiosInstance.get(`/chat/admin/messages/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
