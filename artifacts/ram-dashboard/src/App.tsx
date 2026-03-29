import { useState } from "react";
import { LogOut, KeyRound, Settings, FileText, Database, LayoutDashboard } from "lucide-react";
import Login from "@/pages/Login";
import SessionTab from "@/pages/SessionTab";
import ConfTab from "@/pages/ConfTab";
import DiscloseTab from "@/pages/DiscloseTab";
import StationDataTab from "@/pages/StationDataTab";
import AdminPanel from "@/pages/AdminPanel";
import { loadUsers, type AppUser } from "@/lib/users";

const SESSION_KEY = "chirag_dashboard_session";

function loadSession(): AppUser | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    const saved = JSON.parse(stored) as AppUser;
    const fresh = loadUsers().find((u) => u.id === saved.id && u.active);
    return fresh ?? null;
  } catch {
    return null;
  }
}

function saveSession(user: AppUser | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

type Tab = "session" | "conf" | "disclose" | "stationData" | "admin";

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => loadSession());
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const user = loadSession();
    return user?.role === "admin" ? "admin" : "session";
  });

  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    saveSession(user);
    setActiveTab(user.role === "admin" ? "admin" : "session");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveSession(null);
    setActiveTab("session");
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const userTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "session", label: "Session", icon: <KeyRound size={14} /> },
    { id: "conf", label: "Conf", icon: <Settings size={14} /> },
    { id: "disclose", label: "Disclose", icon: <FileText size={14} /> },
    { id: "stationData", label: "Station Data", icon: <Database size={14} /> },
  ];

  const adminTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "admin", label: "Users", icon: <LayoutDashboard size={14} /> },
    ...userTabs,
  ];

  const tabs = currentUser.role === "admin" ? adminTabs : userTabs;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="w-24">
          {currentUser.role === "admin" && (
            <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-medium">Admin</span>
          )}
        </div>
        <h1 className="text-xl font-bold tracking-tight">Chirag Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 border border-gray-200 rounded px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          <LogOut size={14} />
          Logout
        </button>
      </header>

      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-6 py-3 text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-gray-800 text-gray-900 font-medium bg-gray-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "admin" && <AdminPanel />}
        {activeTab === "session" && <SessionTab />}
        {activeTab === "conf" && <ConfTab />}
        {activeTab === "disclose" && <DiscloseTab />}
        {activeTab === "stationData" && <StationDataTab />}
      </main>
    </div>
  );
}
