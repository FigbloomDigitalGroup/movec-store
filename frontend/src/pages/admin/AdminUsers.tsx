import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { FiShield, FiCheck, FiX } from 'react-icons/fi';

const ALL_ROLES = ['ADMIN', 'CUSTOMER', 'STAFF', 'TECHNICIAN'] as const;
type RoleName = (typeof ALL_ROLES)[number];

const ROLE_COLORS: Record<RoleName, string> = {
  ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
  CUSTOMER: 'bg-blue-100 text-blue-700 border-blue-200',
  STAFF: 'bg-amber-100 text-amber-700 border-amber-200',
  TECHNICIAN: 'bg-green-100 text-green-700 border-green-200',
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [editingRoles, setEditingRoles] = useState<string | null>(null);
  const [pendingRoles, setPendingRoles] = useState<RoleName[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users?limit=100').then((r) => r.data),
  });

  const toggleUser = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/users/${id}`, { isActive: !isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const updateRoles = useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: RoleName[] }) =>
      api.patch(`/admin/users/${id}`, { roles }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingRoles(null);
    },
  });

  const openRoleEditor = (user: any) => {
    setEditingRoles(user.id);
    setPendingRoles(user.roles as RoleName[]);
  };

  const toggleRole = (role: RoleName) => {
    setPendingRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const saveRoles = (userId: string) => {
    if (pendingRoles.length === 0) return; // must keep at least one role
    updateRoles.mutate({ id: userId, roles: pendingRoles });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading users…
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FiShield size={22} className="text-purple-600" />
        <h1 className="text-2xl font-bold">Users &amp; Roles</h1>
        <span className="ml-auto text-sm text-gray-500">
          {data?.meta?.total ?? 0} users total
        </span>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase tracking-wide text-xs">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Roles</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((user: any) => (
              <tr key={user.id} className="border-t hover:bg-gray-50 transition">
                {/* Name */}
                <td className="p-4 font-medium">
                  {user.firstName} {user.lastName}
                </td>

                {/* Email */}
                <td className="p-4 text-gray-600">{user.email}</td>

                {/* Roles — click pencil to edit */}
                <td className="p-4">
                  {editingRoles === user.id ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {ALL_ROLES.map((role) => {
                          const selected = pendingRoles.includes(role);
                          return (
                            <button
                              key={role}
                              onClick={() => toggleRole(role)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium transition
                                ${selected ? ROLE_COLORS[role] : 'bg-gray-100 text-gray-400 border-gray-200'}`}
                            >
                              {selected && <FiCheck size={11} />}
                              {role}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => saveRoles(user.id)}
                          disabled={pendingRoles.length === 0 || updateRoles.isPending}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updateRoles.isPending ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingRoles(null)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                      {pendingRoles.length === 0 && (
                        <p className="text-red-500 text-xs">Select at least one role.</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      {user.roles?.map((role: RoleName) => (
                        <span
                          key={role}
                          className={`px-2 py-0.5 rounded-full border text-xs font-medium ${ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-600'}`}
                        >
                          {role}
                        </span>
                      ))}
                      <button
                        onClick={() => openRoleEditor(user)}
                        title="Edit roles"
                        className="ml-1 text-gray-400 hover:text-blue-600 transition"
                      >
                        <FiShield size={14} />
                      </button>
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Actions */}
                <td className="p-4">
                  <button
                    onClick={() =>
                      toggleUser.mutate({ id: user.id, isActive: user.isActive })
                    }
                    className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition ${
                      user.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {user.isActive ? (
                      <>
                        <FiX size={12} /> Deactivate
                      </>
                    ) : (
                      <>
                        <FiCheck size={12} /> Activate
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}