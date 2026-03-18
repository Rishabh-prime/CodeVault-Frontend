import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: [],
  currentFile: null, // file open in the editor
  loading: false,
  error: null,
};

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setFiles: (state, action) => {
      state.files = action.payload;
      state.loading = false;
    },
    addFile: (state, action) => {
      state.files.unshift(action.payload); // newest first
      state.loading = false;
    },
    updateFile: (state, action) => {
      const index = state.files.findIndex((f) => f._id === action.payload._id);
      if (index !== -1) state.files[index] = action.payload;
      state.loading = false;
    },
    removeFile: (state, action) => {
      state.files = state.files.filter((f) => f._id !== action.payload);
      state.loading = false;
    },
    setCurrentFile: (state, action) => {
      state.currentFile = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setFiles,
  addFile,
  updateFile,
  removeFile,
  setCurrentFile,
  setError,
} = fileSlice.actions;

export default fileSlice.reducer;