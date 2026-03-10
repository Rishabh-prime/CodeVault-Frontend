import { Outlet } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const DashboardLayout = () => {
  return (
    <div>

      <Header />

      <main className="p-4">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
};

export default DashboardLayout;