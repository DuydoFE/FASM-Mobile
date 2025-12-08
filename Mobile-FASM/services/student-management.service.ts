import {
  AddStudentBulkRequest,
  AddStudentRequest,
  ApiResponse,
  CourseStudentForInstructor,
  CourseStudentListResponse,
  CourseStudentSingleResponse,
} from '@/types/api.types';
import apiClient from './api';

/**
 * Student Management Service
 * Handles API calls for instructor to manage students in a course
 */

const ENDPOINTS = {
  getStudentsByCourseInstance: (courseInstanceId: number) =>
    `/api/CourseStudent/course-instance/${courseInstanceId}`,
  addStudent: () => `/api/CourseStudent`,
  addStudentBulk: () => `/api/CourseStudent/bulk`,
  deleteStudent: () => `/api/CourseStudent/delete`,
};

/**
 * Get all students enrolled in a course instance
 * @param courseInstanceId - The ID of the course instance
 * @returns Promise with the list of enrolled students
 */
export const getStudentsByCourseInstance = async (
  courseInstanceId: number
): Promise<CourseStudentForInstructor[]> => {
  try {
    const response = await apiClient.get<CourseStudentListResponse>(
      ENDPOINTS.getStudentsByCourseInstance(courseInstanceId)
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
    console.error('Error fetching students:', error);
    throw error;
  }
};

/**
 * Add a student to a course instance
 * @param courseInstanceId - The ID of the course instance
 * @param studentCode - The student code to add
 * @returns Promise with the added student data
 */
export const addStudentToCourse = async (
  courseInstanceId: number,
  studentCode: string
): Promise<CourseStudentForInstructor> => {
  try {
    const request: AddStudentRequest = {
      courseInstanceId,
      studentCode,
    };

    const response = await apiClient.post<CourseStudentSingleResponse>(
      ENDPOINTS.addStudent(),
      request
    );

    if (response.data.statusCode === 200 && response.data.data) {
      return response.data.data;
    }

    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }

    throw new Error(response.data.message || 'Failed to add student');
  } catch (error: any) {
    // Extract error message from Axios error response
    if (error.response?.data) {
      const responseData = error.response.data as ApiResponse<null>;
      if (responseData.errors && responseData.errors.length > 0) {
        throw new Error(responseData.errors[0].message);
      }
      if (responseData.message) {
        throw new Error(responseData.message);
      }
    }
    
    // Re-throw original error if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to add student');
  }
};

/**
 * Add multiple students to a course instance
 * @param courseInstanceId - The ID of the course instance
 * @param studentCodes - Array of student codes to add
 * @returns Promise with the added students data
 */
export const addStudentsBulk = async (
  courseInstanceId: number,
  studentCodes: string[]
): Promise<CourseStudentForInstructor[]> => {
  try {
    const request: AddStudentBulkRequest = {
      courseInstanceId,
      studentCodes,
    };

    const response = await apiClient.post<CourseStudentListResponse>(
      ENDPOINTS.addStudentBulk(),
      request
    );

    if (response.data.statusCode === 200 && response.data.data) {
      return response.data.data;
    }

    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }

    throw new Error(response.data.message || 'Failed to add students');
  } catch (error) {
    console.error('Error adding students bulk:', error);
    throw error;
  }
};

/**
 * Delete a student from a course instance
 * @param userId - The user ID of the student
 * @param courseInstanceId - The ID of the course instance
 * @param courseStudentId - The ID of the course student record
 * @returns Promise resolving when deletion is complete
 */
export const deleteStudentFromCourse = async (
  userId: number,
  courseInstanceId: number,
  courseStudentId: number
): Promise<void> => {
  try {
    const response = await apiClient.delete<ApiResponse<null>>(
      ENDPOINTS.deleteStudent(),
      {
        params: {
          userId,
          courseInstanceId,
          courseStudentId,
        },
      }
    );

    if (response.data.statusCode !== 200) {
      // Handle error cases
      if (response.data.errors && response.data.errors.length > 0) {
        throw new Error(response.data.errors[0].message);
      }
      throw new Error(response.data.message || 'Failed to delete student');
    }
  } catch (error: any) {
    // Extract error message from Axios error response
    if (error.response?.data) {
      const responseData = error.response.data as ApiResponse<null>;
      if (responseData.errors && responseData.errors.length > 0) {
        throw new Error(responseData.errors[0].message);
      }
      if (responseData.message) {
        throw new Error(responseData.message);
      }
    }
    
    // Re-throw original error if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to delete student');
  }
};

export default {
  getStudentsByCourseInstance,
  addStudentToCourse,
  addStudentsBulk,
  deleteStudentFromCourse,
};