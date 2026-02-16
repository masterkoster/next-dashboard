'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  role: string;
  createdAt: string;
  flightPlanCount: number;
  clubCount: number;
  homeState?: string | null;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch');
      }
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  // Fetch user details
  const fetchUserDetails = async (userId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      setSelectedUser(data.user);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Update user tier
  const updateUserTier = async (userId: string, tier: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) throw new Error('Failed to update');
      fetchUsers();
      if (selectedUser?.id === userId) {
        fetchUserDetails(userId);
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  // Update user role
  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed to update');
      fetchUsers();
      if (selectedUser?.id === userId) {
        fetchUserDetails(userId);
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  // Reset password
  const resetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (!res.ok) throw new Error('Failed to reset password');
      alert('Password reset successfully');
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <h2 className="text-red-400 font-semibold mb-2">Access Denied</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg font-medium"
        >
          Search
        </button>
      </form>

      {/* Users Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr>
              <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">User</th>
              <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">Tier</th>
              <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">Role</th>
              <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">Plans</th>
              <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">Clubs</th>
              <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">Joined</th>
              <th className="text-left px-4 py-3 text-slate-400 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-t border-slate-800 hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{user.name || 'No name'}</div>
                    <div className="text-sm text-slate-400">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.tier === 'pro' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {user.tier.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'owner' 
                        ? 'bg-amber-500/20 text-amber-400' 
                        : user.role === 'admin'
                        ? 'bg-purple-500/20 text-purple-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{user.flightPlanCount}</td>
                  <td className="px-4 py-3 text-white">{user.clubCount}</td>
                  <td className="px-4 py-3 text-slate-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => fetchUserDetails(user.id)}
                      className="text-sky-400 hover:text-sky-300 text-sm mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => resetPassword(user.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Reset PW
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4 border-t border-slate-800">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-4 py-1 text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded bg-slate-800 text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-white">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {detailLoading ? (
                <div className="text-center py-8 text-slate-400">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400">Email</label>
                      <div className="text-white">{selectedUser.email}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Name</label>
                      <div className="text-white">{selectedUser.name || 'Not set'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Tier</label>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => updateUserTier(selectedUser.id, 'free')}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedUser.tier === 'free'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          Free
                        </button>
                        <button
                          onClick={() => updateUserTier(selectedUser.id, 'pro')}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedUser.tier === 'pro'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          Pro
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Role</label>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => updateUserRole(selectedUser.id, 'user')}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedUser.role === 'user'
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          User
                        </button>
                        <button
                          onClick={() => updateUserRole(selectedUser.id, 'admin')}
                          className={`px-3 py-1 rounded text-sm ${
                            selectedUser.role === 'admin'
                              ? 'bg-purple-500 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Home State</label>
                      <div className="text-white">{selectedUser.homeState || 'Not set'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Flight Plans</label>
                      <div className="text-white">{selectedUser.flightPlanCount}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Clubs</label>
                      <div className="text-white">{selectedUser.clubCount}</div>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Joined</label>
                      <div className="text-white">
                        {new Date(selectedUser.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700">
                    <button
                      onClick={() => resetPassword(selectedUser.id)}
                      className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-medium"
                    >
                      Reset Password
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
