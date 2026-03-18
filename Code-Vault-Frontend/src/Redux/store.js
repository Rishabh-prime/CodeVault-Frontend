import { configureStore } from "@reduxjs/toolkit";
import authReducer, { loginSuccess } from "./Slices/authSlice";
import folderReducer from "./Slices/folderSlice";
import fileReducer from "./Slices/fileSlice";
import taskReducer from "./Slices/taskSlice";

export const store = configureStore({
 reducer: {
  auth: authReducer,
  folders: folderReducer,
  files: fileReducer,
  tasks: taskReducer,   
},
});

// Rehydrate auth from localStorage on page refresh
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));
if (token && user) {
  store.dispatch(loginSuccess({ token, user }));
}