import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../Services/api";
import {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setLoading,
  setError,
} from "../redux/slices/taskSlice";

// ── Column config ─────────────────────────────────────────────────
const COLUMNS = [
  { id: "todo",        label: "Todo",        emoji: "📋", color: "zinc"  },
  { id: "in-progress", label: "In Progress", emoji: "⚡", color: "yellow" },
  { id: "done",        label: "Done",        emoji: "✅", color: "green" },
];

const COLUMN_STYLES = {
  todo:          { header: "text-zinc-400",   border: "border-zinc-700",   bg: "bg-zinc-900"  },
  "in-progress": { header: "text-yellow-400", border: "border-yellow-800", bg: "bg-zinc-900"  },
  done:          { header: "text-green-400",  border: "border-green-800",  bg: "bg-zinc-900"  },
};

// ── Modal ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition text-xl leading-none">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const styles = COLUMN_STYLES[task.status];

  return (
    <div className={`group bg-zinc-800 border ${styles.border} rounded-xl p-4 flex flex-col gap-3 hover:border-zinc-500 transition duration-200`}>

      {/* Title + actions */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-white text-sm font-medium leading-snug flex-1">{task.title}</p>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
          <button
            onClick={() => onEdit(task)}
            className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-700 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task)}
            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-zinc-500 text-xs leading-relaxed">{task.description}</p>
      )}

      {/* Move status buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {COLUMNS.filter((c) => c.id !== task.status).map((col) => (
          <button
            key={col.id}
            onClick={() => onStatusChange(task, col.id)}
            className="text-xs px-2.5 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
          >
            Move to {col.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
function TasksPage() {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTask, setActiveTask] = useState(null);

  // Form state
  const [form, setForm] = useState({ title: "", description: "", status: "todo" });
  const [submitting, setSubmitting] = useState(false);

  // ── Load tasks on mount ───────────────────────────────────────
  useEffect(() => {
    const fetchTasks = async () => {
      dispatch(setLoading());
      try {
        const res = await api.get("/tasks");
        dispatch(setTasks(res.data));
      } catch (err) {
        dispatch(setError(err.response?.data?.message || "Failed to load tasks"));
      }
    };
    fetchTasks();
  }, [dispatch]);

  // ── Create task ───────────────────────────────────────────────
  const handleCreate = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/tasks", form);
      dispatch(addTask(res.data));
      setShowCreate(false);
      setForm({ title: "", description: "", status: "todo" });
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to create task"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit task ─────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.put(`/tasks/${activeTask._id}`, form);
      dispatch(updateTask(res.data));
      setShowEdit(false);
      setActiveTask(null);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to update task"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete task ───────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/tasks/${activeTask._id}`);
      dispatch(removeTask(activeTask._id));
      setShowDelete(false);
      setActiveTask(null);
    } catch (err) {
      dispatch(setError(err.response?.data?.message || "Failed to delete task"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Move status ───────────────────────────────────────────────
  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { status: newStatus });
      dispatch(updateTask(res.data));
    } catch (err) {
      dispatch(setError("Failed to update status"));
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  const openEdit = (task) => {
    setActiveTask(task);
    setForm({ title: task.title, description: task.description, status: task.status });
    setShowEdit(true);
  };

  const openDelete = (task) => {
    setActiveTask(task);
    setShowDelete(true);
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black px-4 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-white text-2xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-zinc-500 text-sm mt-1">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</p>
          </div>
          <button
            onClick={() => { setForm({ title: "", description: "", status: "todo" }); setShowCreate(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-full hover:bg-zinc-200 transition duration-200 text-sm"
          >
            <span className="text-lg leading-none">+</span> New Task
          </button>
        </div>

        {/* Error */}
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

        {/* Kanban Board */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLUMNS.map((col) => {
              const colTasks = getTasksByStatus(col.id);
              const styles = COLUMN_STYLES[col.id];

              return (
                <div key={col.id} className={`border ${styles.border} rounded-xl overflow-hidden flex flex-col`} style={{ height: "calc(100vh - 220px)" }}>
                  {/* Column header */}
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${styles.border} bg-zinc-900/50 shrink-0`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{col.emoji}</span>
                      <span className={`text-sm font-semibold ${styles.header}`}>{col.label}</span>
                    </div>
                    <span className="text-xs text-zinc-600 font-medium bg-zinc-800 px-2 py-0.5 rounded-full">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks */}
              <div className="p-3 flex flex-col gap-2.5 overflow-y-auto flex-1 task-scroll">
                    {colTasks.length === 0 && (
                      <p className="text-zinc-700 text-xs text-center py-8">No tasks here</p>
                    )}
                    {colTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onEdit={openEdit}
                        onDelete={openDelete}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Modal ───────────────────────────────────────── */}
      {showCreate && (
        <Modal title="New Task" onClose={() => setShowCreate(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. Fix login bug"
                autoFocus
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Description <span className="text-zinc-600">(optional)</span></label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Add more details..."
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Status</label>
              <div className="flex gap-2">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setForm({ ...form, status: col.id })}
                    className={`flex-1 py-2 rounded-lg border text-xs transition ${
                      form.status === col.id
                        ? "border-white bg-zinc-700 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {col.emoji} {col.label}
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
                disabled={submitting || !form.title.trim()}
                className="flex-1 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition text-sm disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Edit Modal ─────────────────────────────────────────── */}
      {showEdit && activeTask && (
        <Modal title="Edit Task" onClose={() => setShowEdit(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Status</label>
              <div className="flex gap-2">
                {COLUMNS.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setForm({ ...form, status: col.id })}
                    className={`flex-1 py-2 rounded-lg border text-xs transition ${
                      form.status === col.id
                        ? "border-white bg-zinc-700 text-white"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {col.emoji} {col.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                disabled={submitting || !form.title.trim()}
                className="flex-1 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition text-sm disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Delete Modal ───────────────────────────────────────── */}
      {showDelete && activeTask && (
        <Modal title="Delete Task" onClose={() => setShowDelete(false)}>
          <div className="space-y-4">
            <p className="text-zinc-400 text-sm">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">"{activeTask.title}"</span>?
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

export default TasksPage;