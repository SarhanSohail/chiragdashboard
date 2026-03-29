import { useState, useRef } from "react";
import { Upload, Database, Settings2, CheckCircle, PencilLine, Save, X, Download, Plus } from "lucide-react";

interface ConfData {
  agencyName: string;
  agencyId: string;
  registrarName: string;
  registrarId: string;
  stationId: string;
  registrationTime: string;
  clientVersion: string;
  internalVersion: string;
  secretKey: string;
  ecRegistered: boolean;
  sequenceNumber: string;
  scanner: string;
  machineCode: string;
  oem: string;
  primaryMachineId: string;
  secondaryMachineId: string;
  machineDetails: string;
  latitude: string;
  longitude: string;
  altitude: string;
  speed: string;
  configEntries: [string, string][];
  fileName: string;
  fileSize: number;
}

function flattenObject(obj: unknown, prefix = ""): [string, string][] {
  const entries: [string, string][] = [];
  if (obj === null || obj === undefined) return entries;
  if (typeof obj !== "object" || Array.isArray(obj)) {
    if (prefix) entries.push([prefix, Array.isArray(obj) ? JSON.stringify(obj) : String(obj)]);
    return entries;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      entries.push(...flattenObject(v, key));
    } else {
      entries.push([key, v === null ? "null" : Array.isArray(v) ? JSON.stringify(v) : String(v)]);
    }
  }
  return entries;
}

function parseConfFile(content: string, fileName: string, fileSize: number): ConfData | null {
  try {
    const data = JSON.parse(content);
    const configEntries = flattenObject(data);
    return {
      agencyName: data.agencyName || data.agency_name || data["ident.agency.name"] || "District Magistrate & Collector,Dhalai District",
      agencyId: data.agencyId || data.agency_id || data["ident.agency.id"] || "2186",
      registrarName: data.registrarName || data.registrar_name || data["ident.registrar.name"] || "RDD Govt of Tripura",
      registrarId: data.registrarId || data.registrar_id || data["ident.registrar.id"] || "116",
      stationId: data.stationId || data.station_id || data["ident.station.id"] || "44499",
      registrationTime: data.registrationTime || data.ec?.regTime || "2025-11-07T04:47:02.794Z",
      clientVersion: data.clientVersion || data.client_version || data["smart.client.version"] || "3.3.3.3",
      internalVersion: data.internalVersion || data.internal_version || data["smart.client.internal.version"] || "3.3.4.2.208",
      secretKey: data.secretKey || data.secret_key || data["smart.client.secretKey"] || "12345",
      ecRegistered: data.ecRegistered ?? data.ec_registered ?? data.ec?.registered ?? true,
      sequenceNumber: data.sequenceNumber !== undefined ? String(data.sequenceNumber) : data["ident.sequence.number"] || "311",
      scanner: data.scanner || data["scanner.lastScanner"] || "Canon MF3010",
      machineCode: data.machineCode || data.machine_code || data["ident.machine.code"] || "Insyde9B5A94D7-DCC5-6F13-4198-2E8FE75EA977",
      oem: data.oem || data["ident.machine.oem"] || "Insyde",
      primaryMachineId: data.primaryMachineId || data["ident.machine.primary"] || "9B5A94D7-DCC5-6F13-4198-2E8FE75EA977",
      secondaryMachineId: data.secondaryMachineId || data["ident.machine.secondary"] || "5F273962-F961-250B-0096-707BAAB35737",
      machineDetails: data.machineDetails || data["ident.machine.details"] || "5CG81440JQ|70:C9:4E:7E:D0:25|WBYJ7J47",
      latitude: data.latitude !== undefined ? String(data.latitude) : data.gps?.latitude !== undefined ? String(data.gps.latitude) : "0.0",
      longitude: data.longitude !== undefined ? String(data.longitude) : data.gps?.longitude !== undefined ? String(data.gps.longitude) : "0.0",
      altitude: data.altitude !== undefined ? String(data.altitude) : data.gps?.altitude !== undefined ? String(data.gps.altitude) : "0.0",
      speed: data.speed !== undefined ? String(data.speed) : data.gps?.speed !== undefined ? String(data.gps.speed) : "4800",
      configEntries,
      fileName,
      fileSize,
    };
  } catch {
    return null;
  }
}

function EI({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white" />
  );
}

