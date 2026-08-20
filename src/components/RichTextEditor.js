"use client";

import { useRef, useState, useEffect } from "react";

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`px-2.5 py-1.5 rounded text-sm font-medium border transition-colors ${
      active ? "bg-teal-600 text-white border-teal-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`}
    title={title}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value, onChange, placeholder, rows = 6 }) {
  const editorRef = useRef(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [activeFormats, setActiveFormats] = useState({});

  // Sync external value changes (e.g., when switching between edit/add modes)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const exec = (command, arg = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertTable = () => {
    const rows = Math.max(1, Math.min(10, tableRows));
    const cols = Math.max(1, Math.min(10, tableCols));
    let html = '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; margin: 12px 0;">';
    html += "<tbody>";
    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        html += `<td style="border: 1px solid #d1d5db; padding: 8px;">&nbsp;</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table><p><br></p>";
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    handleInput();
    setShowTableModal(false);
  };

  const insertLink = () => {
    const url = prompt("Enter URL (e.g., https://example.com):");
    if (url && url.trim()) {
      exec("createLink", url.trim());
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <ToolbarButton onClick={() => exec("bold")} title="Bold (Ctrl+B)"><b>B</b></ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} title="Italic (Ctrl+I)"><i>I</i></ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} title="Underline (Ctrl+U)"><u>U</u></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton onClick={() => exec("insertUnorderedList")} title="Bullet List">• List</ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} title="Numbered List">1. List</ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton onClick={() => exec("formatBlock", "h2")} title="Heading">H</ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "p")} title="Paragraph">¶</ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton onClick={insertLink} title="Insert Link">🔗 Link</ToolbarButton>
        <ToolbarButton onClick={() => setShowTableModal(true)} title="Insert Table">⊞ Table</ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton onClick={() => exec("removeFormat")} title="Clear Formatting">⌫ Clear</ToolbarButton>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-[120px] w-full bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none"
        style={{ minHeight: `${rows * 28}px` }}
        data-placeholder={placeholder}
      />

      {/* Table size modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Insert Table</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableRows}
                  onChange={(e) => setTableRows(Number(e.target.value) || 1)}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="admin-label">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(Number(e.target.value) || 1)}
                  className="admin-input"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={insertTable} className="admin-btn">Insert</button>
              <button onClick={() => setShowTableModal(false)} className="admin-btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}