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
  publishAssignment: (assignmentId: number) =>
    `/api/Assignment/${assignmentId}/publish`,
  deleteAssignment: (assignmentId: number) =>
    `/api/Assignment/${assignmentId}`,
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

/**
 * Publish an assignment (changes status from Draft to Upcoming/Active based on StartDate)
 * @param assignmentId - The ID of the assignment to publish
 * @returns Promise with success status
 */
export const publishAssignment = async (
  assignmentId: number
): Promise<boolean> => {
  try {
    const response = await apiClient.put<{ statusCode: number; message: string; errors?: Array<{ message: string }> }>(
      ENDPOINTS.publishAssignment(assignmentId)
    );
    
    if (response.data.statusCode === 200) {
      return true;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    throw new Error(response.data.message || 'Failed to publish assignment');
  } catch (error) {
    console.error('Error publishing assignment:', error);
    throw error;
  }
};

/**
 * Delete an assignment by ID
 * @param assignmentId - The ID of the assignment to delete
 * @returns Promise with success status
 */
export const deleteAssignment = async (
  assignmentId: number
): Promise<boolean> => {
  try {
    const response = await apiClient.delete<{ statusCode: number; message: string; errors?: Array<{ message: string }> }>(
      ENDPOINTS.deleteAssignment(assignmentId)
    );
    
    if (response.data.statusCode === 200) {
      return true;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    throw new Error(response.data.message || 'Failed to delete assignment');
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

export default {
  getAssignmentsByCourseInstance,
  getAssignmentDetails,
  getPeerReviewTracking,
  publishAssignment,
  deleteAssignment,
};