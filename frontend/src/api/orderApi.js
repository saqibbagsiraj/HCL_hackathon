import axiosInstance from './axiosInstance';

/**
 * POST /api/orders  — place a new order (MOCKED FOR DESIGN TESTING)
 * @param {{ restaurantId: number, items: [{itemId: number, quantity: number}] }} data
 */
export const placeOrderApi = (data) =>
  new Promise((resolve) => setTimeout(() => resolve({ data: { success: true } }), 1500));

/**
 * GET /api/orders/my  — current user's order history
 */
export const getMyOrdersApi = () =>
  axiosInstance.get('/orders/my');

/**
 * GET /api/orders/:id  — single order detail
 */
export const getOrderByIdApi = (id) =>
  axiosInstance.get(`/orders/${id}`);
