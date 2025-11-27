/**
 * API Response Types
 * TypeScript interfaces for all API requests and responses
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  statusCode: number;
  data: {
    accessToken: string;
    refreshToken: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    studentCode: string;
    roles: string[];
    campusId: number;
  } | null;
  errors: ApiError[];
  warnings: ApiWarning[];
}

export interface ApiError {
  field: string;
  message: string;
  suggestion: string;
}

export interface ApiWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface ApiResponse<T = any> {
  message: string;
  statusCode: number;
  data: T | null;
  errors: ApiError[];
  warnings: ApiWarning[];
}

export interface AuthUser {
  accessToken: string;
  refreshToken: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  roles: string[];
  campusId: number;
}