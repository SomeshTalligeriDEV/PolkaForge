"use client"

import { useState } from "react"
import { Save, Play, Download, Copy, Check } from "lucide-react"

interface CodeEditorProps {
  fileName: string
  initialContent: string
  language: string
  onSave?: (content: string) => void
  readOnly?: boolean
}

export default function CodeEditor({ fileName, initialContent, language, onSave, readOnly = false }: CodeEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (onSave) {
      onSave(content)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = () => {
    // Simulate code execution
    console.log("Running code:", content)
    alert("Code execution simulated! Check console for output.")
  }

  const getLanguageColor = (lang: string) => {
    const colors: { [key: string]: string } = {
      javascript: "bg-yellow-500",
      typescript: "bg-blue-500",
      python: "bg-green-500",
      rust: "bg-orange-500",
      go: "bg-cyan-500",
      java: "bg-red-500",
      cpp: "bg-purple-500",
      markdown: "bg-gray-500",
      json: "bg-indigo-500",
    }
    return colors[lang] || "bg-gray-500"
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getLanguageColor(language)}`}></div>
          <span className="font-medium">{fileName}</span>
          <span className="badge badge-secondary text-xs">{language}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn btn-secondary btn-sm flex items-center gap-1"
            title="Copy to clipboard"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy"}
          </button>

          {language === "javascript" || language === "typescript" || language === "python" ? (
            <button onClick={handleRun} className="btn btn-secondary btn-sm flex items-center gap-1" title="Run code">
              <Play size={14} />
              Run
            </button>
          ) : null}

          {!readOnly && (
            <button
              onClick={handleSave}
              className={`btn btn-sm flex items-center gap-1 ${saved ? "btn-success" : "btn-primary"}`}
              title="Save file"
            >
              {saved ? <Check size={14} /> : <Save size={14} />}
              {saved ? "Saved!" : "Save"}
            </button>
          )}

          <button className="btn btn-secondary btn-sm flex items-center gap-1" title="Download file">
            <Download size={14} />
            Download
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-96 p-4 font-mono text-sm bg-transparent border-0 resize-none focus:outline-none"
          placeholder={`Write your ${language} code here...`}
          readOnly={readOnly}
          style={{
            lineHeight: "1.5",
            tabSize: 2,
          }}
        />

        {/* Line numbers */}
        <div className="absolute left-0 top-0 p-4 pointer-events-none select-none opacity-50 font-mono text-sm">
          {content.split("\n").map((_, index) => (
            <div key={index} style={{ lineHeight: "1.5" }}>
              {index + 1}
            </div>
          ))}
        </div>

        <style jsx>{`
          textarea {
            padding-left: ${content.split("\n").length.toString().length * 8 + 32}px;
          }
        `}</style>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm opacity-70">
        <div>
          Lines: {content.split("\n").length} | Characters: {content.length}
        </div>
        <div>Language: {language}</div>
      </div>
    </div>
  )
}
