import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit3,
  MapPin,
  Calendar,
  Layers,
  Inbox,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'ALL',
  'PENDING_VERIFICATION',
  'VERIFIED',
  'REJECTED',
  'ACTIVE',
  'MATCHED',
  'RECOVERED',
  'CLOSED',
  'REMOVED',
];

const AdminReportsPage = () => {
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campusLocations, setCampusLocations] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters
  const [type, setType] = useState('ALL'); // ALL, LOST, FOUND
  const [status, setStatus] = useState('ALL');
  const [location, setLocation] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Status Update Modal
  const [statusModalItem, setStatusModalItem] = useState(null);
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete / Remove Modal
  const [deleteModalItem, setDeleteModalItem] = useState(null);
  const [removeReason, setRemoveReason] = useState('Violates campus community guidelines');
  const [removing, setRemoving] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load campus locations & categories
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          API.get('/campus-locations'),
          API.get('/categories'),
        ]);
        setCampusLocations(locRes.data || []);
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Error fetching campus metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (type !== 'ALL') params.append('type', type);
      if (status !== 'ALL') params.append('status', status);
      if (location !== 'ALL') params.append('location', location);
      if (category !== 'ALL') params.append('category', category);
      if (debouncedQuery.trim()) params.append('query', debouncedQuery.trim());
      params.append('sort', sort);
      params.append('page', page);
      params.append('size', '10');

      const res = await API.get(`/admin/reports?${params.toString()}`);
      setItems(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
      toastError('Failed to load campus reports.');
    } finally {
      setLoading(false);
    }
  }, [type, status, location, category, debouncedQuery, sort, page, toastError]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Verify action
  const handleVerify = async (itemId) => {
    try {
      await API.put(`/admin/reports/${itemId}/verify`);
      success(`Report #${itemId} verified successfully.`);
      fetchReports();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to verify report.');
    }
  };

  // Status update submit
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusModalItem) return;
    setUpdatingStatus(true);
    try {
      await API.put(`/admin/reports/${statusModalItem.id}/status`, {
        status: newStatus,
        reason: statusReason,
      });
      success(`Report #${statusModalItem.id} status updated to ${newStatus}.`);
      setStatusModalItem(null);
      fetchReports();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Remove report
  const handleRemove = async () => {
    if (!deleteModalItem) return;
    setRemoving(true);
    try {
      await API.delete(`/admin/reports/${deleteModalItem.id}?reason=${encodeURIComponent(removeReason)}`);
      success(`Report #${deleteModalItem.id} removed successfully.`);
      setDeleteModalItem(null);
      fetchReports();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to remove report.');
    } finally {
      setRemoving(false);
    }
  };

  const handleResetFilters = () => {
    setType('ALL');
    setStatus('ALL');
    setLocation('ALL');
    setCategory('ALL');
    setSearchQuery('');
    setSort('newest');
    setPage(0);
  };

  const getStatusBadge = (itemStatus) => {
    switch (itemStatus) {
      case 'ACTIVE':
        return 'bg-blue-100 text-blue-700';
      case 'VERIFIED':
        return 'bg-emerald-100 text-emerald-800';
      case 'PENDING_VERIFICATION':
        return 'bg-amber-100 text-amber-800';
      case 'MATCHED':
        return 'bg-purple-100 text-purple-700';
      case 'RECOVERED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
      case 'REMOVED':
        return 'bg-red-100 text-red-700';
      case 'CLOSED':
        return 'bg-neutral-100 text-neutral-600';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-primary">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Admin Report Management
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Verify campus reports, moderate inappropriate submissions, update item statuses, and ensure community trust.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin"
              className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-50 shadow-sm transition-all"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-200 card-shadow space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reports by title, brand, model, description..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
              />
            </div>

            {/* Type Filter */}
            <div className="flex bg-neutral-100 p-1 rounded-xl">
              {['ALL', 'LOST', 'FOUND'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    setPage(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    type === t
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {t === 'ALL' ? 'All' : t === 'LOST' ? 'Lost' : 'Found'}
                </button>
              ))}
            </div>

            {/* Status Dropdown */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:border-primary"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st === 'ALL' ? 'All Statuses' : st.replace('_', ' ')}
                </option>
              ))}
            </select>

            {/* Campus Location */}
            <select
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Campus Locations</option>
              {campusLocations.map((loc) => (
                <option key={loc.id || loc.name} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>

            {/* Category Dropdown */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(0);
              }}
              className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white focus:outline-none focus:border-primary"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="p-2 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Metadata */}
        <div className="flex justify-between items-center text-xs text-neutral-500 px-1">
          <span>
            Total Reports: <strong className="text-neutral-900">{totalElements}</strong>
          </span>
          <span className="text-[11px] font-medium text-neutral-400">
            Page {page + 1} of {Math.max(1, totalPages)}
          </span>
        </div>

        {/* Reports Table / Card Container */}
        <div className="bg-white rounded-3xl border border-neutral-200 card-shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-neutral-500 font-semibold">Loading campus reports...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-16 text-center">
              <Inbox className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-neutral-800">No reports found</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                No campus reports match your selected filters and search query.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-1.5 rounded-xl bg-orange-100 text-primary font-bold text-xs hover:bg-orange-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 text-neutral-400 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Item & Reporter</th>
                    <th className="p-3.5">Type & Category</th>
                    <th className="p-3.5">Location & Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Item & Reporter */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              item.imageUrl ||
                              'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300'
                            }
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0"
                          />
                          <div>
                            <Link
                              to={`/items/${item.id}`}
                              className="font-bold text-neutral-900 hover:text-primary transition-colors text-xs line-clamp-1"
                            >
                              {item.title}
                            </Link>
                            <span className="text-[11px] text-neutral-400 block mt-0.5">
                              Reported by: <strong className="text-neutral-700">{item.userName || 'Student'}</strong>
                            </span>
                            {item.brand && (
                              <span className="text-[10px] text-neutral-400">
                                {item.brand} {item.model ? `• ${item.model}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type & Category */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              item.type === 'LOST'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {item.type}
                          </span>
                          <span className="text-xs font-semibold text-neutral-700 block">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      {/* Location & Date */}
                      <td className="p-3.5">
                        <div className="space-y-1 text-neutral-600">
                          <div className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{item.dateLostOrFound}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Moderation / Verification */}
                      <td className="p-3.5">
                        {item.moderationStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        ) : item.moderationStatus === 'REMOVED' || item.moderationStatus === 'REJECTED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-red-600" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            Pending Review
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.moderationStatus !== 'VERIFIED' && (
                            <button
                              onClick={() => handleVerify(item.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm flex items-center gap-1"
                              title="Verify this report"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verify
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setStatusModalItem(item);
                              setNewStatus(item.status);
                              setStatusReason('');
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1"
                            title="Update status"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-neutral-500" /> Status
                          </button>

                          <Link
                            to={`/items/${item.id}`}
                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors"
                            title="View public details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => {
                              setDeleteModalItem(item);
                              setRemoveReason('Violates campus guidelines or false report');
                            }}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                            title="Remove report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-neutral-500">
                Page {page + 1} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {statusModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              Update Report Status: #{statusModalItem.id}
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Updating item: <strong className="text-neutral-800">{statusModalItem.title}</strong>
            </p>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Select New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-semibold focus:outline-none focus:border-primary"
                >
                  <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="MATCHED">MATCHED</option>
                  <option value="RECOVERED">RECOVERED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="REMOVED">REMOVED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">
                  Administrative Note / Reason (Optional)
                </label>
                <textarea
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="e.g. Verified by campus security at Library desk..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalItem(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm"
                >
                  {updatingStatus ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-2.5 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-neutral-900">Remove Inappropriate Report</h3>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Are you sure you want to remove report <strong>"{deleteModalItem.title}"</strong> (ID #{deleteModalItem.id})? This will archive the listing and notify the student.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1">
                Reason for Removal
              </label>
              <input
                type="text"
                value={removeReason}
                onChange={(e) => setRemoveReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-red-500"
                placeholder="Specify violation..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={removing}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm"
              >
                {removing ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
