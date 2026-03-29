import { useState, useRef } from "react";
import { Upload, Database, PencilLine, Save, X, Plus, Trash2, Download } from "lucide-react";

interface EIDEntry {
  eid: string;
  date: string;
  time: string;
}

interface StationData {
  fileName: string;
  fileSize: number;
  entries: EIDEntry[];
}

function parseStationFile(content: string, fileName: string, fileSize: number): StationData {
  const entries: EIDEntry[] = [];

  // 1. Try JSON
  try {
    const data = JSON.parse(content);
    const list = Array.isArray(data) ? data : data.entries ?? [];
    if (list.length > 0) {
      list.forEach((item: Record<string, string>) => {
        entries.push({ eid: item.eid || item.EID || item.Eid || "", date: item.date || item.Date || "", time: item.time || item.Time || "" });
      });
      return { fileName, fileSize, entries };
    }
  } catch { /* not JSON */ }

  // 2. Try plain text lines (only accept lines that start with a long digit sequence)
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Try structured delimiters first; fall back to any whitespace (space-separated .old files)
    let parts = trimmed.split(/[\t,|]/);
    if (parts.length < 2) parts = trimmed.split(/\s+/);
    const firstPart = parts[0].trim();
    if (/^\d{10,20}$/.test(firstPart)) {
      entries.push({
        eid: firstPart,
        date: parts[1]?.trim() || "",
        time: parts[2]?.trim() || "",
      });
    }
  }

  // 3. Binary extraction: scan for isolated 10–20 digit sequences surrounded by non-digits
  if (entries.length === 0) {
    const eidRegex = /(?<!\d)(\d{10,20})(?!\d)/g;
    const dateRegex = /\d{2}[\/\-]\d{2}[\/\-]\d{4}/g;
    const timeRegex = /\d{2}:\d{2}:\d{2}/g;

    const eids = [...content.matchAll(eidRegex)].map((m) => m[1]);
    const dates = content.match(dateRegex) || [];
    const times = content.match(timeRegex) || [];

    eids.forEach((eid, i) => {
      entries.push({
        eid,
        date: dates[i] || dates[0] || "",
        time: times[i] || times[0] || "",
      });
    });
  }

  return { fileName, fileSize, entries };
}

function serializeStationData(entries: EIDEntry[], originalFileName: string): string {
  const ext = originalFileName.split(".").pop()?.toLowerCase();
  if (ext === "txt") {
    return entries.map((e) => `${e.eid}\t${e.date}\t${e.time}`).join("\n");
  }
  return JSON.stringify({ entries }, null, 2);
}

export default function StationDataTab() {
  const [file, setFile] = useState<File | null>(null);
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [editEntries, setEditEntries] = useState<EIDEntry[] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setStationData(null);
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
      setStationData(parseStationFile(content, file.name, file.size));
    };
    reader.readAsText(file, "latin1");
  };

  const startEdit = () => {
    if (!stationData) return;
    setEditEntries(stationData.entries.map((e) => ({ ...e })));
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editEntries || !stationData) return;
    setStationData({ ...stationData, entries: editEntries });
    setIsEditing(false);
    setEditEntries(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditEntries(null);
  };

  const downloadFile = () => {
    if (!stationData || !file) return;
    const entries = editEntries ?? stationData.entries;
    const content = serializeStationData(entries, file.name);
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  };

  const updateEntry = (i: number, field: keyof EIDEntry, value: string) => {
    if (!editEntries) return;
    const updated = [...editEntries];
    updated[i] = { ...updated[i], [field]: value };
    setEditEntries(updated);
  };

  const addRow = () => setEditEntries([...(editEntries ?? []), { eid: "", date: "", time: "" }]);
  const removeRow = (i: number) => setEditEntries((editEntries ?? []).filter((_, idx) => idx !== i));

  const displayEntries = isEditing ? editEntries! : stationData?.entries ?? [];

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold text-base mb-4"><Database size={18} /> Station Data</h2>
        <div
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragOver ? "border-gray-400 bg-gray-50" : "border-gray-200"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={32} className="mx-auto mb-2 text-gray-400" />
          {file ? (
            <><p className="text-sm font-medium">{file.name}</p><p className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</p></>
          ) : (
            <><p className="text-sm text-gray-500">Drop stationData.txt here</p><p className="text-xs text-gray-400">or click to browse</p></>
          )}
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={handleDecrypt} className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">Decrypt</button>
          {stationData && (
            <button onClick={handleReset} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50">
              <Plus size={15} /> Create New
            </button>
          )}
        </div>
      </div>

      {stationData && (
        <>
          {/* Single Edit / Save / Download bar */}
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-3 bg-gray-50">
            <span className="text-sm font-medium text-gray-600">Station Data</span>
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

          {/* File Info + Table */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2"><Database size={18} /><h3 className="font-semibold">{stationData.fileName}</h3></div>
            </div>
            <p className="text-xs text-gray-500 mb-3">{displayEntries.length} EID {displayEntries.length === 1 ? "entry" : "entries"}</p>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-normal text-xs w-8">#</th>
                  <th className="text-left py-2 text-gray-500 font-normal text-xs">EID</th>
                  <th className="text-left py-2 text-gray-500 font-normal text-xs">Date</th>
                  <th className="text-left py-2 text-gray-500 font-normal text-xs">Time</th>
                  {isEditing && <th className="w-8" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayEntries.map((entry, i) => (
                  <tr key={i}>
                    <td className="py-2 text-xs text-gray-400">{i + 1}</td>
                    {isEditing ? (
                      <>
                        <td className="py-1.5 pr-2"><input value={entry.eid} onChange={(e) => updateEntry(i, "eid", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono focus:outline-none" /></td>
                        <td className="py-1.5 pr-2"><input value={entry.date} onChange={(e) => updateEntry(i, "date", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none" /></td>
                        <td className="py-1.5 pr-2"><input value={entry.time} onChange={(e) => updateEntry(i, "time", e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none" /></td>
                        <td className="py-1.5"><button onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button></td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 font-mono text-xs">{entry.eid}</td>
                        <td className="py-2.5 text-xs">{entry.date}</td>
                        <td className="py-2.5 text-xs">{entry.time}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <button onClick={addRow} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 mt-3"><Plus size={13} /> Add row</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
