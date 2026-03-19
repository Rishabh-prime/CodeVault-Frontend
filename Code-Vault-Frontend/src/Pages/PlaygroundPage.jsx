import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import api from "../Services/api";

// ── Default starter code ──────────────────────────────────────────
const DEFAULT_HTML = `<div class="container">
  <h1>Hello, CodeVault! 🐼</h1>
  <p>Start building something awesome.</p>
  <button onclick="handleClick()">Click Me</button>
</div>`;

const DEFAULT_CSS = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #09090b;
  color: white;
  font-family: sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.container {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}

p {
  color: #a1a1aa;
}

button {
  padding: 10px 24px;
  background: white;
  color: black;
  border: none;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #e4e4e7;
}`;

const DEFAULT_JS = `function handleClick() {
  alert("Hello from CodeVault! 🐼");
}`;

// ── Tab config ────────────────────────────────────────────────────
const TABS = [
  { id: "html", label: "HTML", language: "html",       color: "text-orange-400" },
  { id: "css",  label: "CSS",  language: "css",        color: "text-blue-400"   },
  { id: "js",   label: "JS",   language: "javascript", color: "text-yellow-400" },
];

// ── Modal ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition text-xl leading-none">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Main PlaygroundPage ───────────────────────────────────────────
function PlaygroundPage() {
  const { folderId } = useParams(); // present when opening from folder
  const navigate = useNavigate();

  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);
  const [activeTab, setActiveTab] = useState("html");
  const [preview, setPreview] = useState("");
  const [autoRun, setAutoRun] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [pageLoading, setPageLoading] = useState(false);

  // Save modal
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  // ── Load from existing folder ─────────────────────────────────
  useEffect(() => {
    if (!folderId) return;

    const loadFromFolder = async () => {
      setPageLoading(true);
      try {
        const [filesRes, foldersRes] = await Promise.all([
          api.get(`/files/folder/${folderId}`),
          api.get("/folders"),
        ]);

        const files = filesRes.data;
        const folder = foldersRes.data.find((f) => f._id === folderId);
        if (folder) setFolderName(folder.name);

        // Load each file into the correct editor
        files.forEach((file) => {
          if (file.language === "html")       setHtml(file.content || "");
          else if (file.language === "css")   setCss(file.content || "");
          else if (file.language === "javascript") setJs(file.content || "");
        });
      } catch (err) {
        console.error("Failed to load playground:", err);
      } finally {
        setPageLoading(false);
      }
    };

    loadFromFolder();
  }, [folderId]);

  // ── Build preview HTML ────────────────────────────────────────
  const buildPreview = () => {
    const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>${css}</style>
</head>
<body>
  ${html}
  <script>
    // Catch runtime errors and show in preview
    window.onerror = function(msg, src, line) {
      document.body.innerHTML += '<div style="position:fixed;bottom:0;left:0;right:0;background:#7f1d1d;color:#fca5a5;padding:8px 12px;font-family:monospace;font-size:12px;">Error: ' + msg + ' (line ' + line + ')</div>';
    };
    ${js}
  <\/script>
</body>
</html>`;
    setPreview(doc);
  };

  // Auto-run when code changes
  useEffect(() => {
    if (!autoRun) return;
    const timeout = setTimeout(buildPreview, 600);
    return () => clearTimeout(timeout);
  }, [html, css, js, autoRun]);

  // ── Save to folder ────────────────────────────────────────────
  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    try {
      // 1. Create folder
      const folderRes = await api.post("/folders", {
        name: saveName.trim(),
        color: "#fb923c", // orange — playground color
      });
      const newFolderId = folderRes.data._id;

      // 2. Create 3 files inside the folder
      await Promise.all([
        api.post("/files", {
          name: "index.html",
          language: "html",
          content: html,
          folderId: newFolderId,
        }),
        api.post("/files", {
          name: "style.css",
          language: "css",
          content: css,
          folderId: newFolderId,
        }),
        api.post("/files", {
          name: "script.js",
          language: "javascript",
          content: js,
          folderId: newFolderId,
        }),
      ]);

      setSaveSuccess(`Saved as "${saveName}" in your folders!`);
      setSaveName("");

      // Redirect to the new folder after short delay
      setTimeout(() => {
        setShowSave(false);
        setSaveSuccess("");
        navigate(`/playground/${newFolderId}`);
      }, 1500);

    } catch (err) {
      setSaveError(err.response?.data?.message || "Failed to save playground");
    } finally {
      setSaving(false);
    }
  };

  // ── Update existing folder files ──────────────────────────────
  const handleUpdate = async () => {
    if (!folderId) return;
    setSaving(true);
    try {
      const filesRes = await api.get(`/files/folder/${folderId}`);
      const files = filesRes.data;

      await Promise.all(
        files.map((file) => {
          let content = "";
          if (file.language === "html") content = html;
          else if (file.language === "css") content = css;
          else if (file.language === "javascript") content = js;
          return api.put(`/files/${file._id}`, { content });
        })
      );

      setSaveSuccess("Playground updated!");
      setTimeout(() => setSaveSuccess(""), 2000);
    } catch (err) {
      setSaveError("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const getEditorValue = () => {
    if (activeTab === "html") return html;
    if (activeTab === "css")  return css;
    return js;
  };

  const handleEditorChange = (value) => {
    if (activeTab === "html") setHtml(value || "");
    if (activeTab === "css")  setCss(value || "");
    if (activeTab === "js")   setJs(value || "");
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const currentTab = TABS.find((t) => t.id === activeTab);

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 shrink-0">

        {/* Left: title */}
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-sm tracking-tight">
            {folderId ? folderName || "Playground" : "Playground"} 🎮
          </span>
          {folderId && (
            <button
              onClick={() => navigate(`/folders/${folderId}`)}
              className="text-xs text-zinc-500 hover:text-white transition"
            >
              ← Back to folder
            </button>
          )}
        </div>

        {/* Right: auto-run toggle + run + save */}
        <div className="flex items-center gap-2">

          {/* Success message */}
          {saveSuccess && (
            <span className="text-green-400 text-xs">{saveSuccess}</span>
          )}

          {/* Auto-run toggle */}
          <button
            onClick={() => setAutoRun(!autoRun)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition ${
              autoRun
                ? "border-green-700 text-green-400 bg-green-900/20"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoRun ? "bg-green-400" : "bg-zinc-600"}`} />
            Auto-run
          </button>

          {/* Run button */}
          <button
            onClick={buildPreview}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Run
          </button>

          {/* Save / Update button */}
          {folderId ? (
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition text-xs disabled:opacity-50"
            >
              {saving ? (
                <div className="w-3 h-3 border border-zinc-500 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              )}
              {saving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              onClick={() => setShowSave(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Save to Folder
            </button>
          )}
        </div>
      </div>

      {/* ── Main: Editor + Preview ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Editor panel */}
        <div className="w-1/2 flex flex-col border-r border-zinc-800">

          {/* Language tabs */}
          <div className="flex border-b border-zinc-800 shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold border-b-2 transition ${
                  activeTab === tab.id
                    ? `border-white ${tab.color}`
                    : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={currentTab.language}
              value={getEditorValue()}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                tabSize: 2,
                wordWrap: "on",
                padding: { top: 12 },
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
            />
          </div>
        </div>

        {/* Right: Preview panel */}
        <div className="w-1/2 flex flex-col">
          {/* Preview header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 shrink-0">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
              Preview
            </span>
            {!preview && (
              <span className="text-zinc-600 text-xs">Click Run to see preview</span>
            )}
          </div>

          {/* iframe preview */}
          <div className="flex-1 bg-white relative">
            {!preview ? (
              <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">🎮</span>
                <p className="text-zinc-500 text-sm">Click <span className="text-white">Run</span> to see your preview</p>
              </div>
            ) : (
              <iframe
                title="playground-preview"
                srcDoc={preview}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-modals"
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Save Modal ─────────────────────────────────────────── */}
      {showSave && (
        <Modal title="Save Playground" onClose={() => { setShowSave(false); setSaveError(""); setSaveName(""); }}>
          <div className="space-y-4">
            <p className="text-zinc-500 text-sm">
              This will create a new folder with your HTML, CSS, and JS saved as separate files.
            </p>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">Folder Name</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder="e.g. My Landing Page"
                autoFocus
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition text-sm"
              />
            </div>
            {saveError && (
              <p className="text-red-400 text-xs">{saveError}</p>
            )}
            {saveSuccess && (
              <p className="text-green-400 text-xs">{saveSuccess}</p>
            )}
            <div className="text-xs text-zinc-600 bg-zinc-800 rounded-lg px-3 py-2.5 space-y-0.5">
              <p>📄 index.html</p>
              <p>🎨 style.css</p>
              <p>⚡ script.js</p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => { setShowSave(false); setSaveError(""); setSaveName(""); }}
                className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !saveName.trim()}
                className="flex-1 py-2.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default PlaygroundPage;