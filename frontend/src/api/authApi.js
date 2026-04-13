import axiosInstance from './axiosInstance';

/**
 * POST /api/auth/login
 * @param {{ email: string, password: string }} credentials
 */
export const loginApi = (credentials) =>
  axiosInstance.post('/auth/login', credentials);

/**
 * POST /api/auth/register
 * @param {{ name: string, email: string, password: string, phone: string, address: string, role: string }} data
 */
export const registerApi = (data) =>
  axiosInstance.post('/auth/register', data);

/**
 * GET /api/auth/me  — refresh current user info
 */
export const getMeApi = () =>
  axiosInstance.get('/auth/me');
