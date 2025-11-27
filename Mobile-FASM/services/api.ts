import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_CONFIG, API_HEADERS } from './config/api.config';

/**
 * API Client Configuration
 * Centralized axios instance with interceptors for request/response handling
 */

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.baseUrl,
      timeout: API_CONFIG.timeout,
      headers: API_HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Log full request details
        console.log('=== API Request ===');
        console.log('Base URL:', config.baseURL);
        console.log('Endpoint:', config.url);
        console.log('Method:', config.method?.toUpperCase());
        console.log('Headers:', config.headers);
        console.log('Data:', config.data);
        console.log('==================');

        // Add auth token if available
        const token = this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log('=== API Response ===');
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.log('===================');
        return response;
      },
      async (error: AxiosError) => {
        console.error('=== API Error ===');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Response Status:', error.response?.status);
        console.error('Response Data:', error.response?.data);
        console.error('Request URL:', error.config?.url);
        console.error('Full Base URL:', error.config?.baseURL);
        console.error('================');
        
        if (error.response?.status === 401) {
          // Handle unauthorized - could trigger refresh token logic here
          this.clearStoredToken();
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get stored authentication token
   */
  private getStoredToken(): string | null {
    // TODO: Implement secure token storage (AsyncStorage/SecureStore)
    return null;
  }

  /**
   * Clear stored authentication token
   */
  private clearStoredToken(): void {
    // TODO: Implement token clearing from storage
  }

  /**
   * Get the axios instance
   */
  public getInstance(): AxiosInstance {
    return this.client;
  }
}

const apiClient = new ApiClient().getInstance();

export default apiClient;