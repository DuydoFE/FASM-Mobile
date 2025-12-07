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

/**
 * Instructor Class Types
 * Types for instructor's assigned classes/course instances
 */
export interface InstructorClass {
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

export interface InstructorClassesResponse {
  message: string;
  statusCode: number;
  data: InstructorClass[] | null;
  errors: ApiError[];
  warnings: ApiWarning[];
}

/**
 * Instructor Assignment Types
 * Types for instructor's assignments
 */
export interface InstructorAssignment {
  assignmentId: number;
  title: string;
  description: string;
  deadline: string;
  reviewDeadline: string;
  finalDeadline: string;
  courseName: string;
  sectionCode: string;
  submissionCount: number;
  studentCount: number;
  isOverdue: boolean;
  daysUntilDeadline: number;
  status: string;
  uiStatus: string;
}

export interface InstructorAssignmentsResponse {
  message: string;
  statusCode: number;
  data: InstructorAssignment[] | null;
  errors: ApiError[];
  warnings: ApiWarning[];
}