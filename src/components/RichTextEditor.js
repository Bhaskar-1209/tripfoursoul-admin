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

export default function RichTextEditor({ value, onChange, placeholder, rows = 6, allowImageUpload = false, uniformTextSize = false }) {
  const editorRef = useRef(null);
  const imageInputRef = useRef(null);
  const selectionRef = useRef(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [activeFormats, setActiveFormats] = useState({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  // Sync external value changes (e.g., when switching between edit/add modes)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || "")) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (!selection?.rangeCount || !editorRef.current?.contains(selection.anchorNode)) return;
    selectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const range = selectionRef.current;
    if (!range || !editorRef.current) return;
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const updateActiveFormats = () => {
    if (!editorRef.current?.contains(window.getSelection()?.anchorNode)) return;
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      unordered: document.queryCommandState("insertUnorderedList"),
      ordered: document.queryCommandState("insertOrderedList"),
    });
    saveSelection();
  };

  const exec = (command, arg = null) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, arg);
    handleInput();
    updateActiveFormats();
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
    restoreSelection();
    document.execCommand("insertHTML", false, html);
    handleInput();
    setShowTableModal(false);
  };

  const insertLink = () => {
    const url = prompt("Enter URL (e.g., https://example.com):");
    if (url && url.trim()) {
      const normalizedUrl = /^(https?:|mailto:|tel:)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
      exec("createLink", normalizedUrl);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.type !== "image/webp") {
      setImageError("Only WebP images can be inserted.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setImageError("Image must be 1 MB or smaller.");
      return;
    }

    setImageError("");
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.imageUrl) throw new Error(data.error || "Image upload failed");

      editorRef.current?.focus();
      restoreSelection();
      const safeAlt = file.name.replace(/\.[^/.]+$/, "").replace(/"/g, "");
      document.execCommand(
        "insertHTML",
        false,
        `<figure style="margin: 20px 0;"><img src="${data.imageUrl}" alt="${safeAlt}" style="width: 100%; height: auto; border-radius: 8px;" /><figcaption style="margin-top: 6px; font-size: 12px; color: #6b7280;">Add image caption</figcaption></figure><p><br></p>`
      );
      handleInput();
    } catch (error) {
      setImageError(error.message || "Image upload failed. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-300">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
        <ToolbarButton onClick={() => exec("bold")} active={activeFormats.bold} title="Bold (Ctrl+B)"><b>B</b></ToolbarButton>
        <ToolbarButton onClick={() => exec("italic")} active={activeFormats.italic} title="Italic (Ctrl+I)"><i>I</i></ToolbarButton>
        <ToolbarButton onClick={() => exec("underline")} active={activeFormats.underline} title="Underline (Ctrl+U)"><u>U</u></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton onClick={() => exec("insertUnorderedList")} active={activeFormats.unordered} title="Bullet List">• List</ToolbarButton>
        <ToolbarButton onClick={() => exec("insertOrderedList")} active={activeFormats.ordered} title="Numbered List">1. List</ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton onClick={() => exec("formatBlock", "<h2>")} title="Heading">H</ToolbarButton>
        <ToolbarButton onClick={() => exec("formatBlock", "<p>")} title="Paragraph">¶</ToolbarButton>
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton onClick={insertLink} title="Insert Link">🔗 Link</ToolbarButton>
        <ToolbarButton onClick={() => setShowTableModal(true)} title="Insert Table">⊞ Table</ToolbarButton>
        {allowImageUpload && (
          <>
            <ToolbarButton onClick={() => imageInputRef.current?.click()} title="Insert Image">
              {uploadingImage ? "Uploading…" : "▧ Image"}
            </ToolbarButton>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/webp"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
          </>
        )}
        <span className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarButton onClick={() => { exec("removeFormat"); exec("unlink"); exec("formatBlock", "<p>"); }} title="Clear Formatting">⌫ Clear</ToolbarButton>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={updateActiveFormats}
        className={`rich-text-editor min-h-[120px] w-full bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none ${uniformTextSize ? "rich-text-editor--uniform-size" : ""}`}
        style={{ minHeight: `${rows * 28}px` }}
        data-placeholder={placeholder}
      />
      {allowImageUpload && (
        <p className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
          Use “Image” to place photos anywhere in the article. WebP only, max 1 MB per image.
          {imageError && <span className="ml-2 text-red-600">{imageError}</span>}
        </p>
      )}

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
