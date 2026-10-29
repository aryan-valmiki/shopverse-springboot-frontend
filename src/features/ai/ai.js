import { axiosInstance } from "../../services/axios.js";

/**
 * Get AI product recommendations from ShopVerse intelligence backend
 * @param {Object} specs - { category, ram, processor, storage, maxBudget, usage, query }
 */
export const getAiRecommendations = async (specs) => {
  try {
    const response = await axiosInstance.post("/ai/recommend", specs);
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Compare two products side by side and get ShopVerse AI verdict
 * @param {Number} product1Id
 * @param {Number} product2Id
 * @param {String} preference
 */
export const compareProductsWithAi = async (product1Id, product2Id, preference = "Overall Value & Performance") => {
  try {
    const response = await axiosInstance.post("/ai/compare", {
      product1Id: Number(product1Id),
      product2Id: Number(product2Id),
      preference
    });
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Natural language "Prompt-to-Cart" search powered by ShopVerse AI
 * @param {String} prompt
 */
export const promptSearchWithAi = async (prompt) => {
  try {
    const response = await axiosInstance.post("/ai/prompt-search", { prompt });
    return response.data?.data || response.data;
  } catch (error) {
    throw error;
  }
};
