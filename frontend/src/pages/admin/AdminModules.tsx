import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiLayers } from 'react-icons/fi';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';

export default function AdminModules() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 });
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const { data: modules, isLoading } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: () => api.get('/admin/modules').then(r => r.data),
  });

  const createApi = useMutation({
    mutationFn: (data: any) => api.post('/admin/modules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      setIsCreating(false);
      setFormData({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 });
    },
  });

  const updateApi = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/admin/modules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      setIsEditing(null);
    },
  });

  const deleteApi = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/modules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      setPendingDeleteId(null);
    },
  });

  const handleSave = () => {
    if (isCreating) {
      createApi.mutate(formData);
    } else if (isEditing) {
      updateApi.mutate({ id: isEditing, data: formData });
    }
  };

  const handleEdit = (mod: any) => {
    setIsEditing(mod.id);
    setIsCreating(false);
    setFormData({
      name: mod.name,
      slug: mod.slug,
      description: mod.description || '',
      isActive: mod.isActive,
      sortOrder: mod.sortOrder,
    });
  };

  if (isLoading) return <p>Loading modules...</p>;

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          icon={FiLayers}
          title="Modules (Solutions)"
          subtitle="Product categories shown as solution landing pages on the storefront."
          action={
            <button
              onClick={() => { setIsCreating(true); setIsEditing(null); setFormData({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 }); }}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-600 transition"
            >
              <FiPlus /> Add Module
            </button>
          }
        />
      </div>

      {(isCreating || isEditing) && (
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm mb-6 relative">
          <button onClick={() => { setIsCreating(false); setIsEditing(null); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <FiX size={20} />
          </button>
          <h2 className="text-xl font-section-title mb-4">{isCreating ? 'Add New Module' : 'Edit Module'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Slug"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              required
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
              />
            </div>
            <Input
              type="number"
              label="Sort Order"
              value={formData.sortOrder}
              onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
            />
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="isActive" className="text-sm font-medium">Is Active</label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => { setIsCreating(false); setIsEditing(null); }} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">Save</button>
          </div>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Slug</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Order</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules?.length ? modules.map((mod: any) => (
              <tr key={mod.id} className="border-t">
                <td className="p-4 font-medium">{mod.name}</td>
                <td className="p-4 text-gray-500">{mod.slug}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${mod.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {mod.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">{mod.sortOrder}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleEdit(mod)} className="p-2 text-primary-500 hover:bg-primary-50 rounded"><FiEdit2 /></button>
                  <button onClick={() => setPendingDeleteId(mod.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><FiTrash2 /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 text-sm">No modules yet. Add one to get started.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDeleteId}
        title="Delete this module?"
        description="This removes it from the storefront's solutions navigation. It cannot be undone."
        confirmLabel="Delete"
        isPending={deleteApi.isPending}
        onConfirm={() => pendingDeleteId && deleteApi.mutate(pendingDeleteId)}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
