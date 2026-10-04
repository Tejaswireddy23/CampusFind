import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ClaimModal from '../components/ClaimModal';
import ReportModal from '../components/ReportModal';
import ConfirmModal from '../components/ConfirmModal';
import RecoveryWorkflow from '../components/RecoveryWorkflow';
import {
  MapPin,
  Calendar,
  Clock,
  Tag,
  ShieldCheck,
  MessageSquare,
  Flag,
  Share2,
  Trash2,
  Edit,
  ArrowLeft,
  Lock,
  Gift,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [recoverModalOpen, setRecoverModalOpen] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await API.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        toastError('Unable to load item details.');
        navigate('/browse');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await API.delete(`/items/${id}`);
      success('Item deleted successfully.');
      navigate('/my-reports');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to delete item.');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleMarkRecovered = async () => {
    setRecovering(true);
    try {
      const res = await API.put(`/items/${id}/recover`);
      setItem(res.data);
      success('Item marked as RECOVERED! Congratulations on recovering your campus belonging.');
      setRecoverModalOpen(false);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update item status.');
    } finally {
      setRecovering(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) return null;

  const isOwner = user && item.userId === user.id;

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-xs font-semibold text-neutral-500 hover:text-neutral-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Image & Quick Meta */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden card-shadow">
              <div className="relative h-80 sm:h-96 bg-neutral-100">
                <img
                  src={
                    item.imageUrl ||
                    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'
                  }
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      item.type === 'LOST'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-green-600 text-white shadow-md'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm text-neutral-800 shadow-md">
                    {item.category}
                  </span>
                </div>

                {item.reward > 0 && (
                  <div className="absolute bottom-4 right-4 bg-yellow-400 text-neutral-900 text-sm font-bold px-3 py-1 rounded-xl shadow-md">
                    ${item.reward} Reward Offered
                  </div>
                )}
              </div>

              {/* Quick specs grid */}
              <div className="p-6 grid grid-cols-2 gap-4 border-t border-neutral-100 bg-neutral-50/50 text-xs">
                <div>
                  <span className="text-neutral-400 block font-medium">Brand</span>
                  <span className="font-semibold text-neutral-800 text-sm">
                    {item.brand || 'Unspecified'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Model</span>
                  <span className="font-semibold text-neutral-800 text-sm">
                    {item.model || 'Standard'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Color</span>
                  <span className="font-semibold text-neutral-800 text-sm">
                    {item.color || 'Unspecified'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block font-medium">Status</span>
                  <span
                    className={`inline-block font-bold text-xs uppercase px-2 py-0.5 rounded-md ${
                      item.status === 'RETURNED'
                        ? 'bg-green-100 text-green-700'
                        : item.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 card-shadow space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {item.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    {item.dateLostOrFound}
                  </span>
                  {item.approximateTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {item.approximateTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    {item.location}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-neutral-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Description
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {item.additionalDetails && (
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-600">
                  <strong className="block text-neutral-800 font-semibold mb-1">
                    Additional Context:
                  </strong>
                  {item.additionalDetails}
                </div>
              )}

              {/* Safe Reporter Details (No private email/phone exposed) */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      item.userAvatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${item.userName || 'Finder'}`
                    }
                    alt={item.userName}
                    className="w-10 h-10 rounded-full object-cover border border-neutral-200"
                  />
                  <div>
                    <span className="text-xs text-neutral-400 block font-medium">Reported by</span>
                    <span className="text-sm font-bold text-neutral-900">{item.userName}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                  title="Share Listing"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Privacy Reassurance Banner */}
              <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-start gap-2.5 text-xs text-orange-950">
                <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p>
                  <strong>Campus Privacy Protection:</strong> Student phone numbers and college emails are never displayed publicly. Click <strong>Contact Person</strong> below to message securely through CampusFind.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                {/* Non-owner actions */}
                {!isOwner ? (
                  <div className="space-y-2.5">
                    {/* Prominent [Contact Person] Button */}
                    <Link
                      to={isAuthenticated ? `/messages?with=${item.userId}&item=${item.id}` : '/login'}
                      className="w-full py-3 px-4 rounded-xl font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Contact Person
                    </Link>

                    {item.status === 'ACTIVE' && (
                      <button
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate('/login');
                          } else {
                            setClaimModalOpen(true);
                          }
                        }}
                        className="w-full py-2.5 px-4 rounded-xl font-bold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 text-xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Claim This Item (Verify Ownership)
                      </button>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          if (!isAuthenticated) navigate('/login');
                          else setReportModalOpen(true);
                        }}
                        className="text-neutral-400 hover:text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" /> Report inappropriate listing
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Owner Actions */
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-neutral-500">You reported this item</p>

                    {item.status !== 'RECOVERED' && item.status !== 'CLOSED' && (
                      <button
                        onClick={() => setRecoverModalOpen(true)}
                        className="w-full py-3 px-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-md shadow-green-600/20 flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Mark as Recovered
                      </button>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeleteModalOpen(true)}
                        className="w-full py-2.5 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Report
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin quick actions */}
                {isAdmin && !isOwner && (
                  <div className="pt-2 border-t border-neutral-100 flex gap-2">
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" /> Admin Remove Report
                    </button>
                    <Link
                      to="/admin/reports"
                      className="px-3 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center justify-center"
                    >
                      Admin Reports
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Campus Recovery Workflow */}
        <div className="mt-8">
          <RecoveryWorkflow currentStatus={item.status} />
        </div>
      </div>

      {/* Modals */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        item={item}
        onClaimSuccess={() => {
          setItem((prev) => ({ ...prev, status: 'CLAIM_PENDING' }));
        }}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUserId={item.userId}
        itemId={item.id}
        itemTitle={item.title}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
        isLoading={deleting}
      />

      <ConfirmModal
        isOpen={recoverModalOpen}
        onClose={() => setRecoverModalOpen(false)}
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

export default ItemDetailsPage;