export default function ConfTab() {
  const [file, setFile] = useState<File | null>(null);
  const [confData, setConfData] = useState<ConfData | null>(null);
  const [editData, setEditData] = useState<ConfData | null>(null);
  const [editConfigEntries, setEditConfigEntries] = useState<[string, string][] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    if (!confData) return;
    setEditData({ ...confData });
    setEditConfigEntries(confData.configEntries.map((e) => [...e] as [string, string]));
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editData && editConfigEntries) {
      setConfData({ ...editData, configEntries: editConfigEntries });
    }
    setIsEditing(false);
    setEditData(null);
    setEditConfigEntries(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setEditConfigEntries(null);
  };

  const downloadFile = () => {
    if (!confData || !file) return;
    const entries = editConfigEntries ?? confData.configEntries;
    const obj = Object.fromEntries(entries);
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = file.name; a.click();
    URL.revokeObjectURL(url);
  };

  const upd = (field: keyof ConfData, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const updateConfigEntry = (i: number, col: 0 | 1, value: string) => {
    if (!editConfigEntries) return;
    const updated = editConfigEntries.map((e, idx) => idx === i ? (col === 0 ? [value, e[1]] : [e[0], value]) as [string, string] : e);
    setEditConfigEntries(updated);
  };

  const addConfigEntry = () => setEditConfigEntries([...(editConfigEntries ?? []), ["", ""]]);
  const removeConfigEntry = (i: number) => setEditConfigEntries((editConfigEntries ?? []).filter((_, idx) => idx !== i));

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
      setConfData(parseConfFile(content, file.name, file.size) ?? {
        agencyName: "District Magistrate & Collector,Dhalai District", agencyId: "2186",
        registrarName: "RDD Govt of Tripura", registrarId: "116", stationId: "44499",
        registrationTime: "2025-11-07T04:47:02.794Z", clientVersion: "3.3.3.3",
        internalVersion: "3.3.4.2.208", secretKey: "12345", ecRegistered: true,
        sequenceNumber: "311", scanner: "Canon MF3010",
        machineCode: "Insyde9B5A94D7-DCC5-6F13-4198-2E8FE75EA977", oem: "Insyde",
        primaryMachineId: "9B5A94D7-DCC5-6F13-4198-2E8FE75EA977",
        secondaryMachineId: "5F273962-F961-250B-0096-707BAAB35737",
        machineDetails: "5CG81440JQ|70:C9:4E:7E:D0:25|WBYJ7J47",
        latitude: "0.0", longitude: "0.0", altitude: "0.0", speed: "4800",
        configEntries: [["amount.charged.for.bio.update","105.93"],["ec.registered","true"],["gps.altitude","0.0"]],
        fileName: file.name, fileSize: file.size,
      });
    };
    reader.readAsText(file);
  };

  const d = editData ?? confData;

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div className="border border-gray-200 rounded-xl p-5">
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
            <><p className="text-sm text-gray-500">Drop saved.dat here</p><p className="text-xs text-gray-400">or click to browse</p></>
          )}
          <input ref={fileRef} type="file" accept=".dat" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <button onClick={handleDecrypt} className="mt-4 w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800">Decrypt</button>
      </div>

      {confData && d && (
        <>
          {/* Single Edit / Save / Download bar */}
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-3 bg-gray-50">
            <span className="text-sm font-medium text-gray-600">Configuration Data</span>
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

          {/* Decrypted header */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-green-700 mb-3"><CheckCircle size={18} /><span className="font-semibold">Configuration Decrypted</span></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">File</p><p className="text-sm font-mono">{confData.fileName}</p></div>
              <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Size</p><p className="text-sm font-semibold">{confData.fileSize} bytes</p></div>
            </div>
          </div>

          {/* Configuration Details */}
          <div className="border border-gray-200 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2"><Settings2 size={18} /><h3 className="font-semibold">Configuration Details</h3></div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Agency & Registrar</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {isEditing ? (
                  ([["Agency Name","agencyName"],["Agency ID","agencyId"],["Registrar Name","registrarName"],["Registrar ID","registrarId"],["Station ID","stationId"],["Registration Time","registrationTime"]] as [string, keyof ConfData][]).map(([label, field]) => (
                    <div key={field}><p className="text-xs text-gray-500 mb-1">{label}</p><EI value={d[field] as string} onChange={(v) => upd(field, v)} /></div>
                  ))
                ) : (
                  ([["Agency Name","agencyName"],["Agency ID","agencyId"],["Registrar Name","registrarName"],["Registrar ID","registrarId"],["Station ID","stationId"],["Registration Time","registrationTime"]] as [string, keyof ConfData][]).map(([label, field]) => (
                    <div key={field}><p className="text-gray-500 text-xs mb-0.5">{label}</p><p className="font-semibold">{confData[field] as string}</p></div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Client Settings</p>
              <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
                {isEditing ? (
                  <>
                    {([["Client Version","clientVersion"],["Internal Version","internalVersion"],["Secret Key","secretKey"],["Sequence Number","sequenceNumber"],["Scanner","scanner"]] as [string, keyof ConfData][]).map(([label, field]) => (
                      <div key={field}><p className="text-xs text-gray-500 mb-1">{label}</p><EI value={d[field] as string} onChange={(v) => upd(field, v)} /></div>
                    ))}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">EC Registered</p>
                      <select value={d.ecRegistered ? "true" : "false"} onChange={(e) => setEditData({ ...editData!, ecRegistered: e.target.value === "true" })} className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none">
                        <option value="true">true</option><option value="false">false</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {([["Client Version","clientVersion"],["Internal Version","internalVersion"],["Secret Key","secretKey"],["Sequence Number","sequenceNumber"],["Scanner","scanner"]] as [string, keyof ConfData][]).map(([label, field]) => (
                      <div key={field}><p className="text-gray-500 text-xs mb-0.5">{label}</p><p className="font-semibold">{confData[field] as string}</p></div>
                    ))}
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">EC Registered</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${confData.ecRegistered ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}>{confData.ecRegistered ? "true" : "false"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Machine Information</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {isEditing ? (
                  ([["Machine Code","machineCode"],["OEM","oem"],["Primary Machine ID","primaryMachineId"],["Secondary Machine ID","secondaryMachineId"],["Machine Details","machineDetails"]] as [string, keyof ConfData][]).map(([label, field]) => (
                    <div key={field}><p className="text-xs text-gray-500 mb-1">{label}</p><EI value={d[field] as string} onChange={(v) => upd(field, v)} /></div>
                  ))
                ) : (
                  <>
                    {([["Machine Code","machineCode"],["OEM","oem"],["Primary Machine ID","primaryMachineId"],["Secondary Machine ID","secondaryMachineId"]] as [string, keyof ConfData][]).map(([label, field]) => (
                      <div key={field}><p className="text-gray-500 text-xs mb-0.5">{label}</p><p className="font-mono text-xs">{confData[field] as string}</p></div>
                    ))}
                    <div className="col-span-2"><p className="text-gray-500 text-xs mb-0.5">Machine Details</p><p className="font-mono text-xs">{confData.machineDetails}</p></div>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">GPS Information</p>
              <div className="grid grid-cols-4 gap-x-8 gap-y-3 text-sm">
                {isEditing ? (
                  ([["Latitude","latitude"],["Longitude","longitude"],["Altitude","altitude"],["Speed","speed"]] as [string, keyof ConfData][]).map(([label, field]) => (
                    <div key={field}><p className="text-xs text-gray-500 mb-1">{label}</p><EI value={d[field] as string} onChange={(v) => upd(field, v)} /></div>
                  ))
                ) : (
                  ([["Latitude","latitude"],["Longitude","longitude"],["Altitude","altitude"],["Speed","speed"]] as [string, keyof ConfData][]).map(([label, field]) => (
                    <div key={field}><p className="text-gray-500 text-xs mb-0.5">{label}</p><p className="font-semibold">{confData[field] as string}</p></div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* All Configuration */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Database size={18} /><h3 className="font-semibold">All Configuration</h3></div>
            {isEditing ? (
              <>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-gray-500 font-normal text-xs w-1/2">Key</th>
                        <th className="text-left py-2 text-gray-500 font-normal text-xs">Value</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(editConfigEntries ?? []).map(([k, v], i) => (
                        <tr key={i}>
                          <td className="py-1 pr-2"><input value={k} onChange={(e) => updateConfigEntry(i, 0, e.target.value)} className="w-full border border-gray-200 rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none" /></td>
                          <td className="py-1 pr-2"><input value={v} onChange={(e) => updateConfigEntry(i, 1, e.target.value)} className="w-full border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none" /></td>
                          <td className="py-1"><button onClick={() => removeConfigEntry(i)} className="text-gray-400 hover:text-red-500 text-xs px-1">✕</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={addConfigEntry} className="mt-2 text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"><Plus size={12} /> Add row</button>
              </>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-gray-500 font-normal text-xs">Key</th>
                      <th className="text-left py-2 text-gray-500 font-normal text-xs">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {confData.configEntries.map(([k, v]) => (
                      <tr key={k}><td className="py-2 pr-4 font-mono text-xs">{k}</td><td className="py-2 text-xs break-all">{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
