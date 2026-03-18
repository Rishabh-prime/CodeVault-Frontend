import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "../Layouts/DashboardLayout.jsx";

import Signup from "../Pages/SignupPage.jsx";
import Login from "../Pages/Login.jsx";
// ! User Profile Page
import UserProfile from "../Pages/UserProfile.jsx";
// ! Home Page
import Home from "../Pages/HomePage.jsx"
import TaskPage from "../Pages/TaskPage.jsx";
import FolderPage from "../Pages/FolderPage.jsx";


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        

        <Route element={<DashboardLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/folders" element={<FolderPage />} />

          <Route path="/" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
