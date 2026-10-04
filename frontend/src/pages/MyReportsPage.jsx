import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import {
  FileText,
  Trash2,
  ExternalLink,
  PlusCircle,
  MapPin,
  Calendar,
  Layers,
  Inbox,
  Sparkles,
  Edit2,
  Clock,
  Tag,
  Save,
  X,
  CheckCircle2,
} from 'lucide-react';

const TABS = [
  { key: 'LOST', label: 'Lost' },
  { key: 'FOUND', label: 'Found' },
  { key: 'MATCHED', label: 'Matched' },
  { key: 'RECOVERED', label: 'Recovered' },
  { key: 'CLOSED', label: 'Closed' },
];

const FALLBACK_CATEGORIES = [
  'ID Card',
  'Mobile Phone',
  'Laptop',
  'Wallet',
  'Bag',
  'Keys',
  'Books',
  'Calculator',
  'Documents',
  'Electronics',
  'Jewelry',
  'Clothing',
  'Accessories',
  'Other',
];

const FALLBACK_LOCATIONS = [
  'Main Gate',
  'Library',
  'Canteen',
  'Academic Block',
  'Computer Block',
  'Laboratory',
  'Seminar Hall',
  'Auditorium',
  'Playground',
  'Parking Area',
  'Hostel',
  'Bus Area',
  'Administrative Block',
  'Other Campus Area',
];

const MyReportsPage = () => {
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState('LOST');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Predefined locations & categories
  const [campusLocations, setCampusLocations] = useState(FALLBACK_LOCATIONS);
  const [categoriesList, setCategoriesList] = useState(FALLBACK_CATEGORIES);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Recover modal state
  const [recoverModalItem, setRecoverModalItem] = useState(null);
  const [recovering, setRecovering] = useState(false);

  // Edit modal state
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
    brand: '',
    model: '',
    color: '',
    dateLostOrFound: '',
    approximateTime: '',
    additionalDetails: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Fetch campus metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [locRes, catRes] = await Promise.all([
          API.get('/campus-locations').catch(() => ({ data: [] })),
          API.get('/categories').catch(() => ({ data: [] })),
        ]);
        if (locRes.data && locRes.data.length > 0) setCampusLocations(locRes.data.map((l) => l.name));
        if (catRes.data && catRes.data.length > 0) setCategoriesList(catRes.data.map((c) => c.name));
      } catch (e) {
        console.warn('Metadata fallback');
      }
    };
    fetchMetadata();
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab === 'LOST' || activeTab === 'FOUND') {
        params.append('type', activeTab);
      } else if (activeTab === 'MATCHED' || activeTab === 'RECOVERED' || activeTab === 'CLOSED') {
        params.append('status', activeTab);
      }

      const res = await API.get(`/items/my-reports?${params.toString()}`);
      setItems(res.data.content || []);
    } catch (err) {
      console.error('Error fetching my reports:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Open edit modal
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setEditForm({
      title: item.title || '',
      category: item.category || categoriesList[0],
      location: item.location || campusLocations[0],
      description: item.description || '',
      brand: item.brand || '',
      model: item.model || '',
      color: item.color || '',
      dateLostOrFound: item.dateLostOrFound || '',
      approximateTime: item.approximateTime || '',
      additionalDetails: item.additionalDetails || '',
    });
  };

  // Submit edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setIsSavingEdit(true);
    try {
      const res = await API.put(`/items/${editItem.id}`, {
        ...editForm,
        type: editItem.type,
      });
      success('Report updated successfully.');
      setItems((prev) => prev.map((i) => (i.id === editItem.id ? res.data : i)));
      setEditItem(null);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update report.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await API.delete(`/items/${deleteId}`);
      success('Report deleted successfully.');
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Recover handler
  const handleMarkRecovered = async () => {
    if (!recoverModalItem) return;
    setRecovering(true);
    try {
      await API.put(`/items/${recoverModalItem.id}/recover`);
      success(`"${recoverModalItem.title}" marked as RECOVERED successfully!`);
      setRecoverModalItem(null);
      fetchReports();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to mark item as recovered.');
    } finally {
      setRecovering(false);
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-primary">
                <FileText className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                My Campus Reports
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              View, edit, or remove your submitted lost property and found item reports.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/report-lost"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Report Lost
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2 rounded-xl text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Report Found
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-neutral-200 pb-2 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                activeTab === t.key
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {t.label} Reports
            </button>
          ))}
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-neutral-500 font-semibold">Loading your reports...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 card-shadow">
            <Inbox className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">No {activeTab.toLowerCase()} reports found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              You haven't submitted any {activeTab.toLowerCase()} reports yet.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                to="/report-lost"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark"
              >
                Report Lost Item
              </Link>
              <Link
                to="/report-found"
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200"
              >
                Report Found Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-neutral-200 card-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 bg-neutral-100">
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.type === 'LOST'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-green-600 text-white shadow-sm'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-neutral-800 shadow-sm">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          item.status === 'RECOVERED' || item.status === 'RETURNED'
                            ? 'bg-green-600 text-white'
                            : item.status === 'ACTIVE'
                            ? 'bg-blue-600 text-white'
                            : 'bg-orange-500 text-white'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-sm text-neutral-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-neutral-100 space-y-1 text-[11px] text-neutral-500">
                      <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.dateLostOrFound}</span>
                        {item.approximateTime && <span>• {item.approximateTime}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions: View, Edit, Delete, Recover */}
                <div className="p-4 bg-neutral-50/70 border-t border-neutral-100 flex flex-col gap-2">
                  {item.status !== 'RECOVERED' && item.status !== 'CLOSED' && (
                    <button
                      onClick={() => setRecoverModalItem(item)}
                      className="w-full py-1.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark as Recovered
                    </button>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to={`/items/${item.id}`}
                      className="flex-1 py-1.5 px-2.5 rounded-xl border border-neutral-200 hover:bg-white text-xs font-semibold text-neutral-700 text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </Link>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-xs font-semibold text-primary-dark text-center flex items-center justify-center gap-1 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-primary" /> Edit
                    </button>

                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Report Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-neutral-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                Edit {editItem.type === 'LOST' ? 'Lost' : 'Found'} Report: #{editItem.id}
              </h3>
              <button
                onClick={() => setEditItem(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Campus Location</label>
                  <select
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    {campusLocations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Brand</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Model</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Color</label>
                  <input
                    type="text"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">
                    Date {editItem.type === 'LOST' ? 'Lost' : 'Found'}
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.dateLostOrFound}
                    onChange={(e) => setEditForm({ ...editForm, dateLostOrFound: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs bg-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Approximate Time</label>
                  <input
                    type="text"
                    value={editForm.approximateTime}
                    onChange={(e) => setEditForm({ ...editForm, approximateTime: e.target.value })}
                    placeholder="e.g. 10:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Additional Details</label>
                <input
                  type="text"
                  value={editForm.additionalDetails}
                  onChange={(e) => setEditForm({ ...editForm, additionalDetails: e.target.value })}
                  placeholder="Distinguishing marks, stickers, etc."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Campus Report"
        message="Are you sure you want to delete this report? This will permanently remove the listing from the campus portal."
        confirmText="Delete Report"
        isDanger={true}
        isLoading={isDeleting}
      />

      {/* Recover Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(recoverModalItem)}
        onClose={() => setRecoverModalItem(null)}
        onConfirm={handleMarkRecovered}
        title="Confirm Item Recovery"
        message="Have you successfully recovered this item?"
        confirmText="Confirm Recovery"
        cancelText="Cancel"
        isDanger={false}
        isLoading={recovering}
      />
    </div>
  );
};

export default MyReportsPage;
