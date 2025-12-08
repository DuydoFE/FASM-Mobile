import { Assignment, AssignmentDetail, AssignmentDetailResponse, AssignmentListResponse, PeerReviewTracking, PeerReviewTrackingResponse } from '@/types/api.types';
import apiClient from './api';

/**
 * Assignment Service
 * Handles API calls for course assignments
 */

const ENDPOINTS = {
  getAssignmentsByCourseInstance: (courseInstanceId: number) =>
    `/api/Assignment/course-instance/${courseInstanceId}`,
  getAssignmentDetails: (assignmentId: number) =>
    `/api/Assignment/${assignmentId}/details`,
  getPeerReviewTracking: (assignmentId: number) =>
    `/api/StudentReview/assignment/${assignmentId}/tracking`,
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

/**
 * Get assignment details by assignment ID
 * @param assignmentId - The ID of the assignment
 * @returns Promise with the assignment details
 */
export const getAssignmentDetails = async (
  assignmentId: number
): Promise<AssignmentDetail> => {
  try {
    const response = await apiClient.get<AssignmentDetailResponse>(
      ENDPOINTS.getAssignmentDetails(assignmentId)
    );
    
    if (response.data.statusCode === 200 && response.data.data) {
      return response.data.data;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    throw new Error(response.data.message || 'Failed to get assignment details');
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    throw error;
  }
};

/**
 * Get peer review tracking information for an assignment
 * @param assignmentId - The ID of the assignment
 * @returns Promise with the peer review tracking data
 */
export const getPeerReviewTracking = async (
  assignmentId: number
): Promise<PeerReviewTracking> => {
  try {
    const response = await apiClient.get<PeerReviewTrackingResponse>(
      ENDPOINTS.getPeerReviewTracking(assignmentId)
    );
    
    if (response.data.statusCode === 200 && response.data.data) {
      return response.data.data;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    throw new Error(response.data.message || 'Failed to get peer review tracking');
  } catch (error) {
    console.error('Error fetching peer review tracking:', error);
    throw error;
  }
};

export default {
  getAssignmentsByCourseInstance,
  getAssignmentDetails,
  getPeerReviewTracking,
};