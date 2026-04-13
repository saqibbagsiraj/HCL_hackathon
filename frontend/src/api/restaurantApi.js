import axiosInstance from './axiosInstance';

/**
 * GET /api/restaurants  — list all active restaurants
 */
export const getRestaurantsApi = (params) =>
  axiosInstance.get('/restaurants', { params });

/**
 * GET /api/restaurants/:id
 */
export const getRestaurantByIdApi = (id) =>
  axiosInstance.get(`/restaurants/${id}`);

/**
 * GET /api/restaurants/:id/menu
 */
export const getMenuApi = (restaurantId) =>
  axiosInstance.get(`/restaurants/${restaurantId}/menu`);

/**
 * GET /api/menu/:id
 */
export const getMenuItemApi = (itemId) =>
  axiosInstance.get(`/menu/${itemId}`);
