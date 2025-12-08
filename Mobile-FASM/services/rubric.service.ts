import { RubricListResponse } from '@/types/api.types';
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

export default {
  getRubricsByUserId,
};