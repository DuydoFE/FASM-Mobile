import { SearchResponse } from '@/types/api.types';
import apiClient from './api';

/**
 * Search Service
 * Handles search-related API calls for instructor and student
 */

/**
 * Search for assignments, feedback, summaries, submissions, and criteria (instructor)
 * @param query - Search query string
 * @returns Promise with search results
 */
export const searchInstructor = async (query: string): Promise<SearchResponse> => {
  const response = await apiClient.get<SearchResponse>('/api/Search/search/instructor', {
    params: { query },
  });
  return response.data;
};

/**
 * Search for assignments, feedback, summaries, submissions, and criteria (student)
 * @param query - Search query string
 * @returns Promise with search results
 */
export const searchStudent = async (query: string): Promise<SearchResponse> => {
  const response = await apiClient.get<SearchResponse>('/api/Search/search/student', {
    params: { query },
  });
  return response.data;
};

export default {
  searchInstructor,
  searchStudent,
};