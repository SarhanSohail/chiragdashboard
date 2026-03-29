import { useState } from "react";
import { Users, Shield, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { USERS, type AppUser } from "@/lib/users";

export default function AdminPanel() {
  const [users, setUsers] = useState<AppUser[]>(USERS);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ displayName: "", password: "" });

  const toggleActive = (id: number) => {
    if (id === 0) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  const startEdit = (user: AppUser) => {
    setEditingId(user.id);
    setEditForm({ displayName: user.displayName, password: user.password });
  };

  const saveEdit = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, displayName: editForm.displayName, password: editForm.password }
          : u
      )
    );
    setEditingId(null);
  };

  const toggleShowPassword = (id: number) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const adminUser = users.find((u) => u.role === "admin")!;
  const regularUsers = users.filter((u) => u.role === "user");

  return (
    <div className="space-y-6">
      <div className="border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-gray-700" />
          <h2 className="font-semibold text-base">Admin Account</h2>
        </div>
        <UserRow
          user={adminUser}
          showPassword={!!showPasswords[adminUser.id]}
          onTogglePassword={() => toggleShowPassword(adminUser.id)}
          isEditing={editingId === adminUser.id}
          editForm={editForm}
          onEditFormChange={setEditForm}
          onStartEdit={() => startEdit(adminUser)}
          onSaveEdit={() => saveEdit(adminUser.id)}
          onCancelEdit={() => setEditingId(null)}
          onToggleActive={() => toggleActive(adminUser.id)}
          isAdminSelf
        />
      </div>

      <div className="border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={18} className="text-gray-700" />
          <h2 className="font-semibold text-base">Users</h2>
          <span className="ml-auto text-xs text-gray-400">{regularUsers.filter((u) => u.active).length} active / {regularUsers.length} total</span>
        </div>
        <div className="divide-y divide-gray-100">
          {regularUsers.map((user) => (
            <div key={user.id} className="py-3 first:pt-0 last:pb-0">
              <UserRow
                user={user}
                showPassword={!!showPasswords[user.id]}
                onTogglePassword={() => toggleShowPassword(user.id)}
                isEditing={editingId === user.id}
                editForm={editForm}
                onEditFormChange={setEditForm}
                onStartEdit={() => startEdit(user)}
                onSaveEdit={() => saveEdit(user.id)}
                onCancelEdit={() => setEditingId(null)}
                onToggleActive={() => toggleActive(user.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface UserRowProps {
  user: AppUser;
  showPassword: boolean;
  onTogglePassword: () => void;
  isEditing: boolean;
  editForm: { displayName: string; password: string };
  onEditFormChange: (f: { displayName: string; password: string }) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onToggleActive: () => void;
  isAdminSelf?: boolean;
}

function UserRow({
  user,
  showPassword,
  onTogglePassword,
  isEditing,
  editForm,
  onEditFormChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onToggleActive,
  isAdminSelf,
}: UserRowProps) {
  if (isEditing) {
    return (
      <div className="flex flex-wrap gap-3 items-center py-1">
        <div className="flex flex-col gap-1 flex-1 min-w-36">
          <label className="text-xs text-gray-500">Display Name</label>
          <input
            value={editForm.displayName}
            onChange={(e) => onEditFormChange({ ...editForm, displayName: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-36">
          <label className="text-xs text-gray-500">Password</label>
          <input
            value={editForm.password}
            onChange={(e) => onEditFormChange({ ...editForm, password: e.target.value })}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onSaveEdit} className="bg-black text-white text-xs px-3 py-1.5 rounded hover:bg-gray-800">Save</button>
          <button onClick={onCancelEdit} className="border border-gray-200 text-xs px-3 py-1.5 rounded hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
        {user.displayName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{user.displayName}</p>
        <p className="text-xs text-gray-400">@{user.username}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 font-mono min-w-32">
        <span>{showPassword ? user.password : "••••••••"}</span>
        <button onClick={onTogglePassword} className="ml-1 text-gray-400 hover:text-gray-700">
          {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      </div>
      <button
        onClick={onToggleActive}
        disabled={!!isAdminSelf}
        className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${
          user.active
            ? "text-green-700 bg-green-50"
            : "text-gray-500 bg-gray-100"
        } ${isAdminSelf ? "opacity-60 cursor-not-allowed" : "hover:opacity-80 cursor-pointer"}`}
        title={isAdminSelf ? "Cannot deactivate admin" : user.active ? "Click to deactivate" : "Click to activate"}
      >
        {user.active ? <CheckCircle size={13} /> : <XCircle size={13} />}
        {user.active ? "Active" : "Inactive"}
      </button>
      <button
        onClick={onStartEdit}
        className="text-xs border border-gray-200 px-2.5 py-1 rounded hover:bg-gray-50"
      >
        Edit
      </button>
    </div>
  );
}
