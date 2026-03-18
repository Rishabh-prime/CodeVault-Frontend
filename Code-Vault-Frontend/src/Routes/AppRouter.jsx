import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../Layouts/DashboardLayout.jsx";

import Signup from "../Pages/SignupPage.jsx";
import Login from "../Pages/Login.jsx";
// ! User Profile Page
import UserProfile from "../Pages/UserProfile.jsx";
// ! Home Page
import Home from "../Pages/HomePage.jsx"
import FolderPage from "../Pages/FolderPage.jsx";
import FilesPage from "../Pages/FilesPage.jsx";
import EditorPage from "../Pages/EditorPage.jsx";
import TasksPage from "../Pages/TasksPage";
import PlaygroundPage from "../Pages/PlaygroundPage.jsx";



const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        

        <Route element={<DashboardLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<UserProfile />} />
          
          <Route path="/folders" element={<FolderPage />} />
         <Route path="/folders/:folderId" element={<FilesPage />} />
          <Route path="/files/:fileId" element={<EditorPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/playground/:folderId" element={<PlaygroundPage />} />

          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
