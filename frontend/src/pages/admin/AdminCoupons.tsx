import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import { FiTag, FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import { TableContainer, TableHead, TableSkeletonRows, TableEmptyState } from '../../components/ui/Table';

const PAGE_SIZE = 20;

// Matches GET /admin/coupons (see backend CouponsService)
interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  minOrderAmount: string | null;
  maxUsage: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
}

interface CouponsResponse {
  data: Coupon[];
  meta: { page: number; limit: number; total: number };
}

function formatDiscount(coupon: Coupon) {
  return coupon.discountType === 'PERCENTAGE'
    ? `${Number(coupon.discountValue)}%`
    : `KES ${Number(coupon.discountValue).toLocaleString()}`;
}

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; code: string; usedCount: number } | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const { data, isLoading } = useQuery<CouponsResponse>({
    queryKey: ['admin-coupons', page, debouncedSearch],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('page', String(page));
      if (debouncedSearch) params.set('search', debouncedSearch);
      return api.get(`/admin/coupons?${params.toString()}`).then((r) => r.data);
    },
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/admin/coupons/${id}`, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon status updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success('Coupon deleted');
      setPendingDelete(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setPendingDelete(null);
    },
  });

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          icon={FiTag}
          title="Coupons"
          subtitle={`${data?.meta?.total ?? 0} coupons total`}
          action={
            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="text"
                  placeholder="Search code..."
                  aria-label="Search coupons"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 transition"
                />
              </div>
              <button
                onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition font-medium whitespace-nowrap"
              >
                <FiPlus size={18} />
                New Coupon
              </button>
            </div>
          }
        />
      </div>

      <TableContainer>
        <table className="w-full text-sm min-w-[800px]">
          <TableHead columns={['Code', 'Discount', 'Min. Order', 'Usage', 'Validity', 'Status', 'Actions']} />
          <tbody>
            {isLoading ? (
              <TableSkeletonRows rows={5} columns={7} />
            ) : !data?.data?.length ? (
              <TableEmptyState
                columns={7}
                icon={FiTag}
                title="No coupons yet"
                description={debouncedSearch ? 'Try adjusting your search.' : 'Create your first coupon code to get started.'}
              />
            ) : (
              data.data.map((coupon) => (
                <tr key={coupon.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4 font-mono font-semibold">{coupon.code}</td>
                  <td className="p-4">{formatDiscount(coupon)}</td>
                  <td className="p-4 text-gray-600">
                    {coupon.minOrderAmount ? `KES ${Number(coupon.minOrderAmount).toLocaleString()}` : '—'}
                  </td>
                  <td className="p-4 text-gray-600">
                    {coupon.usedCount}{coupon.maxUsage ? ` / ${coupon.maxUsage}` : ''}
                  </td>
                  <td className="p-4 text-gray-600 text-xs">
                    {coupon.startsAt ? new Date(coupon.startsAt).toLocaleDateString() : 'Any time'}
                    {' – '}
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive.mutate({ id: coupon.id, isActive: coupon.isActive })}
                        disabled={toggleActive.isPending}
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        className="text-gray-500 hover:text-primary-600 transition disabled:opacity-50"
                      >
                        {coupon.isActive ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                      <button
                        onClick={() => { setEditingCoupon(coupon); setIsModalOpen(true); }}
                        title="Edit"
                        className="text-gray-500 hover:text-primary-600 transition"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => setPendingDelete({ id: coupon.id, code: coupon.code, usedCount: coupon.usedCount })}
                        title="Delete"
                        className="text-gray-500 hover:text-red-600 transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableContainer>
      {!isLoading && (
        <Pagination page={page} limit={PAGE_SIZE} total={data?.meta?.total || 0} onPageChange={setPage} />
      )}

      {isModalOpen && (
        <CouponModal
          coupon={editingCoupon}
          onClose={() => { setIsModalOpen(false); setEditingCoupon(null); }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
            setIsModalOpen(false);
            setEditingCoupon(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title={pendingDelete ? `Delete "${pendingDelete.code}"?` : ''}
        description={
          pendingDelete && pendingDelete.usedCount > 0
            ? `This coupon has been used ${pendingDelete.usedCount} time(s) and can't be deleted — deactivate it instead.`
            : 'This cannot be undone.'
        }
        confirmLabel="Delete"
        danger
        isPending={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

interface CouponModalProps {
  coupon: Coupon | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CouponModal({ coupon, onClose, onSuccess }: CouponModalProps) {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    discountType: coupon?.discountType || 'PERCENTAGE',
    discountValue: coupon ? Number(coupon.discountValue) : 10,
    minOrderAmount: coupon?.minOrderAmount ? Number(coupon.minOrderAmount) : ('' as number | ''),
    maxUsage: coupon?.maxUsage ?? ('' as number | ''),
    startsAt: coupon?.startsAt ? coupon.startsAt.slice(0, 10) : '',
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : '',
    isActive: coupon?.isActive ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: formData.code.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount === '' ? undefined : Number(formData.minOrderAmount),
        maxUsage: formData.maxUsage === '' ? undefined : Number(formData.maxUsage),
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        isActive: formData.isActive,
      };
      if (coupon) {
        await api.patch(`/admin/coupons/${coupon.id}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
    },
    onSuccess: () => {
      toast.success(coupon ? 'Coupon updated' : 'Coupon created');
      onSuccess();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }}>
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-base font-bold">{coupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
          </div>

          <div className="p-6 space-y-4">
            <Input
              label="Code"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g., SAVE20"
            />
            <p className="text-xs text-gray-500 -mt-2">
              Checkout matches this exactly (case-sensitive) — customers must type it the same way.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed amount (KES)</option>
                </select>
              </div>
              <Input
                type="number"
                label={formData.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount (KES)'}
                required
                min="0"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Minimum Order (KES)"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="No minimum"
              />
              <Input
                type="number"
                label="Max Total Uses"
                min="1"
                value={formData.maxUsage}
                onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="Unlimited"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Starts On"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
              />
              <Input
                type="date"
                label="Expires On"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving...' : coupon ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
