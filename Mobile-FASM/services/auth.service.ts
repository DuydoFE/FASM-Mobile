import { AxiosError } from 'axios';
import { ApiResponse, AuthUser, LoginRequest, LoginResponse } from '../types/api.types';
import apiClient, { setApiAccessToken } from './api';
import { API_CONFIG } from './config/api.config';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

class AuthService {
  /**
   * Login user with username and password
   * @param username - User's username/student ID
   * @param password - User's password
   * @returns Promise with login response containing tokens and user data
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const payload: LoginRequest = {
        username,
        password,
      };

      const response = await apiClient.post<LoginResponse>(
        API_CONFIG.endpoints.login,
        payload
      );

      console.log('Login response:', response.data);

      // Store tokens if login successful
      if (response.data.statusCode === 200 && response.data.data) {
        await this.storeAuthData(response.data.data);
        // Set the access token for API requests
        setApiAccessToken(response.data.data.accessToken);
      }

      return response.data;
    } catch (error) {
      console.error('Login error details:', error);
      return this.handleAuthError(error);
    }
  }

  /**
   * Get current authenticated user information
   * @returns Promise with user authentication data
   */
  async getAuth(): Promise<ApiResponse<AuthUser>> {
    try {
      const response = await apiClient.get<ApiResponse<AuthUser>>(
        API_CONFIG.endpoints.getAuth
      );

      return response.data;
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - The refresh token
   * @returns Promise with new tokens
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    try {
      const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        API_CONFIG.endpoints.refreshToken,
        { refreshToken }
      );

      if (response.data.statusCode === 200 && response.data.data) {
        await this.updateTokens(
          response.data.data.accessToken,
          response.data.data.refreshToken
        );
      }

      return response.data;
    } catch (error) {
      return this.handleAuthError(error);
    }
  }

  /**
   * Logout user and clear stored data
   */
  async logout(): Promise<void> {
    await this.clearAuthData();
    // Clear the access token from API client
    setApiAccessToken(null);
  }

  /**
   * Store authentication data securely
   * @param authData - Authentication data to store
   */
  private async storeAuthData(authData: AuthUser): Promise<void> {
    try {
      // TODO: Implement secure storage using expo-secure-store
      // await SecureStore.setItemAsync('accessToken', authData.accessToken);
      // await SecureStore.setItemAsync('refreshToken', authData.refreshToken);
      // await AsyncStorage.setItem('userData', JSON.stringify(authData));
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Failed to store auth data:', error);
      throw error;
    }
  }

  /**
   * Update stored tokens
   * @param accessToken - New access token
   * @param refreshToken - New refresh token
   */
  private async updateTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // TODO: Implement secure storage using expo-secure-store
      // await SecureStore.setItemAsync('accessToken', accessToken);
      // await SecureStore.setItemAsync('refreshToken', refreshToken);
      // Update the API client token
      setApiAccessToken(accessToken);
      console.log('Tokens updated successfully');
    } catch (error) {
      console.error('Failed to update tokens:', error);
      throw error;
    }
  }

  /**
   * Clear all stored authentication data
   */
  private async clearAuthData(): Promise<void> {
    try {
      // TODO: Implement secure storage clearing
      // await SecureStore.deleteItemAsync('accessToken');
      // await SecureStore.deleteItemAsync('refreshToken');
      // await AsyncStorage.removeItem('userData');
      // Clear the API client token
      setApiAccessToken(null);
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
      throw error;
    }
  }

  /**
   * Get stored access token
   * @returns Promise with access token or null
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // TODO: Implement secure storage retrieval
      // return await SecureStore.getItemAsync('accessToken');
      return null;
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get stored user data
   * @returns Promise with user data or null
   */
  async getUserData(): Promise<AuthUser | null> {
    try {
      // TODO: Implement storage retrieval
      // const userData = await AsyncStorage.getItem('userData');
      // return userData ? JSON.parse(userData) : null;
      return null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns Promise with authentication status
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Handle authentication errors
   * @param error - Error object from axios
   * @returns Formatted error response
   */
  private handleAuthError(error: unknown): any {
    console.error('handleAuthError called with:', error);
    
    if (error instanceof AxiosError) {
      console.error('Axios error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
      });

      // Return the error response from API if available
      if (error.response?.data) {
        return error.response.data;
      }

      // Return custom error for network or other issues
      return {
        message: error.message || 'An error occurred during authentication',
        statusCode: error.response?.status || 500,
        data: null,
        errors: [
          {
            field: 'general',
            message: `${error.message || 'Network error'}${error.code ? ` (${error.code})` : ''}`,
            suggestion: 'Please check your internet connection and API URL',
          },
        ],
        warnings: [],
      };
    }

    // Return generic error for unknown error types
    console.error('Unknown error type:', error);
    return {
      message: 'An unexpected error occurred',
      statusCode: 500,
      data: null,
      errors: [
        {
          field: 'general',
          message: 'Unexpected error',
          suggestion: 'Please try again later',
        },
      ],
      warnings: [],
    };
  }
}

export const authService = new AuthService();