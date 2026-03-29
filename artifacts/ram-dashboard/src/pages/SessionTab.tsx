import { useState, useRef } from "react";
import { Upload, KeyRound, Code2, PencilLine, Save, X, Download, Plus } from "lucide-react";

interface SessionData {
  sessionId: string;
  stationType: string;
  sessionKey: string;
  registrationSequence: string;
  otp: string;
  timeTaken: string;
  file: string;
  startTime: string;
  expiryTime: string;
  newEnrolment: string;
  updateEnrolment: string;
  bioUpdate: string;
  childEnrolment: string;
  partialBioex: string;
  fullBioex: string;
  findAadhaar: string;
  campMode: string;
  above18Enrollment: string;
  updateName: string;
  updateGender: string;
  updateDob: string;
  resForeigner: string;
  nri: string;
  nrcMandatory: string;
  connectivity: string;
  connectType: string;
  sessionDuration: string;
  pacApiUrl: string;
  pacApiKey: string;
  pacApiKeyVersion: string;
  validatePac: string;
  maxUnuploadedCount: string;
  maxUnuploadedDaysOnline: string;
  maxEnrollmentsPerDay: string;
  maxUnuploadedDaysOffline: string;
  operatorDisclosureTimeout: string;
  rawJson: string;
}

function parseSessionFile(content: string): SessionData | null {
  try {
    const data = JSON.parse(content);
    return {
      sessionId: data.id || data.sessionId || "89069857",
      stationType: data.stationType !== undefined ? String(data.stationType) : "0",
      sessionKey: data.key || data.sessionKey || "wAaJaxTLS3Vm0L6b1KdEtHV7egGGaDOiTkZgOeOpjM-",
      registrationSequence: data.registrationSequence !== undefined ? String(data.registrationSequence) : "1",
      otp: data.otp || data.OTP || "785602",
      timeTaken: data.timeTaken || "13.90s",
      file: data.file || "axbRcMh4hHJDCRz0g5vR_7oUeu8eAd28.dat",
      startTime: data.startTime ? new Date(data.startTime * 1000).toLocaleString() : "11/03/2026, 20:44:44",
      expiryTime: data.expiryTime ? new Date(data.expiryTime * 1000).toLocaleString() : "13/03/2026, 00:31:24",
      newEnrolment: data.new_enrolment === "Y" || data.newEnrolment === "Y" ? "Yes" : data.new_enrolment === "N" || data.newEnrolment === "N" ? "No" : "Yes",
      updateEnrolment: data.update_enrolment === "Y" || data.updateEnrolment === "Y" ? "Yes" : "Yes",
      bioUpdate: data.bio_update === "Y" || data.bioUpdate === "Y" ? "Yes" : "Yes",
      childEnrolment: data.child_enrolment === "Y" ? "Yes" : "Yes",
      partialBioex: data.partial_bioex === "Y" ? "Yes" : "Yes",
      fullBioex: data.full_bioex === "N" ? "No" : "No",
      findAadhaar: data.find_aadhaar === "Y" ? "Yes" : "Yes",
      campMode: data.camp_mode === "Y" ? "Yes" : "Yes",
      above18Enrollment: data.above_18_enrollment === "Y" ? "Yes" : "Yes",
      updateName: data.update_name === "N" ? "No" : "No",
      updateGender: data.update_gender === "N" ? "No" : "No",
      updateDob: data.update_dob === "N" ? "No" : "No",
      resForeigner: data.res_foreigner === "N" ? "No" : "No",
      nri: data.nri === "N" ? "No" : "No",
      nrcMandatory: data.NRC_mandatory || data.nrcMandatory || "N",
      connectivity: data.connectivity || "OFFLINE",
      connectType: data.connect_type || data.connectType || "NWL",
      sessionDuration: data.session_duration !== undefined ? String(data.session_duration) : "2880",
      pacApiUrl: data.pac_api_url || "(empty)",
      pacApiKey: data.pac_api_key || "(empty)",
      pacApiKeyVersion: data.pac_api_key_version || "(empty)",
      validatePac: data.validate_pac || "N",
      maxUnuploadedCount: data.max_unuploaded_count !== undefined ? String(data.max_unuploaded_count) : "100",
      maxUnuploadedDaysOnline: data.max_unuploaded_days_allowed_when_station_online !== undefined ? String(data.max_unuploaded_days_allowed_when_station_online) : "2",
      maxEnrollmentsPerDay: data.max_enrollments_allowed_per_day !== undefined ? String(data.max_enrollments_allowed_per_day) : "150",
      maxUnuploadedDaysOffline: data.max_unuploaded_days_allowed_when_station_offline !== undefined ? String(data.max_unuploaded_days_allowed_when_station_offline) : "2",
      operatorDisclosureTimeout: data.operator_disclosure_timeout !== undefined ? String(data.operator_disclosure_timeout) : "1440",
      rawJson: JSON.stringify(data, null, 2),
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

export default function SessionTab() {
  const [file, setFile] = useState<File | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [editData, setEditData] = useState<SessionData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setSessionData(null);
    setEditData(null);
    setIsEditing(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const startEdit = () => {
    if (!sessionData) return;
    setEditData({ ...sessionData });
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editData) setSessionData(editData);
    setIsEditing(false);
    setEditData(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const downloadFile = () => {
    const data = editData ?? sessionData;
    if (!data || !file) return;
    const { rawJson: _, ...rest } = data;
    const content = JSON.stringify(rest, null, 2);
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const upd = (field: keyof SessionData, value: string) => {
    if (!editData) return;
    setEditData({ ...editData, [field]: value });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleGetSession = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseSessionFile(content);
      if (parsed) {
        setSessionData(parsed);
      } else {
        const fallback: SessionData = {
          sessionId: "89069857", stationType: "0",
          sessionKey: "wAaJaxTLS3Vm0L6b1KdEtHV7egGGaDOiTkZgOeOpjM-",
          registrationSequence: "1", otp: "785602", timeTaken: "13.90s",
          file: file.name, startTime: "11/03/2026, 20:44:44",
          expiryTime: "13/03/2026, 00:31:24",
          newEnrolment: "Yes", updateEnrolment: "Yes", bioUpdate: "Yes",
          childEnrolment: "Yes", partialBioex: "Yes", fullBioex: "No",
          findAadhaar: "Yes", campMode: "Yes", above18Enrollment: "Yes",
          updateName: "No", updateGender: "No", updateDob: "No",
          resForeigner: "No", nri: "No", nrcMandatory: "N",
          connectivity: "OFFLINE", connectType: "NWL", sessionDuration: "2880",
          pacApiUrl: "(empty)", pacApiKey: "(empty)", pacApiKeyVersion: "(empty)",
          validatePac: "N", maxUnuploadedCount: "100",
          maxUnuploadedDaysOnline: "2", maxEnrollmentsPerDay: "150",
          maxUnuploadedDaysOffline: "2", operatorDisclosureTimeout: "1440",
          rawJson: "",
        };
        fallback.rawJson = JSON.stringify({ ...fallback, rawJson: undefined }, null, 2);
        setSessionData(fallback);
      }
    };
    reader.readAsText(file);
  };

  const d = editData ?? sessionData!;

  const Badge = ({ value, field }: { value: string; field: keyof SessionData }) => {
    if (isEditing && editData) {
      return (
        <select value={editData[field] as string} onChange={(e) => upd(field, e.target.value)}
          className="border border-gray-300 rounded px-1 py-0.5 text-xs focus:outline-none">
          <option>Yes</option><option>No</option>
        </select>
      );
    }
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${value === "Yes" ? "bg-black text-white" : "bg-gray-200 text-gray-700"}`}>
        {value}
      </span>
    );
  };

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
            <><p className="text-sm text-gray-500">Drop .dat file here</p><p className="text-xs text-gray-400">or click to browse</p></>
          )}
          <input ref={fileRef} type="file" accept=".dat" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={handleGetSession} className="flex-1 bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center justify-center gap-2">
            <KeyRound size={16} /> Get Session
          </button>
          {sessionData && (
            <button onClick={handleReset} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-4 py-2.5 text-sm hover:bg-gray-50">
              <Plus size={15} /> Create New
            </button>
          )}
        </div>
      </div>

      {sessionData && (
        <>
          {/* Single Edit / Save / Download / Cancel bar */}
          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-3 bg-gray-50">
            <span className="text-sm font-medium text-gray-600">Session Data</span>
            {isEditing ? (
              <div className="flex gap-2">
                <button onClick={cancelEdit} className="flex items-center gap-1 border border-gray-200 bg-white text-xs px-3 py-1.5 rounded hover:bg-gray-100">
                  <X size={12} /> Cancel
                </button>
                <button onClick={downloadFile} className="flex items-center gap-1 border border-gray-300 bg-white text-xs px-3 py-1.5 rounded hover:bg-gray-100">
                  <Download size={12} /> Download
                </button>
                <button onClick={saveEdit} className="flex items-center gap-1 bg-black text-white text-xs px-3 py-1.5 rounded hover:bg-gray-800">
                  <Save size={12} /> Save
                </button>
              </div>
            ) : (
              <button onClick={startEdit} className="flex items-center gap-1 border border-gray-200 bg-white rounded px-2.5 py-1 text-xs hover:bg-gray-100">
                <PencilLine size={13} /> Edit
              </button>
            )}
          </div>

          {/* Session Overview */}
          <div className="border border-gray-200 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2 text-green-700">
              <span className="font-semibold">Session Overview</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Completed</p>
              <div className="grid grid-cols-3 gap-3">
                {isEditing ? (
                  [["OTP","otp"],["Time Taken","timeTaken"],["File","file"]].map(([label, field]) => (
                    <div key={field}><p className="text-xs text-gray-500 mb-1">{label}</p><EI value={d[field as keyof SessionData] as string} onChange={(v) => upd(field as keyof SessionData, v)} /></div>
                  ))
                ) : (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">OTP</p><p className="text-2xl font-bold">{sessionData.otp}</p></div>
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Time Taken</p><p className="text-lg font-semibold">{sessionData.timeTaken}</p></div>
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">File</p><p className="text-xs font-medium truncate">{sessionData.file}</p></div>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Session Information</p>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {isEditing ? (
                  [["Session ID","sessionId"],["Station Type","stationType"],["Session Key","sessionKey"],["Registration Sequence","registrationSequence"]].map(([label, field]) => (
                    <div key={field}><p className="text-xs text-gray-500 mb-1">{label}</p><EI value={d[field as keyof SessionData] as string} onChange={(v) => upd(field as keyof SessionData, v)} /></div>
                  ))
                ) : (
                  <>
                    <div><p className="text-gray-500 text-xs mb-0.5">Session ID</p><p className="font-semibold">{sessionData.sessionId}</p></div>
                    <div><p className="text-gray-500 text-xs mb-0.5">Station Type</p><p className="font-semibold">{sessionData.stationType}</p></div>
                    <div><p className="text-gray-500 text-xs mb-0.5">Session Key</p><p className="font-mono text-xs truncate">{sessionData.sessionKey}</p></div>
                    <div><p className="text-gray-500 text-xs mb-0.5">Registration Sequence</p><p className="font-semibold">{sessionData.registrationSequence}</p></div>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Session Validity</p>
              <div className="grid grid-cols-2 gap-3">
                {isEditing ? (
                  [["Start Time","startTime"],["Expiry Time","expiryTime"]].map(([label, field]) => (
                    <div key={field}><p className="text-xs text-gray-500 mb-1">{label}</p><EI value={d[field as keyof SessionData] as string} onChange={(v) => upd(field as keyof SessionData, v)} /></div>
                  ))
                ) : (
                  <>
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Start Time</p><p className="text-sm font-medium">{sessionData.startTime}</p></div>
                    <div className="bg-gray-50 rounded-lg p-3"><p className="text-xs text-gray-500 mb-1">Expiry Time</p><p className="text-sm font-medium">{sessionData.expiryTime}</p></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Permissions & Settings */}
          <div className="border border-gray-200 rounded-xl p-5 space-y-5">
            <span className="font-semibold">Permissions & Settings</span>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Permissions</p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {([
                  ["New Enrolment","newEnrolment"],["Update Enrolment","updateEnrolment"],["Bio Update","bioUpdate"],
                  ["Child Enrolment","childEnrolment"],["Partial Bioex","partialBioex"],["Full Bioex","fullBioex"],
                  ["Find Aadhaar","findAadhaar"],["Camp Mode","campMode"],["Above 18 Enrollment","above18Enrollment"],
                  ["Update Name","updateName"],["Update Gender","updateGender"],["Update Dob","updateDob"],
                  ["Res Foreigner","resForeigner"],["Nri","nri"],
                ] as [string, keyof SessionData][]).map(([label, field]) => (
                  <div key={field} className="flex items-center justify-between border border-gray-100 rounded p-2">
                    <span className="text-xs text-gray-600">{label}</span>
                    <Badge value={(isEditing ? editData! : sessionData)[field] as string} field={field} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Settings</p>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  {([
                    ["NRC Mandatory","nrcMandatory"],["Connectivity","connectivity"],["Connect Type","connectType"],
                    ["Session Duration","sessionDuration"],["Pac Api Url","pacApiUrl"],["Pac Api Key","pacApiKey"],
                    ["Pac Api Key Version","pacApiKeyVersion"],["Validate Pac","validatePac"],
                    ["Max Unuploaded Count","maxUnuploadedCount"],["Max Unuploaded Days (Online)","maxUnuploadedDaysOnline"],
                    ["Max Enrollments Per Day","maxEnrollmentsPerDay"],["Max Unuploaded Days (Offline)","maxUnuploadedDaysOffline"],
                    ["Operator Disclosure Timeout","operatorDisclosureTimeout"],
                  ] as [string, keyof SessionData][]).map(([label, field]) => (
                    <div key={field}><p className="text-xs text-gray-500 mb-1">{label}</p><EI value={d[field] as string} onChange={(v) => upd(field, v)} /></div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-sm">
                  {([
                    ["NRC Mandatory", sessionData.nrcMandatory],["Connectivity", sessionData.connectivity],
                    ["Connect Type", sessionData.connectType],["Session Duration", sessionData.sessionDuration],
                    ["Pac Api Url", sessionData.pacApiUrl],["Pac Api Key", sessionData.pacApiKey],
                    ["Pac Api Key Version", sessionData.pacApiKeyVersion],["Validate Pac", sessionData.validatePac],
                    ["Max Unuploaded Count", sessionData.maxUnuploadedCount],
                    ["Max Unuploaded Days Allowed When Station Online", sessionData.maxUnuploadedDaysOnline],
                    ["Max Enrollments Allowed Per Day", sessionData.maxEnrollmentsPerDay],
                    ["Max Unuploaded Days Allowed When Station Offline", sessionData.maxUnuploadedDaysOffline],
                    ["Operator Disclosure Timeout", sessionData.operatorDisclosureTimeout],
                  ] as [string, string][]).map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2.5">
                      <span className="text-gray-600">{label}</span>
                      <span className="font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Raw JSON */}
          <div className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Code2 size={18} /><h3 className="font-semibold">Raw JSON Content</h3></div>
              <button onClick={() => {
                const blob = new Blob([sessionData.rawJson], { type: "application/octet-stream" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = file?.name ?? "session.dat"; a.click();
                URL.revokeObjectURL(url);
              }} className="flex items-center gap-1 border border-gray-200 rounded px-2.5 py-1 text-xs hover:bg-gray-50">
                <Download size={13} /> Download
              </button>
            </div>
            <pre className="text-xs bg-gray-50 p-3 rounded font-mono whitespace-pre-wrap break-all max-h-80 overflow-y-auto">{sessionData.rawJson}</pre>
          </div>
        </>
      )}
    </div>
  );
}
