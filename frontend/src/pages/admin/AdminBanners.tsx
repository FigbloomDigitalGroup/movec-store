import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiHash, FiImage, FiEye, FiEyeOff } from 'react-icons/fi';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import type { Product } from '../../types';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  badgeColor: string | null;
  ctaText: string;
  ctaLink: string;
  imageUrl: string | null;
  productId: string | null;
  bgColor: string;
  textColor: string;
  isActive: boolean;
  sortOrder: number;
  product?: Product | null;
}

export default function AdminBanners() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<PromoBanner | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  // Fetch banners
  const { data: banners, isLoading } = useQuery<PromoBanner[]>({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data } = await api.get('/promo-banners/admin/all');
      return data;
    },
  });

  // Fetch products for dropdown
  const { data: productsData } = useQuery({
    queryKey: ['products-for-banners'],
    queryFn: async () => {
      const { data } = await api.get('/products?limit=100');
      return data;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/promo-banners/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['promo-banners'] });
      toast.success('Banner deleted successfully');
      setPendingDelete(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await api.put(`/promo-banners/${id}`, { isActive: !isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['promo-banners'] });
      toast.success('Banner status updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleEdit = (banner: PromoBanner) => {
    setEditingBanner(banner);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBanner(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    setPendingDelete({ id, title });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading banners...</div>;
  }

  const products = productsData?.data || [];

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          icon={FiImage}
          title="Homepage Banners"
          subtitle="Manage hero carousel banners on the homepage"
          action={
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition font-medium"
            >
              <FiPlus size={18} />
              Add Banner
            </button>
          }
        />
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 gap-4">
        {banners && banners.length > 0 ? (
          banners
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((banner) => (
              <div
                key={banner.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
                  {/* Preview */}
                  <div className="md:col-span-1">
                    <div
                      className="h-32 rounded-lg flex items-center justify-center relative overflow-hidden"
                      style={{ backgroundColor: banner.bgColor }}
                    >
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiImage size={32} className="text-white/50" />
                      )}
                      {!banner.isActive && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Inactive</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="md:col-span-2">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex items-center gap-2" title="Edit the banner to change its sort order">
                        <FiHash className="text-gray-500" size={14} />
                        <span className="text-xs text-gray-500 font-medium">Sort position {banner.sortOrder}</span>
                      </div>
                      {banner.badge && (
                        <span
                          className="text-xs px-2 py-0.5 rounded text-white font-medium"
                          style={{ backgroundColor: banner.badgeColor || '#10b982' }}
                        >
                          {banner.badge}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg mb-1" style={{ color: banner.textColor }}>
                      {banner.title}
                    </h3>
                    
                    {banner.subtitle && (
                      <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        CTA: {banner.ctaText}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Link: {banner.ctaLink}
                      </span>
                      {banner.product && (
                        <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          Product: {banner.product.name} (KES {banner.product.price.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex md:flex-col gap-2 justify-end">
                    <button
                      onClick={() => handleToggleActive(banner.id, banner.isActive)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition font-medium text-sm ${
                        banner.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={banner.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {banner.isActive ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex items-center justify-center gap-2 bg-primary-100 text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-200 transition font-medium text-sm"
                    >
                      <FiEdit2 size={16} />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleDelete(banner.id, banner.title)}
                      className="flex items-center justify-center gap-2 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FiImage size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No banners yet</h3>
            <p className="text-gray-500 mb-4">Create your first homepage banner to get started</p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition font-medium"
            >
              <FiPlus size={18} />
              Add Banner
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <BannerModal
          banner={editingBanner}
          products={products}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBanner(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
            queryClient.invalidateQueries({ queryKey: ['promo-banners'] });
            setIsModalOpen(false);
            setEditingBanner(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this banner?"
        description={pendingDelete ? `"${pendingDelete.title}" will be removed from the homepage carousel. This cannot be undone.` : undefined}
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

interface BannerModalProps {
  banner: PromoBanner | null;
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

function BannerModal({ banner, products, onClose, onSuccess }: BannerModalProps) {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    badge: banner?.badge || '',
    badgeColor: banner?.badgeColor || '#FC6501',
    ctaText: banner?.ctaText || 'Shop Now',
    ctaLink: banner?.ctaLink || '/products',
    imageUrl: banner?.imageUrl || '',
    productId: banner?.productId || '',
    bgColor: banner?.bgColor || '#10B982',
    textColor: banner?.textColor || '#ffffff',
    isActive: banner?.isActive ?? true,
    sortOrder: banner?.sortOrder ?? 0,
  });

  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(banner?.imageUrl || '');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post('/cloudinary/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    return data.url;
  };

  const saveMutation = useMutation({
    mutationFn: async (data: Omit<PromoBanner, 'id' | 'product'>) => {
      // Upload image first if there's a new one
      let imageUrl = data.imageUrl;
      if (imageFile) {
        setUploading(true);
        try {
          imageUrl = await uploadImage(imageFile);
        } finally {
          setUploading(false);
        }
      }

      const payload = { ...data, imageUrl };
      
      if (banner) {
        await api.put(`/promo-banners/${banner.id}`, payload);
      } else {
        await api.post('/promo-banners', payload);
      }
    },
    onSuccess: () => {
      toast.success(banner ? 'Banner updated successfully' : 'Banner created successfully');
      onSuccess();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      productId: formData.productId || null,
      subtitle: formData.subtitle || null,
      badge: formData.badge || null,
      badgeColor: formData.badgeColor || null,
      imageUrl: formData.imageUrl || null,
    });
  };

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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <h2 className="text-base font-bold">
              {banner ? 'Edit Banner' : 'Create Banner'}
            </h2>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <Input
              label="Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Starlink Gen 3 Now Available!"
            />

            <Input
              label="Subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g., Get high-speed internet anywhere"
            />

            {/* Badge */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Badge Text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g., NEW ARRIVAL"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Badge Color
                </label>
                <input
                  type="color"
                  value={formData.badgeColor}
                  onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Button Text"
                required
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="e.g., Shop Now"
              />
              <Input
                label="Button Link"
                required
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                placeholder="e.g., /products/starlink"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner Image
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                      setFormData({ ...formData, imageUrl: '' });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiImage size={40} className="text-gray-500 mb-2" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 10MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                  />
                </label>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Recommended size: 1200 × 400px for best results
              </p>
            </div>

            {/* Product (for live pricing) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linked Product (Optional - for live pricing)
              </label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">None - manual price</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - KES {product.price.toLocaleString()}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Link a product to show its live price on the banner
              </p>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color *
                </label>
                <input
                  type="color"
                  value={formData.bgColor}
                  onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Color *
                </label>
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-full h-10 px-1 py-1 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Sort Order & Active Status */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Sort Order"
                required
                min="0"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Active (visible on homepage)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
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
              disabled={saveMutation.isPending || uploading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium disabled:opacity-50"
            >
              {uploading ? 'Uploading image...' : saveMutation.isPending ? 'Saving...' : banner ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
