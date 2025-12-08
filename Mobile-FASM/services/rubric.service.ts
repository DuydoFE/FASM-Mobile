import { RubricDetailResponse, RubricListResponse } from '@/types/api.types';
import apiClient from './api';

/**
 * Rubric Service
 * Handles API calls for rubric management
 */

/**
 * Get rubrics by user ID
 * GET /api/Rubric/user/{userId}
 * @param userId - The user ID to fetch rubrics for
 */
export const getRubricsByUserId = async (userId: number): Promise<RubricListResponse> => {
  const response = await apiClient.get<RubricListResponse>(`/api/Rubric/user/${userId}`);
  return response.data;
};

/**
 * Get rubric details by ID
 * GET /api/Rubric/{id}
 * @param rubricId - The rubric ID to fetch details for
 */
export const getRubricById = async (rubricId: number): Promise<RubricDetailResponse> => {
  const response = await apiClient.get<RubricDetailResponse>(`/api/Rubric/${rubricId}`);
  return response.data;
};

export default {
  getRubricsByUserId,
  getRubricById,
};