import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import type { Product } from '../../types';
import { FiEdit, FiTrash2, FiPlus, FiImage, FiUpload, FiX, FiStar, FiSearch, FiFilter } from 'react-icons/fi';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', sortBy, sortOrder, filterCategory, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('limit', '100');
      params.set('sortBy', sortBy);
      params.set('order', sortOrder);
      if (filterCategory) params.set('category', filterCategory);
      if (searchTerm) params.set('search', searchTerm);
      return api.get(`/admin/products?${params.toString()}`).then(r => r.data);
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
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
      alert('Product saved successfully!');
    },
    onError: (error: any) => {
      setUploading(false);
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to save product';
      alert(`Error: ${Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage}`);
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
            onClick={() => { setFilterCategory(''); setSearchTerm(''); setSortBy('createdAt'); setSortOrder('desc'); }}
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
            <select multiple value={form.categoryIds} onChange={e => setForm({ ...form, categoryIds: Array.from(e.target.selectedOptions, o => o.value) })} className="border rounded-lg px-4 py-2 h-32 md:col-span-2">
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
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500">Uploaded images ({editing.images.length}):</p>
                  <button
                    type="button"
                    onClick={() => handleExistingImageUpload(editing.id)}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FiPlus size={12} />
                    Add more images
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {editing.images.map((img, i) => (
                    <div key={img.id} className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 group/img aspect-square transition">
                      <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                      
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (confirm('Delete this image?')) {
                            deleteImage.mutate(img.id); 
                          }
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all shadow-lg"
                        title="Delete image"
                      >
                        <FiTrash2 size={12} />
                      </button>
                      
                      {/* Main badge */}
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow">
                          Main
                        </span>
                      )}
                      
                      {/* Image number */}
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {i + 1}
                      </span>
                      
                      {/* Hover overlay with view option */}
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-gray-800 px-2 py-1 rounded text-[10px] font-medium hover:bg-gray-100 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Full
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">💡 Tip: The first image is the main product image. Delete or reorder to change it.</p>
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
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-blue-900">
                    New images to upload ({previews.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSelectedFiles([]); setPreviews([]); }}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1"
                  >
                    <FiX size={12} />
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border-2 border-blue-300 group/preview aspect-square hover:border-blue-500 transition">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      
                      {/* Delete preview button */}
                      <button
                        type="button"
                        onClick={() => removePreview(i)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-all shadow-lg"
                        title="Remove this image"
                      >
                        <FiX size={12} />
                      </button>
                      
                      {/* Main badge for first image */}
                      {i === 0 && !editing?.images?.length && (
                        <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow">
                          Main
                        </span>
                      )}
                      
                      {/* Image number */}
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium shadow">
                        New {i + 1}
                      </span>
                    </div>
                  ))}
                  
                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={() => { setImageProductId(null); fileInputRef.current?.click(); }}
                    className="aspect-square rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-100 flex flex-col items-center justify-center gap-1 transition"
                    title="Add more images"
                  >
                    <FiPlus size={20} className="text-blue-400" />
                    <span className="text-[10px] text-blue-500 font-medium">Add</span>
                  </button>
                </div>
                {!editing?.images?.length && (
                  <p className="text-xs text-blue-700 mt-2">💡 The first image will be the main product image.</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button 
              onClick={() => {
                // Client-side validation
                if (!form.name.trim()) {
                  alert('Product name is required');
                  return;
                }
                if (!form.slug.trim()) {
                  alert('Product slug is required');
                  return;
                }
                if (!form.description.trim()) {
                  alert('Product description is required');
                  return;
                }
                if (form.price <= 0) {
                  alert('Product price must be greater than 0');
                  return;
                }
                
                setUploading(true); 
                saveProduct.mutate(form); 
              }} 
              disabled={uploading} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
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
            <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow hover:shadow-md transition">
              {/* Product Row */}
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedProduct(expandedProduct === p.id ? null : p.id)}
              >
                {/* Main Image Only */}
                <div className="flex-shrink-0">
                  {!p.images || p.images.length === 0 ? (
                    <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                      <FiImage className="text-gray-400" size={24} />
                    </div>
                  ) : (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={p.images[0].url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {p.images.length > 1 && (
                        <span className="absolute bottom-1 right-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                          +{p.images.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    {p.isFeatured && <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Featured</span>}
                    {!p.isActive && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full flex-shrink-0">Inactive</span>}
                  </div>
                  <p className="text-sm text-gray-500">{p.sku} · KES {p.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleFeatured.mutate({ id: p.id, isFeatured: p.isFeatured || false }); 
                    }} 
                    title={p.isFeatured ? 'Remove from featured' : 'Mark as featured'} 
                    className={`p-2 rounded-lg transition ${p.isFeatured ? 'text-yellow-600 bg-yellow-100' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}
                  >
                    <FiStar size={18} fill={p.isFeatured ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      openEdit(p); 
                    }} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <FiEdit size={18} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (confirm('Delete this product?')) {
                        deleteProduct.mutate(p.id); 
                      }
                    }} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Expanded Image Gallery */}
              {expandedProduct === p.id && p.images && p.images.length > 0 && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        Product Images ({p.images.length})
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExistingImageUpload(p.id);
                        }}
                        disabled={uploading && imageProductId === p.id}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FiPlus size={12} />
                        Add more images
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {p.images.map((img, idx) => (
                        <div key={img.id} className="relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 group/img aspect-square transition">
                          <img 
                            src={img.url} 
                            alt={`${p.name} - ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                            loading="lazy" 
                          />
                          
                          {/* Delete button */}
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (confirm('Delete this image?')) {
                                deleteImage.mutate(img.id); 
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all shadow-lg z-10"
                            title="Delete image"
                          >
                            <FiTrash2 size={12} />
                          </button>
                          
                          {/* Main badge */}
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold shadow">
                              Main
                            </span>
                          )}
                          
                          {/* Image number */}
                          <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                            {idx + 1}
                          </span>
                          
                          {/* View overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                            <a
                              href={img.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white text-gray-800 px-2 py-1 rounded text-[10px] font-medium hover:bg-gray-100 transition"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Full
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}