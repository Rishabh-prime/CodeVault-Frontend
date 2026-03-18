import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  setFolders,
  addFolder,
  updateFolder,
  removeFolder,
  setLoading,
  setError,
} from "../Redux/Slices/folderSlice"; // adjust path if needed

// ── Folder color options ──────────────────────────────────────────
const COLORS = [
  "#ffffff", "#f87171", "#fb923c", "#facc15",
  "#4ade80", "#60a5fa", "#c084fc", "#f472b6",
];

// ── Small reusable modal ──────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition text-xl leading-none"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
function FolderPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { folders, loading, error } = useSelector((state) => state.folders);

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#ffffff");
  const [renameName, setRenameName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Load folders on mount ─────────────────────────────────────
  useEffect(() => {
    const fetchFolders = async () => {
      dispatch(setLoading());
      try {
        const res = await api.get("/folders");
        dispatch(setFolders(res.data));
      } catch (err) {
        dispatch(setError(err.response?.data?.message || "Failed to load folders"));
      }
    };
    fetchFolders();
  }, [dispatch]);

  // ── Create folder ─────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/folders", { name: newName.trim(), color: newColor });
      dispatch(addFolder(res.data));
      setShowCreate(false);
      setNewName("");
      setNewColor("#ffffff");
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to create folder"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Rename folder ─────────────────────────────────────────────
  const handleRename = async () => {
    if (!renameName.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/folders/${activeFolder._id}`, {
        name: renameName.trim(),
      });
      dispatch(updateFolder(res.data));
      setShowRename(false);
      setActiveFolder(null);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to rename folder"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete folder ─────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/folders/${activeFolder._id}`);
      dispatch(removeFolder(activeFolder._id));
      setShowDelete(false);
      setActiveFolder(null);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to delete folder"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black px-4 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">My Folders</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {folders.length} {folders.length === 1 ? "folder" : "folders"}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition duration-200 text-sm"
          >
            <span className="text-lg leading-none">+</span> New Folder
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && folders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-zinc-400 text-lg font-medium">No folders yet</p>
            <p className="text-zinc-600 text-sm mt-1">Create your first folder to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition text-sm"
            >
              + New Folder
            </button>
          </div>
        )}

        {/* Folders grid */}
        {!loading && folders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {folders.map((folder) => (
              <div
                key={folder._id}
                className="group bg-zinc-900 border border-zinc-800 rounded-xl p-5 cursor-pointer hover:border-zinc-600 transition duration-200 flex flex-col gap-3"
                onClick={() => navigate(`/folders/${folder._id}`)}
              >
                {/* Color dot + icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: folder.color || "#ffffff" }}
                    />
                    <span className="text-2xl">📁</span>
                  </div>

                  {/* Action buttons — show on hover */}
                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150"
                    onClick={(e) => e.stopPropagation()} // prevent card click
                  >
                    {/* Rename */}
                    <button
                      onClick={() => {
                        setActiveFolder(folder);
                        setRenameName(folder.name);
                        setShowRename(true);
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-700 transition"
                      title="Rename"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => {
                        setActiveFolder(folder);
                        setShowDelete(true);
                      }}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition"
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Folder name */}
                <div>
                  <p className="text-white font-semibold text-sm truncate">{folder.name}</p>
                  <p className="text-zinc-600 text-xs mt-0.5">{formatDate(folder.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Create Modal ───────────────────────────────────────── */}
      {showCreate && (
        <Modal title="New Folder" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Folder Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. React Projects"
                autoFocus
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      newColor === c ? "border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting || !newName.trim()}
                className="flex-1 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition text-sm disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Rename Modal ───────────────────────────────────────── */}
      {showRename && activeFolder && (
        <Modal title="Rename Folder" onClose={() => setShowRename(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">New Name</label>
              <input
                type="text"
                value={renameName}
                onChange={(e) => setRenameName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                autoFocus
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowRename(false)}
                className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRename}
                disabled={submitting || !renameName.trim()}
                className="flex-1 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition text-sm disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm Modal ───────────────────────────────── */}
      {showDelete && activeFolder && (
        <Modal title="Delete Folder" onClose={() => setShowDelete(false)}>
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">"{activeFolder.name}"</span>?
              This will also delete all files inside it. This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500 transition text-sm disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default FolderPage;