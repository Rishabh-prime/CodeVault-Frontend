import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  folders: [],
  loading: false,
  error: null,
};

const folderSlice = createSlice({
  name: "folders",
  initialState,
  reducers: {
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setFolders: (state, action) => {
      state.folders = action.payload;
      state.loading = false;
    },
    addFolder: (state, action) => {
      state.folders.unshift(action.payload); // newest first
      state.loading = false;
    },
    updateFolder: (state, action) => {
      const index = state.folders.findIndex(
        (f) => f._id === action.payload._id
      );
      if (index !== -1) state.folders[index] = action.payload;
      state.loading = false;
    },
    removeFolder: (state, action) => {
      state.folders = state.folders.filter((f) => f._id !== action.payload);
      state.loading = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setFolders,
  addFolder,
  updateFolder,
  removeFolder,
  setError,
} = folderSlice.actions;

export default folderSlice.reducer;