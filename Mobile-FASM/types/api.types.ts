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
 * Assignment Status Enum
 * Status values for assignments
 */
export enum AssignmentStatus {
  Active = 'Active',
  InReview = 'InReview',
  Closed = 'Closed',
  Cancelled = 'Cancelled',
  UpComing = 'UpComing',
  GradesPublished = 'GradesPublished',
}

/**
 * Student Assignment with Tracking Types
 * For student's assignments list with review tracking progress
 */
export interface StudentAssignmentWithTracking {
  assignmentId: number;
  title: string;
  startDate: string;
  deadline: string;
  reviewDeadline: string;
  finalDeadline: string;
  status: AssignmentStatus;
  courseInstanceId: number;
  courseName: string;
  courseCode: string;
  numPeerReviewsRequired: number;
  completedReviewsCount: number;
  pendingReviewsCount: number;
  hasSubmission: boolean;
  submissionStatus: string | null;
}

export type StudentAssignmentWithTrackingResponse = ApiResponse<StudentAssignmentWithTracking[]>;

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

/**
 * Random Review Types
 * For getting a random submission to review
 */
export interface RandomReviewRubricCriteria {
  criteriaId: number;
  rubricId: number;
  rubricTitle: string;
  criteriaTemplateId: number;
  criteriaTemplateTitle: string | null;
  title: string;
  assignmentTitle: string | null;
  description: string;
  weight: number;
  maxScore: number;
  scoringType: string;
  scoreLabel: string;
  isModified: boolean;
  criteriaFeedbackCount: number;
  courseName: string | null;
  className: string | null;
  assignmentStatus: string | null;
}

export interface RandomReviewRubricAssignmentUsing {
  assignmentId: number;
  title: string;
  courseName: string;
  className: string;
  campusName: string;
  deadline: string;
}

export interface RandomReviewRubric {
  rubricId: number;
  templateId: number;
  templateTitle: string;
  assignmentId: number;
  assignmentTitle: string;
  title: string;
  isModified: boolean;
  criteriaCount: number;
  gradingScale: string;
  assignmentStatus: string;
  courseName: string;
  className: string;
  criteria: RandomReviewRubricCriteria[];
  assignmentsUsingTemplate: RandomReviewRubricAssignmentUsing[];
}

export interface RandomReviewAssignment {
  reviewAssignmentId: number;
  submissionId: number;
  assignmentId: number;
  status: string;
  assignedAt: string;
  deadline: string;
  assignmentTitle: string;
  assignmentDescription: string;
  assignmentGuidelines: string;
  studentName: string;
  fileUrl: string;
  fileName: string;
  rubric: RandomReviewRubric;
}

export type RandomReviewResponse = ApiResponse<RandomReviewAssignment>;

/**
 * Search Types
 * For instructor search functionality
 */
export interface SearchAssignment {
  assignmentId: number;
  title: string;
  courseName: string;
  courseId: number;
  courseInstanceId: number;
  descriptionSnippet: string | null;
  type: 'Assignment';
}

export interface SearchFeedback {
  feedbackId: number;
  title: string;
  content: string;
  assignmentTitle: string;
  courseId: number;
  courseInstanceId: number;
  courseName: string;
  type: 'Feedback';
}

export interface SearchSummary {
  summaryId: number;
  title: string;
  content: string;
  assignmentTitle: string;
  courseId: number;
  courseInstanceId: number;
  courseName: string;
  type: 'Summary';
}

export interface SearchSubmission {
  submissionId: number;
  title: string;
  studentName: string;
  assignmentTitle: string;
  courseId: number;
  courseInstanceId: number;
  courseName: string;
  submittedAt: string;
  type: 'Submission';
}

export interface SearchCriteria {
  criteriaId: number;
  title: string;
  description: string;
  rubricId: number;
  rubricTitle: string;
  assignmentTitle: string;
  courseId: number;
  courseInstanceId: number;
  courseName: string;
  maxScore: number;
  weight: number;
  type: 'Criteria';
}

