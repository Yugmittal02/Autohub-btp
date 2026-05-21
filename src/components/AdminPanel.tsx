import React, { useState, useEffect } from 'react';
import { Users, Shield, Plus, Copy, Trash2, Key, RefreshCcw, X, Edit2, AlertTriangle, UserX, Download } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AdminPanelProps {
  onBack: () => void;
  t: (k: string) => string;
  isDark: boolean;
  deferredPrompt?: any;
  setDeferredPrompt?: (prompt: any) => void;
}

const API_BASE = (import.meta as any).env?.VITE_API_URL || '';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBack, t, isDark, deferredPrompt, setDeferredPrompt }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editStatus, setEditStatus] = useState('active');
  
  const token = localStorage.getItem('krixov_token');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/auth/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const generatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile) return alert('Name and mobile required');
    try {
      const currentToken = localStorage.getItem('krixov_token');
      const res = await fetch(`${API_BASE}/api/auth/admin/generate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newName, mobile: newMobile, role: 'user' })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate PIN');
      }
      const newUser = await res.json();
      setUsers([newUser, ...users]);
      setShowAddModal(false);
      setNewName('');
      setNewMobile('');
    } catch (err: any) {
      alert('Error generating PIN: ' + err.message);
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditName(user.name || '');
    setEditMobile(user.mobile || '');
    setEditStatus(user.status || 'active');
  };

  const handleUpdateUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedUser) return;
    try {
      const currentToken = localStorage.getItem('krixov_token');
      const res = await fetch(`${API_BASE}/api/auth/admin/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editName, mobile: editMobile, status: editStatus })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update user');
      }
      const updatedUser = await res.json();
      setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
      setSelectedUser(null);
    } catch (err: any) {
      alert('Error updating user: ' + err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm('Are you absolutely sure you want to permanently delete this user? This cannot be undone.')) return;
    
    try {
      const currentToken = localStorage.getItem('krixov_token');
      const res = await fetch(`${API_BASE}/api/auth/admin/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setSelectedUser(null);
    } catch (err: any) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const copyToClipboard = (pin: string) => {
    navigator.clipboard.writeText(pin);
    alert('PIN Copied: ' + pin);
  };

  return (
    <div className={`fixed inset-0 z-[100] ${isDark ? 'bg-slate-950 text-white' : 'bg-gray-50 text-slate-900'} overflow-y-auto`}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-200'}`}>
              ←
            </button>
            <div className={`p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white`}>
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Manage Access PINs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {deferredPrompt && (
              <button 
                onClick={() => {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then((choiceResult: any) => {
                    if (setDeferredPrompt) setDeferredPrompt(null);
                  });
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-amber-500/30 transition-all active:scale-95"
              >
                <Download size={18} />
                Install App
              </button>
            )}
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus size={18} />
              Add New User
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6 font-semibold">
            {error}
          </div>
        )}

        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-inherit font-bold text-sm uppercase tracking-wider opacity-70">
            <div className="col-span-2">User ID / PIN</div>
            <div>Role</div>
            <div className="text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-inherit">
            {loading ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center gap-2">
                <RefreshCcw className="animate-spin" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No users found.</div>
            ) : (
              users.map(user => (
                <div key={user._id} className={`grid grid-cols-4 gap-4 p-4 items-center transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {user.role === 'admin' ? <Shield size={18} /> : <Users size={18} />}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-lg tracking-wider">
                        {user.pin.match(/.{1,4}/g)?.join('-') || user.pin}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {user.name && user.mobile ? `${user.name} • ${user.mobile}` : `Created: ${new Date(user.createdAt).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      user.role === 'admin' 
                        ? 'bg-purple-500/20 text-purple-500' 
                        : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {user.role}
                    </span>
                    {user.status && user.status !== 'active' && (
                      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        user.status === 'suspended' ? 'bg-orange-500/20 text-orange-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {user.status}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => copyToClipboard(user.pin)}
                      className={`p-2 inline-flex items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-black'} transition-colors`}
                      title="Copy PIN"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => openEditModal(user)}
                      className={`p-2 inline-flex items-center justify-center rounded-lg ${isDark ? 'bg-slate-800 text-blue-400 hover:text-blue-300' : 'bg-blue-50 text-blue-600 hover:text-blue-700'} transition-colors`}
                      title="Edit User"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="text-indigo-500" />
                Add New User
              </h2>
              <button onClick={() => setShowAddModal(false)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={generatePin} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-indigo-500 text-black'}`}
                  placeholder="e.g. Ramesh Sharma"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Mobile Number</label>
                <input 
                  type="tel" 
                  value={newMobile} 
                  onChange={e => setNewMobile(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 focus:border-indigo-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-indigo-500 text-black'}`}
                  placeholder="e.g. 9876543210"
                  required
                />
              </div>
              
              <button 
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Key size={18} />
                Generate PIN & Add User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit2 className="text-blue-500" />
                Edit User
              </h2>
              <button onClick={() => setSelectedUser(null)} className={`p-1 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-black'}`}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-blue-500 text-black'}`}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Mobile Number</label>
                <input 
                  type="tel" 
                  value={editMobile} 
                  onChange={e => setEditMobile(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-blue-500 text-black'}`}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase opacity-70 mb-1 block">Account Status</label>
                <select 
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value)}
                  className={`w-full p-3 rounded-xl border outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 focus:border-blue-500 text-white' : 'bg-gray-50 border-gray-200 focus:border-blue-500 text-black'}`}
                >
                  <option value="active">Active (Normal Access)</option>
                  <option value="suspended">Suspended (Temporarily Stopped)</option>
                  <option value="banned">Banned (Permanently Stopped)</option>
                </select>
                {editStatus === 'suspended' && <p className="text-xs text-orange-500 mt-1 flex items-center gap-1"><AlertTriangle size={12}/> User will not be able to log in until reactivated.</p>}
                {editStatus === 'banned' && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><UserX size={12}/> User is permanently blocked from the system.</p>}
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={handleDeleteUser}
                  className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
