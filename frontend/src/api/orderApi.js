import axiosInstance from './axiosInstance';

/**
 * POST /api/orders  — place a new order
 * @param {{ restaurantId: number, items: [{itemId: number, quantity: number}] }} data
 */
export const placeOrderApi = (data) =>
  axiosInstance.post('/orders', data);

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

/**
 * GET /api/restaurants/:id/orders  — list orders for a restaurant
 */
export const getRestaurantOrdersApi = (restaurantId) =>
  axiosInstance.get(`/restaurants/${restaurantId}/orders`);
