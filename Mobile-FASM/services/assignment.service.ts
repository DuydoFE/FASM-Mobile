import { Assignment, AssignmentListResponse } from '@/types/api.types';
import apiClient from './api';

/**
 * Assignment Service
 * Handles API calls for course assignments
 */

const ENDPOINTS = {
  getAssignmentsByCourseInstance: (courseInstanceId: number) => 
    `/api/Assignment/course-instance/${courseInstanceId}/basic`,
};

/**
 * Get all assignments for a specific course instance
 * @param courseInstanceId - The ID of the course instance
 * @returns Promise with the list of assignments
 */
export const getAssignmentsByCourseInstance = async (
  courseInstanceId: number
): Promise<Assignment[]> => {
  try {
    const response = await apiClient.get<AssignmentListResponse>(
      ENDPOINTS.getAssignmentsByCourseInstance(courseInstanceId)
    );
    
    if (response.data.statusCode === 200 && response.data.data) {
      return response.data.data;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw error;
  }
};

export default {
  getAssignmentsByCourseInstance,
};