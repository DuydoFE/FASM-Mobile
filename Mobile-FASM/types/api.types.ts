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
 * Course Student Types
 * For student's enrolled classes/courses
 */
export interface CourseStudent {
  courseStudentId: number;
  courseInstanceId: number;
  courseInstanceName: string;
  courseCode: string;
  courseName: string;
  userId: number;
  studentName: string;
  studentEmail: string;
  studentCode: string;
  enrolledAt: string;
  status: string;
  finalGrade: number;
  isPassed: boolean;
  statusChangedAt: string;
  changedByUserId: number;
  changedByUserName: string;
  studentCount: number;
  instructorNames: string[];
}

export type CourseStudentResponse = ApiResponse<CourseStudent[]>;

/**
 * Enroll with Key Request/Response Types
 * For activating pending enrollment with enrollment key
 */
export interface EnrollWithKeyRequest {
  courseInstanceId: number;
  studentUserId: number;
  enrollKey: string;
}

export type EnrollWithKeyResponse = ApiResponse<CourseStudent>;

/**
 * Assignment Types
 * For course assignments/tasks
 */
export interface AssignmentRubricCriteria {
  criteriaId: number;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

export interface AssignmentRubric {
  rubricId: number;
  templateId: number | null;
  templateTitle: string | null;
  assignmentId: number | null;
  assignmentTitle: string | null;
  title: string;
  isModified: boolean;
  criteriaCount: number;
  gradingScale: string | null;
  assignmentStatus: string | null;
  courseName: string | null;
  className: string | null;
  criteria: AssignmentRubricCriteria[];
  assignmentsUsingTemplate: string[];
}

export interface Assignment {
  assignmentId: number;
  courseInstanceId: number;
  rubricTemplateId: number | null;
  rubricId: number | null;
  title: string;
  description: string;
  guidelines: string;
  fileUrl: string | null;
  fileName: string | null;
  createdAt: string;
  startDate: string;
  deadline: string;
  reviewDeadline: string;
  finalDeadline: string;
  numPeerReviewsRequired: number;
  passThreshold: number | null;
  missingReviewPenalty: number;
  allowCrossClass: boolean;
  crossClassTag: string | null;
  instructorWeight: number;
  peerWeight: number;
  isBlindReview: boolean;
  includeAIScore: boolean;
  gradingScale: string;
  courseName: string;
  courseCode: string;
  sectionCode: string;
  campusName: string;
  rubric: AssignmentRubric | null;
  submissionCount: number;
  reviewCount: number;
  status: string;
  uiStatus: string;
  isActive: boolean;
  isOverdue: boolean;
  daysUntilDeadline: number;
}

export type AssignmentListResponse = ApiResponse<Assignment[]>;

/**
 * Assignment Detail Types
 * For single assignment details with rubric
 */
export interface AssignmentDetail {
  assignmentId: number;
  title: string;
  description: string;
  guidelines: string;
  courseName: string;
  courseCode: string;
  sectionCode: string;
  gradingScale: string;
  fileUrl: string | null;
  fileName: string | null;
  startDate: string;
  deadline: string;
  reviewDeadline: string;
  finalDeadline: string;
  numPeerReviewsRequired: number;
  passThreshold: number;
  instructorWeight: number;
  peerWeight: number;
  isBlindReview: boolean;
  includeAIScore: boolean;
}

export type AssignmentDetailResponse = ApiResponse<AssignmentDetail>;

/**
 * Peer Review Tracking Types
 * For tracking student's peer review progress on an assignment
 */
export interface PeerReviewTracking {
  pendingReviewsCount: number;
  completedReviewsCount: number;
  numPeerReviewsRequired: number;
  status: 'Pending' | 'InReview' | 'Completed' | 'NotStarted';
}

export type PeerReviewTrackingResponse = ApiResponse<PeerReviewTracking>;