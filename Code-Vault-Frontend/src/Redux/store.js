import { configureStore } from "@reduxjs/toolkit";
import authReducer, { loginSuccess } from "./slices/authSlice";
import folderReducer from "./Slices/folderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    folders: folderReducer,
  },
});

// Rehydrate auth from localStorage on page refresh
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
if (token && user) {
  store.dispatch(loginSuccess({ token, user }));
}