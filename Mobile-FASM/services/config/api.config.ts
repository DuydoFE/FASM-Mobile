/**
 * API Configuration
 * Centralizes all API-related configuration and constants
 * 
 * IMPORTANT: For React Native development:
 * - DO NOT use 'localhost' - it won't work on physical devices/emulators
 * - Use your computer's IP address instead
 * - Find your IP: 
 *   - Windows: ipconfig (look for IPv4 Address)
 *   - Mac/Linux: ifconfig (look for inet)
 * 
 * Example: Change 'localhost' to '192.168.1.100' (your actual IP)
 */

export const API_CONFIG = {
  // CHANGE THIS: Replace 'localhost' with your computer's IP address
  // Example: baseUrl: 'https://192.168.1.100:7104',
  baseUrl: 'https://localhost:7104',
  
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