export interface SearchData {
  assignments: SearchAssignment[];
  feedback: SearchFeedback[];
  summaries: SearchSummary[];
  submissions: SearchSubmission[];
  criteria: SearchCriteria[];
}

export type SearchResponse = ApiResponse<SearchData>;

/**
 * Rubric Types
 * For instructor rubric management
 */
export interface RubricCriteria {
  criteriaId: number;
  rubricId: number;
  rubricTitle: string;
  criteriaTemplateId: number;
  criteriaTemplateTitle: string | null;
  title: string;
  assignmentTitle: string | null;
  description: string;
  weight: number;
  maxScore: number;
  scoringType: string;
  scoreLabel: string;
  isModified: boolean;
  criteriaFeedbackCount: number;
  courseName: string | null;
  className: string | null;
  assignmentStatus: string | null;
}

export interface RubricAssignmentUsing {
  assignmentId: number;
  title: string;
  courseName: string;
  className: string;
  campusName: string;
  deadline: string;
}

export interface Rubric {
  rubricId: number;
  templateId: number;
  templateTitle: string;
  assignmentId: number;
  assignmentTitle: string;
  title: string;
  isModified: boolean;
  criteriaCount: number;
  gradingScale: string | null;
  assignmentStatus: string;
  courseName: string;
  className: string;
  assignmentsUsingTemplate: RubricAssignmentUsing[];
}

export type RubricListResponse = ApiResponse<Rubric[]>;

/**
 * Rubric Detail Types
 * For single rubric details with criteria
 */
export interface RubricDetailCriteria {
  criteriaId: number;
  rubricId: number;
  rubricTitle: string;
  criteriaTemplateId: number;
  criteriaTemplateTitle: string | null;
  title: string;
  assignmentTitle: string | null;
  description: string;
  weight: number;
  maxScore: number;
  scoringType: string;
  scoreLabel: string;
  isModified: boolean;
  criteriaFeedbackCount: number;
  courseName: string | null;
  className: string | null;
  assignmentStatus: string | null;
}

export interface RubricDetail {
  rubricId: number;
  templateId: number;
  templateTitle: string;
  assignmentId: number;
  assignmentTitle: string;
  title: string;
  isModified: boolean;
  criteriaCount: number;
  gradingScale: string | null;
  assignmentStatus: string;
  courseName: string;
  className: string;
  criteria: RubricDetailCriteria[];
  assignmentsUsingTemplate: RubricAssignmentUsing[];
}

export type RubricDetailResponse = ApiResponse<RubricDetail>;

/**
 * Course Student Management Types (Instructor)
 * For instructor managing students in a course
 */
export interface CourseStudentForInstructor {
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
  finalGrade: number | null;
  isPassed: boolean | null;
  statusChangedAt: string | null;
  changedByUserId: number | null;
  changedByUserName: string | null;
}

export type CourseStudentListResponse = ApiResponse<CourseStudentForInstructor[]>;
export type CourseStudentSingleResponse = ApiResponse<CourseStudentForInstructor>;

export interface AddStudentRequest {
  courseInstanceId: number;
  studentCode: string;
}

export interface AddStudentBulkRequest {
  courseInstanceId: number;
  studentCodes: string[];
}

/**
 * Submit Review Types
 * For submitting peer review with scores and feedback
 */
export interface CriteriaFeedback {
  criteriaId: number;
  score: number;
  feedback: string;
}

export interface SubmitReviewRequest {
  reviewAssignmentId: number;
  reviewerUserId: number;
  generalFeedback: string;
  criteriaFeedbacks: CriteriaFeedback[];
}

export type SubmitReviewResponse = ApiResponse<null>;

/**
 * AI Criteria Feedback Types
 * For generating AI criteria feedback for a submission
 */
export interface AICriteriaFeedback {
  criteriaId: number;
  title: string;
  description: string;
  summary: string;
  score: number;
  maxScore: number;
}

export interface AICriteriaFeedbackData {
  feedbacks: AICriteriaFeedback[];
  isRelevant: boolean;
  errorMessage: string | null;
}

export type AICriteriaFeedbackResponse = ApiResponse<AICriteriaFeedbackData>;