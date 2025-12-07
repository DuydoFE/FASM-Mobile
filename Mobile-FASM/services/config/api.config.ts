/**
 * API Configuration
 * Centralizes all API-related configuration and constants
 */

export const API_CONFIG = {
  // Production API URL
  baseUrl: 'https://api.fasm.site',
  
  timeout: 30000,
  endpoints: {
    login: '/api/account/login',
    refreshToken: '/api/account/refresh-token',
    getAuth: '/api/account/me',
  },
} as const;

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;