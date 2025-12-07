import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, API_HEADERS } from './config/api.config';

// Token storage - will be set from outside
let storedAccessToken: string | null = null;

/**
 * Set the access token for API requests
 */
export const setApiAccessToken = (token: string | null): void => {
  storedAccessToken = token;
};

/**
 * Get the current access token
 */
export const getApiAccessToken = (): string | null => {
  return storedAccessToken;
};

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
      (config: InternalAxiosRequestConfig) => {
        // Check if data is FormData (handle React Native bundler quirks)
        const isFormData = config.data && (
          config.data instanceof FormData ||
          (config.data.constructor && config.data.constructor.name === 'FormData') ||
          (typeof config.data.append === 'function' && typeof config.data.getHeaders === 'undefined')
        );

        // Log full request details
        console.log('=== API Request ===');
        console.log('Base URL:', config.baseURL);
        console.log('Endpoint:', config.url);
        console.log('Method:', config.method?.toUpperCase());
        console.log('Is FormData:', isFormData);
        console.log('Headers before modification:', JSON.stringify(config.headers, null, 2));
        if (!isFormData) {
          console.log('Data:', config.data);
        }

        // Add auth token if available
        const token = storedAccessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Token added: Bearer', token.substring(0, 20) + '...');
        } else {
          console.log('No token available');
        }

        // For FormData requests, let the browser/RN set the Content-Type with proper boundary
        if (isFormData) {
          // Remove the default Content-Type so that the browser can set it with the boundary
          delete config.headers['Content-Type'];
          console.log('Removed Content-Type header for FormData');
        }

        console.log('Headers after modification:', JSON.stringify(config.headers, null, 2));
        console.log('==================');

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
        console.log('Data:', JSON.stringify(response.data, null, 2));
        console.log('===================');
        return response;
      },
      async (error: AxiosError) => {
        console.error('=== API Error ===');
        console.error('Error Message:', error.message);
        console.error('Error Code:', error.code);
        console.error('Response Status:', error.response?.status);
        console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
        console.error('Request URL:', error.config?.url);
        console.error('Full Base URL:', error.config?.baseURL);
        console.error('================');
        
        if (error.response?.status === 401) {
          // Handle unauthorized - could trigger refresh token logic here
          storedAccessToken = null;
        }
        return Promise.reject(error);
      }
    );
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