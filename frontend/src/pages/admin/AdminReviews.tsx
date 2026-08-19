import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import toast from 'react-hot-toast';
import {
  FiStar,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiMessageSquare,
  FiClock,
  FiPackage,
  FiCheck,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 10;

interface Review {
  id: string;
  rating: number;
  title: string;
  body: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  product: {
    name: string;
    slug: string;
  };
}

interface ReviewsResponse {
  data: Review[];
  meta: { page: number; limit: number; total: number };
  stats: { total: number; pending: number; approved: number; averageRating: number };
}

export default function AdminReviews() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Debounce the search box so every keystroke doesn't fire its own request.
  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  // Fetch reviews for admin
  const { data: reviewsData, isLoading } = useQuery<ReviewsResponse>({
    queryKey: ['admin-reviews', debouncedSearch, statusFilter, ratingFilter, page],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (ratingFilter !== 'all') params.set('rating', String(ratingFilter));
      return api.get(`/admin/reviews?${params.toString()}`).then((r) => r.data);
    },
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/reviews/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review approved successfully!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Reject / Unapprove review mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/admin/reviews/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review status set to Pending');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast.success('Review deleted permanently');
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  // Summary metrics reflect the whole table (from the backend), not just the current
  // page or filter — the KPI cards describe overall review health.
  const totalReviews = reviewsData?.stats?.total || 0;
  const pendingCount = reviewsData?.stats?.pending || 0;
  const approvedCount = reviewsData?.stats?.approved || 0;
  const averageRating = (reviewsData?.stats?.averageRating || 0).toFixed(1);

  const filteredReviews = reviewsData?.data || [];
  const total = reviewsData?.meta?.total || 0;

  return (
    <div className="w-full space-y-6 pb-12">
      <PageHeader
        icon={FiMessageSquare}
        title="Customer Reviews & Moderation"
        subtitle="Review, approve, or reject customer feedback for products in your store."
        action={
          <div className="relative w-full md:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Search reviews, customers, products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-500 focus:bg-white transition"
            />
          </div>
        }
      />

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Reviews</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-1">{totalReviews}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center">
            <FiMessageSquare size={22} />
          </div>
        </div>

        {/* Pending Moderation */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pending Approval</p>
            <h2 className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FiClock size={22} />
          </div>
        </div>

        {/* Approved Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Approved Reviews</p>
            <h2 className="text-3xl font-bold text-emerald-600 mt-1">{approvedCount}</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FiCheckCircle size={22} />
          </div>
        </div>

        {/* Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Average Rating</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-bold text-gray-900">{averageRating}</h2>
              <span className="text-xs text-gray-500">/ 5.0</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
            <FiStar size={22} className="fill-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setStatusFilter('all'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Reviews ({totalReviews})
          </button>
          <button
            onClick={() => { setStatusFilter('pending'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <FiClock size={13} />
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => { setStatusFilter('approved'); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
              statusFilter === 'approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <FiCheckCircle size={13} />
            Approved ({approvedCount})
          </button>
        </div>

        {/* Rating Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <FiFilter size={14} className="text-gray-500" />
          <span className="text-xs text-gray-500 font-medium">Filter by Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); setPage(1); }}
            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars ★★★★★</option>
            <option value="4">4 Stars ★★★★☆</option>
            <option value="3">3 Stars ★★★☆☆</option>
            <option value="2">2 Stars ★★☆☆☆</option>
            <option value="1">1 Star ★☆☆☆☆</option>
          </select>
        </div>
      </div>

      {/* Reviews List Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-12 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <FiMessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-base font-bold text-gray-800">No reviews found</h3>
          <p className="text-gray-500 text-xs mt-1">
            {search || statusFilter !== 'all' || ratingFilter !== 'all'
              ? 'Try adjusting your search query or filter criteria.'
              : 'Customer reviews will appear here once submitted.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isPending = !review.isApproved;

            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl p-6 border transition shadow-sm hover:shadow-md ${
                  isPending ? 'border-amber-200 bg-amber-50/20' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Section: User + Review details */}
                  <div className="flex-1 space-y-3">
                    {/* User & Product Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar Initials */}
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                          {review.user?.firstName?.[0] || 'U'}
                          {review.user?.lastName?.[0] || ''}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            {review.user?.firstName} {review.user?.lastName}
                          </h4>
                          <p className="text-xs text-gray-500">{review.user?.email}</p>
                        </div>
                      </div>

                      {/* Product Tag */}
                      {review.product && (
                        <Link
                          to={`/products/${review.product.slug}`}
                          className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1 rounded-xl text-xs font-semibold text-gray-700 transition"
                        >
                          <FiPackage size={13} className="text-primary-500" />
                          <span className="truncate max-w-[200px]">{review.product.name}</span>
                        </Link>
                      )}
                    </div>

                    {/* Rating & Date Row */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            size={16}
                            className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-gray-900">{review.rating}.0</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      {/* Approval Status Badge */}
                      {review.isApproved ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ml-auto">
                          <FiCheck size={12} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ml-auto animate-pulse">
                          <FiClock size={12} /> Pending Moderation
                        </span>
                      )}
                    </div>

                    {/* Review Title & Body */}
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-1">{review.title}</h3>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{review.body}</p>
                    </div>
                  </div>

                  {/* Right Section: Action Buttons */}
                  <div className="flex lg:flex-col items-center gap-2 pt-3 lg:pt-0 lg:pl-4 border-t lg:border-t-0 lg:border-l border-gray-100 flex-shrink-0">
                    {/* Approve Button */}
                    {!review.isApproved && (
                      <button
                        onClick={() => approveMutation.mutate(review.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1 lg:w-32 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FiCheckCircle size={14} />
                        Approve
                      </button>
                    )}

                    {/* Reject / Reset to Pending Button */}
                    {review.isApproved && (
                      <button
                        onClick={() => rejectMutation.mutate(review.id)}
                        disabled={rejectMutation.isPending}
                        className="flex-1 lg:w-32 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <FiXCircle size={14} />
                        Unapprove
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeletingId(review.id)}
                      className="flex-1 lg:w-32 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Pagination page={page} limit={PAGE_SIZE} total={total} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete Product Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        isPending={deleteMutation.isPending}
        onConfirm={() => deletingId && deleteMutation.mutate(deletingId)}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}