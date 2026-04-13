import { jwtDecode } from 'jwt-decode';

/**
 * Safely decode a JWT token. Returns null on failure.
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

/**
 * Check whether the token is expired (with optional buffer seconds).
 */
export const isTokenExpired = (token, bufferSeconds = 30) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now + bufferSeconds;
};

/**
 * Extract role from token payload.
 * Supports common claim keys: role, roles, authorities.
 */
export const getRoleFromToken = (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  // Spring Security usually puts roles in 'roles' or 'authorities'
  const raw = decoded.role ?? decoded.roles ?? decoded.authorities ?? null;
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0]?.replace('ROLE_', '') ?? null;
  return String(raw).replace('ROLE_', '');
};

/**
 * Extract subject (email/username) from token.
 */
export const getSubjectFromToken = (token) => {
  const decoded = decodeToken(token);
  return decoded?.sub ?? null;
};
