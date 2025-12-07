import { AxiosError } from 'axios';
import {
  InstructorAssignmentsResponse,
  InstructorClassesResponse
} from '../types/api.types';
import apiClient from './api';
import { API_CONFIG } from './config/api.config';

/**
 * Instructor Service
 * Handles all instructor-related API calls
 */

class InstructorService {
  /**
   * Get all classes assigned to an instructor
   * @param instructorId - The instructor's user ID
   * @returns Promise with instructor classes response
   */
  async getInstructorClasses(instructorId: number): Promise<InstructorClassesResponse> {
    try {
      const response = await apiClient.get<InstructorClassesResponse>(
        `${API_CONFIG.endpoints.getInstructorClasses}/${instructorId}`
      );

      console.log('Instructor classes response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Get instructor classes error:', error);
      return this.handleError(error);
    }
  }

  /**
   * Get all assignments for an instructor
   * @param instructorId - The instructor's user ID
   * @returns Promise with instructor assignments response
   */
  async getInstructorAssignments(instructorId: number): Promise<InstructorAssignmentsResponse> {
    try {
      const response = await apiClient.get<InstructorAssignmentsResponse>(
        `${API_CONFIG.endpoints.getInstructorAssignments}/${instructorId}`
      );

      console.log('Instructor assignments response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Get instructor assignments error:', error);
      return this.handleAssignmentsError(error);
    }
  }

  /**
   * Handle API errors for classes
   * @param error - Error object from axios
   * @returns Formatted error response
   */
  private handleError(error: unknown): InstructorClassesResponse {
    console.error('handleError called with:', error);

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
        message: error.message || 'An error occurred while fetching instructor classes',
        statusCode: error.response?.status || 500,
        data: null,
        errors: [
          {
            field: 'general',
            message: `${error.message || 'Network error'}${error.code ? ` (${error.code})` : ''}`,
            suggestion: 'Please check your internet connection and try again',
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

  /**
   * Handle API errors for assignments
   * @param error - Error object from axios
   * @returns Formatted error response
   */
  private handleAssignmentsError(error: unknown): InstructorAssignmentsResponse {
    console.error('handleAssignmentsError called with:', error);

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
        message: error.message || 'An error occurred while fetching instructor assignments',
        statusCode: error.response?.status || 500,
        data: null,
        errors: [
          {
            field: 'general',
            message: `${error.message || 'Network error'}${error.code ? ` (${error.code})` : ''}`,
            suggestion: 'Please check your internet connection and try again',
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

export const instructorService = new InstructorService();