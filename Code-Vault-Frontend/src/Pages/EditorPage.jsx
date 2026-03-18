import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import api from "../services/api";

// ── Language config with Judge0 language IDs ─────────────────────
const LANGUAGES = [
  { value: "javascript", label: "JavaScript", icon: "JS",  judge0Id: 63 },
  { value: "typescript", label: "TypeScript",  icon: "TS",  judge0Id: 74 },
  { value: "python",     label: "Python",      icon: "PY",  judge0Id: 71 },
  { value: "cpp",        label: "C++",         icon: "C++", judge0Id: 54 },
  { value: "c",          label: "C",           icon: "C",   judge0Id: 50 },
  { value: "java",       label: "Java",        icon: "JV",  judge0Id: 62 },
  { value: "go",         label: "Go",          icon: "GO",  judge0Id: 60 },
  { value: "rust",       label: "Rust",        icon: "RS",  judge0Id: 73 },
];

const getLang = (value) =>
  LANGUAGES.find((l) => l.value === value) || LANGUAGES[0];

// ── Default code snippets ─────────────────────────────────────────
const DEFAULT_CODE = {
  javascript: `// JavaScript\nconsole.log("Hello, CodeVault!");`,
  typescript: `// TypeScript\nconst greet = (name: string): string => \`Hello, \${name}!\`;\nconsole.log(greet("CodeVault"));`,
  python:     `# Python\nprint("Hello, CodeVault!")`,
  cpp:        `// C++\n#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, CodeVault!" << endl;\n    return 0;\n}`,
  c:          `// C\n#include <stdio.h>\nint main() {\n    printf("Hello, CodeVault!\\n");\n    return 0;\n}`,
  java:       `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeVault!");\n    }\n}`,
  go:         `// Go\npackage main\nimport "fmt"\nfunc main() {\n    fmt.Println("Hello, CodeVault!")\n}`,
  rust:       `// Rust\nfn main() {\n    println!("Hello, CodeVault!");\n}`,
};

// ── Judge0 CE public endpoint — no API key needed ─────────────────
const runCode = async (code, judge0Id) => {
  // Submit with wait=true — no polling needed, result comes back directly
  const res = await fetch("https://ce.judge0.com/submissions?wait=true&base64_encoded=false", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source_code: code,
      language_id: judge0Id,
      stdin: "",
    }),
  });

  if (!res.ok) throw new Error(`Judge0 error: ${res.status}`);
  return await res.json();
};

// ── Main EditorPage ───────────────────────────────────────────────
function EditorPage() {
  const { fileId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [outputStatus, setOutputStatus] = useState("idle");
  const [running, setRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [langDropdown, setLangDropdown] = useState(false);
  const langRef = useRef(null);

  // ── Load file on mount ────────────────────────────────────────
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const res = await api.get(`/files/${fileId}`);
        setFile(res.data);
        setCode(res.data.content || DEFAULT_CODE[res.data.language] || "");
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchFile();
  }, [fileId]);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCodeChange = (value) => {
    setCode(value || "");
    setSaved(false);
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await api.put(`/files/${fileId}`, { content: code });
      setSaved(true);
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [code]);

  // ── Change language ───────────────────────────────────────────
  const handleLangChange = async (lang) => {
    setLangDropdown(false);
    const updated = { ...file, language: lang.value };
    setFile(updated);
    if (!code || code === DEFAULT_CODE[file.language]) {
      setCode(DEFAULT_CODE[lang.value] || "");
    }
    setSaved(false);
    try {
      await api.put(`/files/${fileId}`, { language: lang.value });
    } catch (err) {
      console.error("Language update failed:", err);
    }
  };

  // ── Run ───────────────────────────────────────────────────────
  const handleRun = async () => {
    if (running) return;
    setRunning(true);
    setOutput("");
    setOutputStatus("idle");

    try {
      const lang = getLang(file.language);
      const result = await runCode(code, lang.judge0Id);

      // status.id 3 = Accepted
      if (result.status?.id === 3) {
        setOutput(result.stdout || "(no output)");
        setOutputStatus("success");
      } else {
        setOutput(
          result.stderr ||
          result.compile_output ||
          result.status?.description ||
          "Unknown error"
        );
        setOutputStatus("error");
      }
    } catch (err) {
      setOutput(err.message || "Failed to run code");
      setOutputStatus("error");
    } finally {
      setRunning(false);
    }
  };

  // ── Loading / not found ───────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-zinc-500">File not found.</p>
      </div>
    );
  }

  const currentLang = getLang(file.language);

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">

      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800 bg-black shrink-0">

        <div className="flex items-center gap-3">
          <Link
            to={`/folders/${file.folder}`}
            className="text-zinc-500 hover:text-white transition"
            title="Back to folder"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <span className="text-white font-medium text-sm">{file.name}</span>
          <span className={`text-xs ${saved ? "text-zinc-600" : "text-yellow-500"}`}>
            {saved ? "saved" : "unsaved"}
          </span>
        </div>

        <div className="flex items-center gap-2">

          {/* Language dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition text-xs font-mono"
            >
              <span className="text-xs font-bold">{currentLang.icon}</span>
              <span>{currentLang.label}</span>
              <svg className={`w-3 h-3 transition-transform ${langDropdown ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langDropdown && (
              <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => handleLangChange(lang)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-xs transition ${
                      file.language === lang.value
                        ? "bg-zinc-700 text-white"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <span className="font-mono font-bold w-6 text-center">{lang.icon}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white transition text-xs disabled:opacity-40"
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

          {/* Run */}
          <button
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-black font-medium hover:bg-zinc-200 transition text-xs disabled:opacity-50"
          >
            {running ? (
              <div className="w-3 h-3 border border-zinc-400 border-t-black rounded-full animate-spin" />
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {/* ── Editor + Output ────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Monaco Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={file.language === "cpp" ? "cpp" : file.language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderLineHighlight: "line",
              tabSize: 2,
              wordWrap: "on",
              padding: { top: 16 },
              smoothScrolling: true,
              cursorBlinking: "smooth",
              formatOnPaste: true,
            }}
          />
        </div>

        {/* Output Panel */}
        <div className="w-80 border-l border-zinc-800 flex flex-col bg-zinc-950 shrink-0">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
            <span className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">
              Output
            </span>
            {output && (
              <button
                onClick={() => { setOutput(""); setOutputStatus("idle"); }}
                className="text-zinc-600 hover:text-zinc-400 transition text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {!output && !running && (
              <p className="text-zinc-600 text-xs">
                Click <span className="text-white">Run</span> to execute your code.
              </p>
            )}
            {running && (
              <div className="flex items-center gap-2 text-zinc-400 text-xs">
                <div className="w-3 h-3 border border-zinc-600 border-t-white rounded-full animate-spin" />
                Executing...
              </div>
            )}
            {output && !running && (
              <pre className={`text-xs font-mono whitespace-pre-wrap break-words leading-relaxed ${
                outputStatus === "error" ? "text-red-400" : "text-green-400"
              }`}>
                {output}
              </pre>
            )}
          </div>

          {output && !running && (
            <div className={`px-4 py-2 border-t border-zinc-800 text-xs font-medium ${
              outputStatus === "error" ? "text-red-500" : "text-green-500"
            }`}>
              {outputStatus === "error" ? "x  Error" : "v  Success"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditorPage;