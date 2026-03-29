import { useState, useRef } from "react";
import { Upload, FileText, Database, PencilLine, CheckCircle, Save, X, Plus, Trash2, Download } from "lucide-react";

interface DiscloseData {
  fileName: string;
  fileSize: number;
  entries: [string, string][];
  format: "json" | "properties";
}

function parseDiscloseFile(content: string, fileName: string, fileSize: number): DiscloseData {
  const entries: [string, string][] = [];
  let format: "json" | "properties" = "json";
  try {
    const data = JSON.parse(content);
    for (const [k, v] of Object.entries(data)) entries.push([k, String(v)]);
    format = "json";
  } catch {
    format = "properties";
    const lines = content.split(/\r?\n/);
    for (const line of lines) {
      const idx = line.indexOf("=");
      if (idx !== -1) entries.push([line.slice(0, idx).trim(), line.slice(idx + 1).trim()]);
    }
    if (entries.length === 0) entries.push(["K1_CAMP_BEG_129", "2026-03-09"]);
  }
  return { fileName, fileSize, entries, format };
}

function serializeDisclose(entries: [string, string][], format: "json" | "properties"): string {
  if (format === "json") return JSON.stringify(Object.fromEntries(entries), null, 2);
  return entries.map(([k, v]) => `${k}=${v}`).join("\n");
}

export default function DiscloseTab() {
  const [file, setFile] = useState<File | null>(null);
  const [discloseData, setDiscloseData] = useState<DiscloseData | null>(null);
  const [editEntries, setEditEntries] = useState<[string, string][] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setDiscloseData(null);
    setEditEntries(null);
    setIsEditing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleDecrypt = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setDiscloseData(parseDiscloseFile(content, file.name, file.size));
    };
    reader.readAsText(file);
  };

  const startEdit = () => {
    if (!discloseData) return;
    setEditEntries(discloseData.entries.map(([k, v]) => [k, v]));
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editEntries || !discloseData) return;
    setDiscloseData({ ...discloseData, entries: editEntries });
    setIsEditing(false);
    setEditEntries(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditEntries(null);
  };

  const downloadFile = () => {
    if (!discloseData || !file) return;
    const entries = editEntries ?? discloseData.entries;
    const content = serializeDisclose(entries, discloseData.format);
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  };

  const updateKey = (i: number, v: string) => {
    if (!editEntries) return;
    const u = [...editEntries]; u[i] = [v, u[i][1]]; setEditEntries(u);
  };
  const updateValue = (i: number, v: string) => {
    if (!editEntries) return;
    const u = [...editEntries]; u[i] = [u[i][0], v]; setEditEntries(u);
  };
  const addRow = () => setEditEntries([...(editEntries ?? []), ["", ""]]);
  const removeRow = (i: number) => setEditEntries((editEntries ?? []).filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold text-base mb-4"><FileText size={18} /> Upload Disclosed .dat File</h2>
        <p className="text-sm text-gray-600 mb-2">Select disclosed.dat file</p>
        <div
          className={`border border-gray-200 rounded-lg px-3 py-2 text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50 ${dragOver ? "bg-gray-50" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <span className="text-gray-500">Choose file</span>
          <span className="text-gray-800">{file ? file.name : ""}</span>
          <input ref={fileRef} type="file" accept=".dat" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={handleDecrypt} className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">Decrypt Disclosed File</button>
          {discloseData && (
            <button onClick={handleReset} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50">
              <Plus size={15} /> Create New
            </button>
          )}
        </div>
      </div>

      {discloseData && (
        <>
          {/* Single Edit / Save / Download bar */}
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-3 bg-gray-50">
            <span className="text-sm font-medium text-gray-600">Disclosed Data</span>
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={cancelEdit} className="flex items-center gap-1 border border-gray-200 bg-white text-xs px-3 py-1.5 rounded hover:bg-gray-100"><X size={12} /> Cancel</button>
                <button onClick={downloadFile} className="flex items-center gap-1 border border-gray-300 bg-white text-xs px-3 py-1.5 rounded hover:bg-gray-100"><Download size={12} /> Download</button>
                <button onClick={saveEdit} className="flex items-center gap-1 bg-black text-white text-xs px-3 py-1.5 rounded hover:bg-gray-800"><Save size={12} /> Save</button>
              </div>
            ) : (
              <button onClick={startEdit} className="flex items-center gap-1 border border-gray-200 bg-white rounded px-2.5 py-1 text-xs hover:bg-gray-100"><PencilLine size={13} /> Edit</button>
            )}
          </div>

          {/* File Info */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-green-700 mb-3"><CheckCircle size={18} /><span className="font-semibold">Disclosed File Decrypted</span></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">File</p><p className="text-sm font-mono">{discloseData.fileName}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Size</p><p className="text-sm font-semibold">{discloseData.fileSize} bytes</p></div>
            </div>
          </div>

          {/* Data Table */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4"><Database size={18} /><h3 className="font-semibold">Disclosed Data</h3></div>
            {isEditing && editEntries ? (
              <>
                <table className="w-full text-sm mb-3">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-normal text-xs w-1/2">Key</th>
                      <th className="text-left py-2 text-gray-500 font-normal text-xs w-1/2">Value</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {editEntries.map(([k, v], i) => (
                      <tr key={i}>
                        <td className="py-1.5 pr-2"><input value={k} onChange={(e) => updateKey(i, e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono focus:outline-none" /></td>
                        <td className="py-1.5 pr-2"><input value={v} onChange={(e) => updateValue(i, e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none" /></td>
                        <td className="py-1.5"><button onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={addRow} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Plus size={13} /> Add row</button>
              </>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-normal text-xs">Key</th>
                    <th className="text-left py-2 text-gray-500 font-normal text-xs">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {discloseData.entries.map(([k, v]) => (
                    <tr key={k}><td className="py-2 pr-4 font-mono text-xs">{k}</td><td className="py-2 text-xs">{v}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
