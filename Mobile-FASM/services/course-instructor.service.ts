import { ApiResponse } from '@/types/api.types';
import apiClient from './api';

/**
 * Course Instructor Types
 * For instructor's assigned classes/courses
 */
export interface CourseInstructor {
  id: number;
  courseInstanceId: number;
  courseInstanceName: string;
  courseCode: string;
  userId: number;
  instructorName: string;
  instructorEmail: string;
  isMainInstructor: boolean;
  createdAt: string;
  studentCount: number;
  courseInstanceStatus: string;
  courseName: string;
  semesterName: string;
  startDate: string;
  endDate: string;
}

export type CourseInstructorResponse = ApiResponse<CourseInstructor[]>;

/**
 * Get all courses/classes assigned to an instructor
 * @param instructorId - The instructor's user ID
 * @returns List of courses assigned to the instructor
 */
export const getInstructorCourses = async (instructorId: number): Promise<CourseInstructor[]> => {
  const response = await apiClient.get<CourseInstructorResponse>(
    `/api/CourseInstructor/instructor/${instructorId}`
  );
  
  if (response.data.statusCode === 200 && response.data.data) {
    return response.data.data;
  }
  
  throw new Error(response.data.message || 'Failed to fetch instructor courses');
};