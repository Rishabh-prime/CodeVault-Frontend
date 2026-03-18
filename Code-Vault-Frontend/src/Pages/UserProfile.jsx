import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../Redux/Slices/authSlice"; // adjust path if needed

function UserProfile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Format MongoDB date
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black px-4 py-12 flex items-start justify-center">
      <div className="w-full max-w-lg">

        {/* Avatar + Name */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white text-black text-2xl font-bold flex items-center justify-center mb-4 shadow-lg">
            {getInitials(user?.name)}
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">{user?.name}</h1>
          <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Info Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl mb-4">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">Account Details</h2>
          </div>

          <div className="divide-y divide-zinc-800">
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-zinc-500 text-sm">Full Name</span>
              <span className="text-white text-sm font-medium">{user?.name || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-zinc-500 text-sm">Email</span>
              <span className="text-white text-sm font-medium">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-zinc-500 text-sm">User ID</span>
              <span className="text-zinc-400 text-xs font-mono">{user?.id || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <span className="text-zinc-500 text-sm">Member Since</span>
              <span className="text-white text-sm font-medium">{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="divide-y divide-zinc-800">
            {/* <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3 w-full px-6 py-4 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition duration-150 text-left"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Go to Dashboard
            </button> */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-6 py-4 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition duration-150 text-left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Log Out
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-8">
          © {new Date().getFullYear()} CodeVault • All rights reserved
        </p>
      </div>
    </div>
  );
}

export default UserProfile;