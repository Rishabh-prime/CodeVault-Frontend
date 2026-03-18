import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../Services/api";
import {
  setFiles,
  addFile,
  updateFile,
  removeFile,
  setLoading,
  setError,
} from "../Redux/Slices/fileSlice";

// ── Language config ───────────────────────────────────────────────
const LANGUAGES = [
  { value: "javascript", label: "JavaScript", icon: "🟨" },
  { value: "typescript", label: "TypeScript", icon: "🔷" },
  { value: "python",     label: "Python",     icon: "🐍" },
  { value: "cpp",        label: "C++",        icon: "⚙️"  },
  { value: "c",          label: "C",          icon: "🔵" },
  { value: "java",       label: "Java",       icon: "☕" },
  { value: "go",         label: "Go",         icon: "🐹" },
  { value: "rust",       label: "Rust",       icon: "🦀" },
  { value: "html",       label: "HTML",       icon: "🌐" },
  { value: "css",        label: "CSS",        icon: "🎨" },
];

const getLang = (value) =>
  LANGUAGES.find((l) => l.value === value) || LANGUAGES[0];

// ── Modal ─────────────────────────────────────────────────────────
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
function FilesPage() {
  const { folderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { files, loading, error } = useSelector((state) => state.files);

  const [folderName, setFolderName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeFile, setActiveFile] = useState(null);
  const [newName, setNewName] = useState("");
  const [newLang, setNewLang] = useState("javascript");
  const [renameName, setRenameName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Is this a playground folder? ─────────────────────────────
  // A folder is a playground if it contains html + css + js files
  const isPlayground =
    files.some((f) => f.language === "html") &&
    files.some((f) => f.language === "css") &&
    files.some((f) => f.language === "javascript");

  // ── Load files on mount ───────────────────────────────────────
  useEffect(() => {
    const fetchFiles = async () => {
      dispatch(setLoading());
      try {
        const [filesRes, folderRes] = await Promise.all([
          api.get(`/files/folder/${folderId}`),
          api.get(`/folders`),
        ]);
        dispatch(setFiles(filesRes.data));
        const folder = folderRes.data.find((f) => f._id === folderId);
        if (folder) setFolderName(folder.name);
      } catch (err) {
        dispatch(setError(err.response?.data?.message || "Failed to load files"));
      }
    };
    fetchFiles();
  }, [folderId, dispatch]);

  // ── Create file ───────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/files", {
        name: newName.trim(),
        language: newLang,
        content: "",
        folderId,
      });
      dispatch(addFile(res.data));
      setShowCreate(false);
      setNewName("");
      setNewLang("javascript");
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to create file"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Rename file ───────────────────────────────────────────────
  const handleRename = async () => {
    if (!renameName.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/files/${activeFile._id}`, {
        name: renameName.trim(),
      });
      dispatch(updateFile(res.data));
      setShowRename(false);
      setActiveFile(null);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to rename file"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete file ───────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/files/${activeFile._id}`);
      dispatch(removeFile(activeFile._id));
      setShowDelete(false);
      setActiveFile(null);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to delete file"));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black px-4 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
          <Link to="/folders" className="hover:text-white transition">
            Folders
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{folderName || "..."}</span>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">
              {folderName || "Files"}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {files.length} {files.length === 1 ? "file" : "files"}
            </p>
          </div>

          {/* Right: Open in Playground (if applicable) + New File */}
          <div className="flex items-center gap-2">
            {isPlayground && (
              <button
                onClick={() => navigate(`/playground/${folderId}`)}
                className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-white font-medium rounded-full hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 transition duration-200 text-sm"
              >
                🎮 Open in Playground
              </button>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition duration-200 text-sm"
            >
              <span className="text-lg leading-none">+</span> New File
            </button>
          </div>
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
        {!loading && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-zinc-400 text-lg font-medium">No files yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              Create your first file inside this folder
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-6 px-6 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition text-sm"
            >
              + New File
            </button>
          </div>
        )}

        {/* Files list */}
        {!loading && files.length > 0 && (
          <div className="flex flex-col gap-2">
            {files.map((file) => {
              const lang = getLang(file.language);
              // Playground files open in playground, others open in editor
              const isPlaygroundFile =
                file.language === "html" ||
                file.language === "css";

              return (
                <div
                  key={file._id}
                  className="group flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 cursor-pointer hover:border-zinc-600 transition duration-200"
                  onClick={() =>
                    isPlaygroundFile
                      ? navigate(`/playground/${folderId}`)
                      : navigate(`/files/${file._id}`)
                  }
                >
                  {/* Left: icon + name + language */}
                  <div className="flex items-center gap-4">
                    <span className="text-xl">{lang.icon}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{file.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {lang.label} · {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Right: action buttons on hover */}
                  <div
                    className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition duration-150"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Rename */}
                    <button
                      onClick={() => {
                        setActiveFile(file);
                        setRenameName(file.name);
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
                        setActiveFile(file);
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
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Modal ───────────────────────────────────────── */}
      {showCreate && (
        <Modal title="New File" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">File Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. index.js"
                autoFocus
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Language</label>
              <div className="grid grid-cols-4 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setNewLang(lang.value)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs transition ${
                      newLang === lang.value
                        ? "border-white bg-zinc-700 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{lang.icon}</span>
                    {lang.label}
                  </button>
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
      {showRename && activeFile && (
        <Modal title="Rename File" onClose={() => setShowRename(false)}>
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

      {/* ── Delete Modal ───────────────────────────────────────── */}
      {showDelete && activeFile && (
        <Modal title="Delete File" onClose={() => setShowDelete(false)}>
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">"{activeFile.name}"</span>?
              This action cannot be undone.
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

export default FilesPage;