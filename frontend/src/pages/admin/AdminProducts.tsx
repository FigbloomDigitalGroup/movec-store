import { useState, useRef, useCallback } from 'react';
import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import type { Product } from '../../types';
import { FiEdit, FiTrash2, FiPlus, FiImage, FiUpload, FiX, FiStar, FiSearch, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Mini image carousel for the product list rows
function ImageCarousel({ images, onDelete }: { images: Product['images']; onDelete: (id: string) => void }) {
  const [idx, setIdx] = useState(0);
  if (!images || images.length === 0) return null;

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i + 1) % images.length);
  };

  return (
    <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200 group/carousel">
      <img
        src={images[idx].url}
        alt={`image ${idx + 1}`}
        className="w-full h-full object-cover"
      />

      {/* Delete button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(images[idx].id); }}
        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 hidden group-hover/carousel:flex items-center justify-center z-10"
      >
        <FiX size={10} />
      </button>

      {/* Main badge */}
      {idx === 0 && (
        <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1 rounded font-medium">
          Main
        </span>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {idx + 1}/{images.length}
        </span>
      )}

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-0.5 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 rounded-full p-0.5 shadow opacity-0 group-hover/carousel:opacity-100 transition z-10"
          >
            <FiChevronLeft size={12} />
          </button>
          <button
            onClick={next}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 rounded-full p-0.5 shadow opacity-0 group-hover/carousel:opacity-100 transition z-10"
          >
            <FiChevronRight size={12} />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover/carousel:opacity-100 transition">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-3' : 'bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', price: 0, sku: '', brandId: '', categoryIds: [] as string[], isFeatured: false });
  const [imageProductId, setImageProductId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', sortBy, sortOrder, filterCategory, filterBrand, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      params.set('sortBy', sortBy);
      params.set('order', sortOrder);
      if (filterCategory) params.set('category', filterCategory);
      if (filterBrand) params.set('brand', filterBrand);
      if (searchTerm) params.set('search', searchTerm);
      return api.get(`/admin/products?${params.toString()}`).then(r => r.data);
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('/brands').then(r => r.data),
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const saveProduct = useMutation({
    mutationFn: async (body: any) => {
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
        await api.post(`/admin/products/${productId}/images`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', slug: '', description: '', price: 0, sku: '', brandId: '', categoryIds: [], isFeatured: false });
      setSelectedFiles([]);
      setPreviews([]);
      setUploading(false);
    },
  });

  const uploadImages = useMutation({
    mutationFn: async ({ productId, files }: { productId: string; files: File[] }) => {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      await api.post(`/admin/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setUploading(false);
      setImageProductId(null);
      setSelectedFiles([]);
      setPreviews([]);
    },
  });

  const deleteImage = useMutation({
    mutationFn: (imageId: string) => api.delete(`/admin/products/images/${imageId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const toggleFeatured = useMutation({
    mutationFn: ({ id, isFeatured }: { id: string; isFeatured: boolean }) =>
      api.patch(`/admin/products/${id}`, { isFeatured: !isFeatured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      sku: p.sku,
      brandId: p.brand?.id || '',
      categoryIds: p.categories?.map(c => c.id) || [],
      isFeatured: p.isFeatured || false,
    });
    setSelectedFiles([]);
    setPreviews([]);
    setShowForm(true);
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
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
      if (imageProductId) {
        setUploading(true);
        uploadImages.mutate({ productId: imageProductId, files: Array.from(e.target.files) });
      } else {
        handleFiles(e.target.files);
      }
    }
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Date Added' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'sku', label: 'SKU' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', price: 0, sku: '', brandId: '', categoryIds: [], isFeatured: false }); setSelectedFiles([]); setPreviews([]); setShowForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Filters & Sort Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="border rounded-lg px-4 py-2">
            <option value="">All Categories</option>
            {categories?.map((c: any) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </select>

          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="border rounded-lg px-4 py-2">
            <option value="">All Brands</option>
            {brands?.data?.map((b: any) => <option key={b.id} value={b.slug}>{b.name}</option>)}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-lg px-4 py-2">
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>)}
          </select>

          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-100 transition"
            title={`Current: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>

          <button
            onClick={() => { setFilterCategory(''); setFilterBrand(''); setSearchTerm(''); setSortBy('createdAt'); setSortOrder('desc'); }}
            className="text-sm text-blue-600 hover:underline"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Edit' : 'New'} Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded-lg px-4 py-2" />
            <input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="border rounded-lg px-4 py-2" />
            <input placeholder="SKU (leave blank for auto)" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="border rounded-lg px-4 py-2" />
            <input type="number" placeholder="Price (KES)" value={form.price || ''} onChange={e => setForm({ ...form, price: +e.target.value })} className="border rounded-lg px-4 py-2" />
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded-lg px-4 py-2 md:col-span-2" rows={3} />
            <select value={form.brandId} onChange={e => setForm({ ...form, brandId: e.target.value })} className="border rounded-lg px-4 py-2">
              <option value="">Select Brand</option>
              {brands?.data?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <select multiple value={form.categoryIds} onChange={e => setForm({ ...form, categoryIds: Array.from(e.target.selectedOptions, o => o.value) })} className="border rounded-lg px-4 py-2 h-32">
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="w-5 h-5 rounded" />
              <span className="text-sm font-medium">Featured Product</span>
            </label>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium mb-2">
              Product Images
              {previews.length > 0 && (
                <span className="ml-2 text-xs text-gray-400 font-normal">{previews.length} image{previews.length > 1 ? 's' : ''} selected</span>
              )}
              {editing && editing.images && editing.images.length > 0 && (
                <span className="ml-2 text-xs text-blue-500 font-normal">{editing.images.length} already uploaded</span>
              )}
            </p>

            {/* Already uploaded images (when editing) */}
            {editing && editing.images && editing.images.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Uploaded images:</p>
                <div className="flex gap-2 flex-wrap">
                  {editing.images.map((img, i) => (
                    <div key={img.id} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 group/img">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.preventDefault(); deleteImage.mutate(img.id); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 hidden group-hover/img:flex items-center justify-center"
                      >
                        <FiX size={10} />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1 rounded font-medium">Main</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            >
              <FiUpload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-500 mb-2">Drag & drop images here</p>
              <button type="button" onClick={() => { setImageProductId(null); fileInputRef.current?.click(); }} className="text-blue-600 text-sm font-medium hover:underline">
                or click to browse
              </button>
            </div>

            {/* New image previews */}
            {previews.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">New images to upload ({previews.length}):</p>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border-2 border-blue-200 group/preview aspect-square">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePreview(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        <FiX size={10} />
                      </button>
                      {i === 0 && <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1 rounded font-medium">Main</span>}
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">{i + 1}</span>
                    </div>
                  ))}
                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={() => { setImageProductId(null); fileInputRef.current?.click(); }}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center gap-1 transition"
                  >
                    <FiPlus size={18} className="text-gray-400" />
                    <span className="text-[10px] text-gray-400">Add</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => { setUploading(true); saveProduct.mutate(form); }} disabled={uploading} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {uploading ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </button>
            <button onClick={() => { setShowForm(false); setSelectedFiles([]); setPreviews([]); }} className="border px-6 py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileInputChange} />

      {/* Product List */}
      {isLoading ? <p className="text-center py-8">Loading...</p> : (
        <div className="space-y-3">
          {data?.data?.length === 0 && (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl">
              <FiFilter className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No products found matching your filters.</p>
            </div>
          )}
          {data?.data?.map((p: Product) => (
            <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow p-4 flex items-center gap-4 hover:shadow-md transition">
              <div className="flex items-center gap-2 flex-shrink-0">
                <ImageCarousel images={p.images} onDelete={(id) => deleteImage.mutate(id)} />
                <button
                  onClick={() => handleExistingImageUpload(p.id)}
                  disabled={uploading && imageProductId === p.id}
                  title="Add images"
                  className="w-10 h-10 bg-gray-100 hover:bg-blue-50 hover:border-blue-400 border border-dashed border-gray-300 rounded-xl flex items-center justify-center transition flex-shrink-0"
                >
                  {uploading && imageProductId === p.id
                    ? <span className="animate-spin text-blue-500 text-sm">⟳</span>
                    : <FiImage className="text-gray-400" size={16} />}
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  {p.isFeatured && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Featured</span>}
                  {!p.isActive && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Inactive</span>}
                </div>
                <p className="text-sm text-gray-500">{p.sku} · {p.brand?.name || 'No brand'} · KES {p.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleFeatured.mutate({ id: p.id, isFeatured: p.isFeatured || false })} title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'} className={`p-2 rounded-lg transition ${p.isFeatured ? 'text-yellow-600 bg-yellow-100' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}>
                  <FiStar size={18} fill={p.isFeatured ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><FiEdit size={18} /></button>
                <button onClick={() => deleteProduct.mutate(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><FiTrash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}