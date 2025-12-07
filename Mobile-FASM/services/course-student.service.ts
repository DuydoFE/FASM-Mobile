import { CourseStudent, CourseStudentResponse, EnrollWithKeyResponse } from '@/types/api.types';
import apiClient from './api';

/**
 * Course Student Service
 * Handles API calls for student's enrolled courses/classes
 */

const ENDPOINTS = {
  getStudentCourses: (studentId: number) => `/api/CourseStudent/student/${studentId}`,
  enrollWithKey: (courseInstanceId: number) => `/api/CourseStudent/${courseInstanceId}/enroll`,
};

/**
 * Get all courses/classes that a student is enrolled in
 * @param studentId - The ID of the logged-in student/user
 * @returns Promise with the list of enrolled courses
 */
export const getStudentCourses = async (studentId: number): Promise<CourseStudent[]> => {
  try {
    const response = await apiClient.get<CourseStudentResponse>(
      ENDPOINTS.getStudentCourses(studentId)
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
    console.error('Error fetching student courses:', error);
    throw error;
  }
};

/**
 * Enroll in a course using enrollment key
 * Activates pending enrollment to enrolled status
 * @param courseInstanceId - The ID of the course instance
 * @param studentUserId - The ID of the student/user
 * @param enrollKey - The enrollment key to activate
 * @returns Promise with the updated course student data
 */
export const enrollWithKey = async (
  courseInstanceId: number,
  studentUserId: number,
  enrollKey: string
): Promise<CourseStudent> => {
  try {
    const response = await apiClient.post<EnrollWithKeyResponse>(
      ENDPOINTS.enrollWithKey(courseInstanceId),
      null,
      {
        params: {
          studentUserId,
          enrollKey,
        },
      }
    );
    
    if (response.data.statusCode === 200 && response.data.data) {
      return response.data.data;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    throw new Error(response.data.message || 'Failed to enroll with key');
  } catch (error) {
    console.error('Error enrolling with key:', error);
    throw error;
  }
};

export default {
  getStudentCourses,
  enrollWithKey,
};