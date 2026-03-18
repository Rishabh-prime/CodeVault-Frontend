import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../services/api"; // adjust path if needed

const COLORS = [
  "#ffffff", "#f87171", "#fb923c", "#facc15",
  "#4ade80", "#60a5fa", "#c084fc", "#f472b6",
];

function FetchFolder() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await api.get("/folders");
        setFolders(res.data);
      } catch (err) {
        console.error("Failed to fetch folders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFolders();
  }, []);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  return (
    <div className="min-h-screen bg-black px-4 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Welcome header */}
        <div className="mb-10">
          <h1 className="text-white text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]} 🐼
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            Here's everything in your vault.
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          <button
            onClick={() => navigate("/folders")}
            className="flex flex-col items-start gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 transition group"
          >
            <span className="text-2xl">📁</span>
            <span className="text-white text-sm font-medium">Folders</span>
            <span className="text-zinc-600 text-xs">{folders.length} total</span>
          </button>

          <button
            onClick={() => navigate("/tasks")}
            className="flex flex-col items-start gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 transition group"
          >
            <span className="text-2xl">📋</span>
            <span className="text-white text-sm font-medium">Tasks</span>
            <span className="text-zinc-600 text-xs">Manage your work</span>
          </button>

          <button
            onClick={() => navigate("/playground")}
            className="flex flex-col items-start gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 transition group"
          >
            <span className="text-2xl">🎮</span>
            <span className="text-white text-sm font-medium">Playground</span>
            <span className="text-zinc-600 text-xs">HTML · CSS · JS</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-start gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-600 transition group"
          >
            <span className="text-2xl">👤</span>
            <span className="text-white text-sm font-medium">Profile</span>
            <span className="text-zinc-600 text-xs">{user?.email}</span>
          </button>
        </div>

        {/* Recent Folders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg">Recent Folders</h2>
            <button
              onClick={() => navigate("/folders")}
              className="text-zinc-500 hover:text-white text-sm transition"
            >
              View all →
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && folders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-800 rounded-xl">
              <span className="text-4xl mb-3">📁</span>
              <p className="text-zinc-400 font-medium">No folders yet</p>
              <p className="text-zinc-600 text-sm mt-1">Create your first folder to get started</p>
              <button
                onClick={() => navigate("/folders")}
                className="mt-5 px-5 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition text-sm"
              >
                + New Folder
              </button>
            </div>
          )}

          {/* Folders grid — show latest 8 */}
          {!loading && folders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {folders.slice(0, 8).map((folder) => (
                <div
                  key={folder._id}
                  onClick={() => navigate(`/folders/${folder._id}`)}
                  className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-zinc-600 transition duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color || "#ffffff" }}
                    />
                    <span className="text-2xl">📁</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm truncate">{folder.name}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{formatDate(folder.createdAt)}</p>
                  </div>
                </div>
              ))}

              {/* See more card */}
              {folders.length > 8 && (
                <div
                  onClick={() => navigate("/folders")}
                  className="bg-zinc-900 border border-zinc-800 border-dashed rounded-xl p-5 cursor-pointer hover:border-zinc-500 transition duration-200 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:text-white"
                >
                  <span className="text-2xl">+</span>
                  <p className="text-xs font-medium">{folders.length - 8} more folders</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FetchFolder;