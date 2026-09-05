import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import type { Product, Category, Warehouse } from '../../types';
import { FiEdit, FiTrash2, FiPlus, FiImage, FiUpload, FiX, FiStar, FiSearch, FiFilter, FiPackage, FiChevronDown, FiChevronUp, FiTrendingUp, FiBox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Pagination from '../../components/ui/Pagination';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';

const PAGE_SIZE = 20;

// Shape of the create/edit product form — mirrors the fields the admin form
// actually collects (a subset of the backend's CreateProductDto/UpdateProductDto).
interface ProductFormState {
  name: string;
  slug: string;
  description: string;
  price: number;
  sku: string;
  brandId: string;
  categoryIds: string[];
  isFeatured: boolean;
  isBestSeller: boolean;
}

// Shape returned by GET /admin/products (paginated list).
interface ProductsResponse {
  data: Product[];
  meta: { page: number; limit: number; total: number };
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>({
    name: '', slug: '', description: '', price: 0, sku: '',
    brandId: '', categoryIds: [], isFeatured: false, isBestSeller: false,
  });
  const [invForm, setInvForm] = useState({ warehouseId: '', quantity: 0, lowStockThreshold: 5 });

  const [imageProductId, setImageProductId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [stockPanel, setStockPanel] = useState<{ productId: string; warehouseId: string; qty: number } | null>(null);
  const [pendingDeleteProductId, setPendingDeleteProductId] = useState<string | null>(null);
  const [pendingDeleteImageId, setPendingDeleteImageId] = useState<string | null>(null);

  // Debounce the search box so every keystroke doesn't fire its own request.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['admin-products', sortBy, sortOrder, filterCategory, debouncedSearch, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('page', String(page));
      params.set('sortBy', sortBy);
      params.set('order', sortOrder);
      if (filterCategory) params.set('category', filterCategory);
      if (debouncedSearch) params.set('search', debouncedSearch);
      return api.get(`/admin/products?${params.toString()}`).then(r => r.data);
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  const { data: warehouses } = useQuery<Warehouse[]>({
    queryKey: ['warehouses'],
    queryFn: () => api.get('/admin/inventory/warehouses').then(r => r.data),
  });

  const invalidateAllProductQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['featured-products'] });
    queryClient.invalidateQueries({ queryKey: ['best-sellers'] });
  };

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => {
      invalidateAllProductQueries();
      toast.success('Product deleted');
      setPendingDeleteProductId(null);
    },
  });

  const saveProduct = useMutation({
    mutationFn: async (body: ProductFormState) => {
      let productId = editing?.id;
      if (editing) {
        await api.patch(`/admin/products/${editing.id}`, body);
      } else {
        const { data } = await api.post('/admin/products', body);
        productId = data.id;
      }
      if (selectedFiles.length > 0 && productId) {
        const formData = new FormData();
        selectedFiles.forEach(file => formData.append('files', file));
        await api.post(`/admin/products/${productId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      if (invForm.quantity > 0 && invForm.warehouseId && productId) {
        await api.post('/admin/inventory/stock-in', {
          productId,
          warehouseId: invForm.warehouseId,
          quantity: invForm.quantity,
          reference: `Initial stock – ${body.name || editing?.name}`,
        });
      }
    },
    onSuccess: () => {
      invalidateAllProductQueries();
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      setShowForm(false);
      setEditing(null);
      resetForm();
      toast.success(editing ? 'Product updated!' : 'Product created!');
    },
    onError: (error: unknown) => {
      setUploading(false);
      toast.error(getErrorMessage(error) || 'Failed to save product');
    },
  });

  const quickStockIn = useMutation({
    mutationFn: (body: { productId: string; warehouseId: string; quantity: number }) =>
      api.post('/admin/inventory/stock-in', { ...body, reference: 'Manual stock adjustment' }),
    onSuccess: () => {
      invalidateAllProductQueries();
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      setStockPanel(null);
      toast.success('Stock updated!');
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error));
    },
  });

  const uploadImages = useMutation({
    mutationFn: async ({ productId, files }: { productId: string; files: File[] }) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      await api.post(`/admin/products/${productId}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      invalidateAllProductQueries();
      setUploading(false); setImageProductId(null); setSelectedFiles([]); setPreviews([]);
      toast.success('Images uploaded!');
    },
  });

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => api.delete(`/admin/products/images/${imageId}`),
    onSuccess: () => {
      invalidateAllProductQueries();
      setPendingDeleteImageId(null);
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      api.patch(`/admin/products/${id}`, { isFeatured: !isFeatured }),
    onSuccess: () => invalidateAllProductQueries(),
  });

  const toggleBestSeller = useMutation({
    mutationFn: ({ id, isBestSeller }: { id: string; isBestSeller: boolean }) =>
      api.patch(`/admin/products/${id}`, { isBestSeller: !isBestSeller }),
    onSuccess: () => {
      invalidateAllProductQueries();
      toast.success('Best seller status updated');
    },
  });

  const resetForm = () => {
    setForm({ name: '', slug: '', description: '', price: 0, sku: '', brandId: '', categoryIds: [], isFeatured: false, isBestSeller: false });
    setInvForm({ warehouseId: '', quantity: 0, lowStockThreshold: 5 });
    setSelectedFiles([]); setPreviews([]); setUploading(false);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, slug: p.slug, description: p.description, price: p.price, sku: p.sku, brandId: p.brand?.id || '', categoryIds: p.categories?.map(c => c.id) || [], isFeatured: p.isFeatured || false, isBestSeller: p.isBestSeller || false });
    setInvForm({ warehouseId: '', quantity: 0, lowStockThreshold: 5 });
    setSelectedFiles([]); setPreviews([]); setShowForm(true);
    // Product rows sit far below the form, so jump the admin back up to it
    // instead of leaving it open off-screen above their scroll position.
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    fileArray.forEach(file => { const r = new FileReader(); r.onloadend = () => setPreviews(prev => [...prev, r.result as string]); r.readAsDataURL(file); });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removePreview = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleExistingImageUpload = (productId: string) => {
    setImageProductId(productId);
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (imageProductId) { setUploading(true); uploadImages.mutate({ productId: imageProductId, files: Array.from(e.target.files) }); }
      else handleFiles(e.target.files);
    }
  };

  const getProductStock = (p: Product) => p.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) ?? 0;
  const defaultWarehouseId = warehouses?.[0]?.id ?? '';

  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'sku', label: 'SKU' },
  ];

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          icon={FiBox}
          title="Products"
          subtitle="Manage your product catalog, pricing, and inventory."
          action={
            <button
              onClick={() => {
                setEditing(null); resetForm();
                if (defaultWarehouseId) setInvForm(f => ({ ...f, warehouseId: defaultWarehouseId }));
                setShowForm(true);
              }}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-600 transition"
            >
              <FiPlus /> Add Product
            </button>
          }
        />
      </div>

      {/* Filters & Sort Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
            <input type="text" placeholder="Search products..." aria-label="Search products" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="border rounded-lg px-4 py-2">
            <option value="">All Categories</option>
            {categories?.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="border rounded-lg px-4 py-2">
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>)}
          </select>
          <button onClick={() => { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition">
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
          <button onClick={() => { setFilterCategory(''); setSearchTerm(''); setSortBy('createdAt'); setSortOrder('desc'); setPage(1); }} className="text-sm text-primary-500 hover:underline">Reset</button>
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <div ref={formRef} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'New'} Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Input label="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
            <Input label="SKU" helperText="Leave blank to auto-generate" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
            <Input type="number" label="Price (KES)" value={form.price || ''} onChange={e => setForm({ ...form, price: +e.target.value })} />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded-lg px-4 py-2 md:col-span-2" rows={3} />
            <select multiple value={form.categoryIds} onChange={e => setForm({ ...form, categoryIds: Array.from(e.target.selectedOptions, o => o.value) })} className="border rounded-lg px-4 py-2 h-32 md:col-span-2">
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="w-5 h-5 rounded" />
              <span className="text-sm font-medium">Featured Product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isBestSeller} onChange={e => setForm({ ...form, isBestSeller: e.target.checked })} className="w-5 h-5 rounded" />
              <span className="text-sm font-medium">Best Seller</span>
            </label>
          </div>

          {/* ── Inventory Section ── */}
          <div className="mt-6 border-t pt-5">
            <div className="flex items-center gap-2 mb-3">
              <FiPackage className="text-primary-500" size={18} />
              <h3 className="font-semibold text-gray-800">{editing ? 'Add More Stock' : 'Initial Inventory'}</h3>
              {editing && <span className="text-xs text-gray-500 ml-1">(leave qty at 0 to skip)</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Warehouse</label>
                <select value={invForm.warehouseId} onChange={e => setInvForm({ ...invForm, warehouseId: e.target.value })} className="w-full border rounded-lg px-4 py-2">
                  <option value="">-- Select warehouse --</option>
                  {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}{w.location ? ` (${w.location})` : ''}</option>)}
                </select>
              </div>
              <Input
                type="number"
                min={0}
                label={editing ? 'Qty to Add' : 'Initial Quantity'}
                value={invForm.quantity || ''}
                onChange={e => setInvForm({ ...invForm, quantity: Math.max(0, +e.target.value) })}
                placeholder="0"
              />
              <Input
                type="number"
                min={0}
                label="Low Stock Threshold"
                value={invForm.lowStockThreshold || ''}
                onChange={e => setInvForm({ ...invForm, lowStockThreshold: Math.max(0, +e.target.value) })}
                placeholder="5"
              />
            </div>
            {invForm.quantity > 0 && !invForm.warehouseId && (
              <p className="text-xs text-amber-600 mt-2">⚠ Please select a warehouse to save stock.</p>
            )}
          </div>

          {/* Image Section */}
          <div className="mt-6 border-t pt-5">
            <p className="text-sm font-medium mb-2">
              Product Images
              {previews.length > 0 && <span className="ml-2 text-xs text-gray-500 font-normal">{previews.length} image{previews.length > 1 ? 's' : ''} selected</span>}
              {editing && editing.images && editing.images.length > 0 && <span className="ml-2 text-xs text-primary-500 font-normal">{editing.images.length} already uploaded</span>}
            </p>

            {editing && editing.images && editing.images.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Uploaded images ({editing.images.length}):</p>
                  <button type="button" onClick={() => handleExistingImageUpload(editing.id)} className="text-xs text-primary-500 hover:underline flex items-center gap-1"><FiPlus size={12} /> Add more images</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {editing.images.map((img, i) => (
                    <div key={img.id} className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 group/img aspect-square transition">
                      <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      <button type="button" onClick={(e) => { e.preventDefault(); setPendingDeleteImageId(img.id); }} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all shadow-lg"><FiTrash2 size={12} /></button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow">Main</span>}
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-6 text-center transition ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <FiUpload className="mx-auto text-gray-500 mb-2" size={32} />
              <p className="text-sm text-gray-500 mb-2">Drag & drop images here</p>
              <button type="button" onClick={() => { setImageProductId(null); fileInputRef.current?.click(); }} className="text-primary-500 text-sm font-medium hover:underline">or click to browse</button>
            </div>

            {previews.length > 0 && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-primary-700">New images to upload ({previews.length})</p>
                  <button type="button" onClick={() => { setSelectedFiles([]); setPreviews([]); }} className="text-xs text-red-600 hover:underline flex items-center gap-1"><FiX size={12} /> Clear all</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border-2 border-primary-200 group/preview aspect-square hover:border-primary-500 transition">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePreview(i)} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all shadow-lg"><FiX size={12} /></button>
                      {i === 0 && !editing?.images?.length && <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow">Main</span>}
                      <span className="absolute top-1 left-1 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow">New {i + 1}</span>
                    </div>
                  ))}
                  <button type="button" onClick={() => { setImageProductId(null); fileInputRef.current?.click(); }} className="aspect-square rounded-lg border-2 border-dashed border-primary-200 hover:border-primary-500 hover:bg-primary-100 flex flex-col items-center justify-center gap-1 transition">
                    <FiPlus size={20} className="text-primary-500" />
                    <span className="text-[10px] text-primary-500 font-medium">Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                if (!form.name.trim()) { toast.error('Product name is required'); return; }
                if (!form.slug.trim()) { toast.error('Product slug is required'); return; }
                if (!form.description.trim()) { toast.error('Product description is required'); return; }
                if (form.price <= 0) { toast.error('Product price must be greater than 0'); return; }
                if (invForm.quantity > 0 && !invForm.warehouseId) { toast.error('Select a warehouse to save stock'); return; }
                setUploading(true);
                saveProduct.mutate(form);
              }}
              disabled={saveProduct.isPending}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {saveProduct.isPending ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="border px-6 py-2 rounded-lg hover:bg-gray-50 transition">Cancel</button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileInputChange} />

      {/* Product List */}
      {isLoading ? <p className="text-center py-8">Loading...</p> : (
        <div className="space-y-3">
          {data?.data?.length === 0 && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl">
              <FiFilter className="mx-auto text-gray-500 mb-2" size={32} />
              <p className="text-gray-500">No products found matching your filters.</p>
            </div>
          )}
          {data?.data?.map((p: Product) => {
            const stock = getProductStock(p);
            const isExpanded = expandedProduct === p.id;
            return (
              <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition">
                {/* Product Row */}
                <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedProduct(isExpanded ? null : p.id)}>
                  <div className="flex-shrink-0">
                    {!p.images || p.images.length === 0 ? (
                      <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center"><FiImage className="text-gray-500" size={24} /></div>
                    ) : (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                        <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        {p.images.length > 1 && <span className="absolute bottom-1 right-1 bg-primary-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">+{p.images.length - 1}</span>}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold truncate">{p.name}</h3>
                      {p.isFeatured && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Featured</span>}
                      {p.isBestSeller && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Best Seller</span>}
                      {!p.isActive && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Inactive</span>}
                    </div>
                    <p className="text-sm text-gray-500">{p.sku} · KES {p.price.toLocaleString()}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <FiPackage size={12} className={stock > 0 ? 'text-green-600' : 'text-red-500'} />
                      <span className={`text-xs font-medium ${stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {stock > 0 ? `${stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); toggleFeatured.mutate({ id: p.id, isFeatured: p.isFeatured || false }); }} title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'} className={`p-2 rounded-lg transition ${p.isFeatured ? 'text-yellow-600 bg-yellow-100' : 'text-gray-500 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                      <FiStar size={18} fill={p.isFeatured ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toggleBestSeller.mutate({ id: p.id, isBestSeller: p.isBestSeller || false }); }} title={p.isBestSeller ? 'Remove from best sellers' : 'Mark as best seller'} className={`p-2 rounded-lg transition ${p.isBestSeller ? 'text-orange-600 bg-orange-100' : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'}`}>
                      <FiTrendingUp size={18} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition"><FiEdit size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setPendingDeleteProductId(p.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><FiTrash2 size={18} /></button>
                    <div className="p-2 text-gray-500">{isExpanded ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}</div>
                  </div>
                </div>

                {/* Expanded Panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Inventory Panel */}
                    <div className="px-4 py-4 bg-gray-50/60 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FiPackage className="text-primary-500" size={16} />
                          <span className="text-sm font-semibold text-gray-700">Inventory</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStockPanel(sp => sp?.productId === p.id ? null : { productId: p.id, warehouseId: defaultWarehouseId, qty: 0 });
                          }}
                          className="text-xs bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                        >
                          <FiPlus size={12} /> Add Stock
                        </button>
                      </div>

                      {p.inventory && p.inventory.length > 0 ? (
                        <div className="space-y-2">
                          {p.inventory.map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-200">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{inv.warehouse?.name || 'Warehouse'}</p>
                                {inv.warehouse?.location && <p className="text-xs text-gray-500">{inv.warehouse.location}</p>}
                              </div>
                              <div className="text-right">
                                <p className={`text-sm font-bold ${inv.quantity <= inv.lowStockThreshold ? 'text-red-600' : 'text-green-700'}`}>{inv.quantity} units</p>
                                <p className="text-xs text-gray-500">threshold: {inv.lowStockThreshold}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No inventory records yet. Click "Add Stock" to create one.</p>
                      )}

                      {stockPanel?.productId === p.id && (
                        <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                          <p className="text-xs font-semibold text-primary-700 mb-2">Add Stock</p>
                          <div className="flex gap-2 flex-wrap">
                            <select value={stockPanel.warehouseId} onChange={e => setStockPanel({ ...stockPanel, warehouseId: e.target.value })} onClick={e => e.stopPropagation()} className="border rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[140px]">
                              <option value="">-- Warehouse --</option>
                              {warehouses?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <input type="number" min={1} placeholder="Quantity" value={stockPanel.qty || ''} onChange={e => setStockPanel({ ...stockPanel, qty: Math.max(1, +e.target.value) })} onClick={e => e.stopPropagation()} className="border rounded-lg px-3 py-1.5 text-sm w-28" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!stockPanel.warehouseId) { toast.error('Select a warehouse'); return; }
                                if (stockPanel.qty < 1) { toast.error('Quantity must be at least 1'); return; }
                                quickStockIn.mutate({ productId: p.id, warehouseId: stockPanel.warehouseId, quantity: stockPanel.qty });
                              }}
                              disabled={quickStockIn.isPending}
                              className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-600 disabled:opacity-50 transition"
                            >
                              {quickStockIn.isPending ? 'Saving...' : 'Confirm'}
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setStockPanel(null); }} className="text-gray-500 hover:text-gray-700 px-2 py-1.5 rounded-lg text-sm transition">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Image Gallery */}
                    {p.images && p.images.length > 0 && (
                      <div className="px-4 pb-4 pt-3">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-gray-700">Product Images ({p.images.length})</p>
                          <button onClick={(e) => { e.stopPropagation(); handleExistingImageUpload(p.id); }} disabled={uploading && imageProductId === p.id} className="text-xs text-primary-500 hover:underline flex items-center gap-1"><FiPlus size={12} /> Add more images</button>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                          {p.images.map((img, idx) => (
                            <div key={img.id} className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-500 group/img aspect-square transition">
                              <img src={img.url} alt={`${p.name} - ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                              <button onClick={(e) => { e.stopPropagation(); setPendingDeleteImageId(img.id); }} className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all shadow-lg z-10"><FiTrash2 size={12} /></button>
                              {idx === 0 && <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow">Main</span>}
                              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">{idx + 1}</span>
                              <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                <a href={img.url} target="_blank" rel="noopener noreferrer" className="bg-white text-gray-800 px-2 py-1 rounded text-[10px] font-medium hover:bg-gray-100 transition" onClick={(e) => e.stopPropagation()}>View Full</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {data?.data && data.data.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm">
              <Pagination page={page} limit={PAGE_SIZE} total={data?.meta?.total || 0} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDeleteProductId}
        title="Delete this product?"
        description="This permanently removes the product and its listings. It cannot be undone."
        confirmLabel="Delete"
        isPending={deleteProduct.isPending}
        onConfirm={() => pendingDeleteProductId && deleteProduct.mutate(pendingDeleteProductId)}
        onCancel={() => setPendingDeleteProductId(null)}
      />

      <ConfirmDialog
        open={!!pendingDeleteImageId}
        title="Delete this image?"
        confirmLabel="Delete"
        isPending={deleteImage.isPending}
        onConfirm={() => pendingDeleteImageId && deleteImage.mutate(pendingDeleteImageId)}
        onCancel={() => setPendingDeleteImageId(null)}
      />
    </div>
  );
}
