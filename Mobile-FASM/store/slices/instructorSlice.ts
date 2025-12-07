import { InstructorAssignment, InstructorClass } from '@/types/api.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Instructor State Interface
 * Defines the shape of instructor state in Redux store
 */
interface InstructorState {
  classes: InstructorClass[];
  assignments: InstructorAssignment[];
  isLoading: boolean;
  isAssignmentsLoading: boolean;
  error: string | null;
  assignmentsError: string | null;
}

/**
 * Initial state for instructor
 */
const initialState: InstructorState = {
  classes: [],
  assignments: [],
  isLoading: false,
  isAssignmentsLoading: false,
  error: null,
  assignmentsError: null,
};

/**
 * Instructor Slice
 * Manages instructor-related state including classes
 */
const instructorSlice = createSlice({
  name: 'instructor',
  initialState,
  reducers: {
    /**
     * Set loading state
     */
    setInstructorLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Set instructor classes
     */
    setInstructorClasses: (state, action: PayloadAction<InstructorClass[]>) => {
      state.classes = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    /**
     * Set error state
     */
    setInstructorError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    /**
     * Clear instructor data (e.g., on logout)
     */
    clearInstructorData: (state) => {
      state.classes = [];
      state.assignments = [];
      state.isLoading = false;
      state.isAssignmentsLoading = false;
      state.error = null;
      state.assignmentsError = null;
    },

    /**
     * Set assignments loading state
     */
    setAssignmentsLoading: (state, action: PayloadAction<boolean>) => {
      state.isAssignmentsLoading = action.payload;
    },

    /**
     * Set instructor assignments
     */
    setInstructorAssignments: (state, action: PayloadAction<InstructorAssignment[]>) => {
      state.assignments = action.payload;
      state.isAssignmentsLoading = false;
      state.assignmentsError = null;
    },

    /**
     * Set assignments error state
     */
    setAssignmentsError: (state, action: PayloadAction<string>) => {
      state.assignmentsError = action.payload;
      state.isAssignmentsLoading = false;
    },
  },
});

// Export actions
export const {
  setInstructorLoading,
  setInstructorClasses,
  setInstructorError,
  clearInstructorData,
  setAssignmentsLoading,
  setInstructorAssignments,
  setAssignmentsError,
} = instructorSlice.actions;

// Export reducer
export default instructorSlice.reducer;

// Selectors
export const selectInstructorClasses = (state: { instructor: InstructorState }) =>
  state.instructor.classes;
export const selectInstructorLoading = (state: { instructor: InstructorState }) =>
  state.instructor.isLoading;
export const selectInstructorError = (state: { instructor: InstructorState }) =>
  state.instructor.error;
export const selectInstructorAssignments = (state: { instructor: InstructorState }) =>
  state.instructor.assignments;
export const selectAssignmentsLoading = (state: { instructor: InstructorState }) =>
  state.instructor.isAssignmentsLoading;
export const selectAssignmentsError = (state: { instructor: InstructorState }) =>
  state.instructor.assignmentsError;