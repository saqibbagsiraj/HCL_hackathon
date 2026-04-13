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
 * GET /api/restaurants/my
 */
export const getMyRestaurantApi = () =>
  axiosInstance.get('/restaurants/my');

/**
 * GET /api/menu/restaurant/:id
 */
export const getMenuApi = (restaurantId) =>
  axiosInstance.get(`/menu/restaurant/${restaurantId}`);

/**
 * GET /api/menu/:id
 */
export const getMenuItemApi = (itemId) =>
  axiosInstance.get(`/menu/${itemId}`);

/**
 * POST /api/restaurants/:id/menu
 */
export const addMenuItemApi = (restaurantId, itemData) =>
  axiosInstance.post(`/restaurants/${restaurantId}/menu`, itemData);
