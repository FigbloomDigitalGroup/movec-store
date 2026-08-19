import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { FiShield, FiCheck, FiX } from 'react-icons/fi';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';

const PAGE_SIZE = 20;

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
  const [pendingToggle, setPendingToggle] = useState<{ id: string; isActive: boolean; name: string } | null>(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page],
    queryFn: () => api.get(`/admin/users?limit=${PAGE_SIZE}&page=${page}`).then((r) => r.data),
  });

  const toggleUser = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/users/${id}`, { isActive: !isActive }),
    onSuccess: (_data, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(isActive ? 'User deactivated' : 'User activated');
      setPendingToggle(null);
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
  });

  const updateRoles = useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: RoleName[] }) =>
      api.patch(`/admin/users/${id}`, { roles }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingRoles(null);
      toast.success('Roles updated');
    },
    onError: (err: any) => toast.error(getErrorMessage(err)),
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
      <div className="mb-6">
        <PageHeader
          icon={FiShield}
          title="Users & Roles"
          subtitle={`${data?.meta?.total ?? 0} users total`}
        />
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
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
            {!data?.data?.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No users found.</td>
              </tr>
            )}
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
                                ${selected ? ROLE_COLORS[role] : 'bg-gray-100 text-gray-500 border-gray-200'}`}
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
                          className="px-3 py-1 bg-primary-500 text-white rounded text-xs hover:bg-primary-600 disabled:opacity-50"
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
                        className="ml-1 text-gray-500 hover:text-primary-500 transition"
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
                      setPendingToggle({ id: user.id, isActive: user.isActive, name: `${user.firstName} ${user.lastName}` })
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
        {!isLoading && (
          <Pagination page={page} limit={PAGE_SIZE} total={data?.meta?.total || 0} onPageChange={setPage} />
        )}
      </div>

      <ConfirmDialog
        open={!!pendingToggle}
        title={pendingToggle ? `${pendingToggle.isActive ? 'Deactivate' : 'Activate'} ${pendingToggle.name}?` : ''}
        description={
          pendingToggle?.isActive
            ? 'They will immediately lose access to their account until reactivated.'
            : 'They will regain access to their account.'
        }
        confirmLabel={pendingToggle?.isActive ? 'Deactivate' : 'Activate'}
        danger={!!pendingToggle?.isActive}
        isPending={toggleUser.isPending}
        onConfirm={() => pendingToggle && toggleUser.mutate({ id: pendingToggle.id, isActive: pendingToggle.isActive })}
        onCancel={() => setPendingToggle(null)}
      />
    </div>
  );
}