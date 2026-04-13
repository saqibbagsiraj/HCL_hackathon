import axiosInstance from './axiosInstance';

/**
 * GET /api/admin/stats
 * Retrieves global stats for the platform (Total orders, users, restaurants).
 */
export const getAdminStatsApi = () =>
  axiosInstance.get('/admin/stats');

/**
 * POST /api/admin/restaurants
 * Creates a new restaurant (linking it to an owner account).
 */
export const createRestaurantApi = (data) =>
  axiosInstance.post('/admin/restaurants', data);

/**
 * DELETE /api/admin/restaurants/:id
 * Removes a restaurant.
 */
export const deleteRestaurantApi = (id) =>
  axiosInstance.delete(`/admin/restaurants/${id}`);
