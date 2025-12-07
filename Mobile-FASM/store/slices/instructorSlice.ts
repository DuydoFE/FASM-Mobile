import { InstructorClass } from '@/types/api.types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Instructor State Interface
 * Defines the shape of instructor state in Redux store
 */
interface InstructorState {
  classes: InstructorClass[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Initial state for instructor
 */
const initialState: InstructorState = {
  classes: [],
  isLoading: false,
  error: null,
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
      state.isLoading = false;
      state.error = null;
    },
  },
});

// Export actions
export const {
  setInstructorLoading,
  setInstructorClasses,
  setInstructorError,
  clearInstructorData,
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