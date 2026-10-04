import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ClaimTimeline from '../components/ClaimTimeline';
import ConfirmModal from '../components/ConfirmModal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Lock,
  Send,
  User,
  Inbox,
  ArrowRight,
  Handshake,
} from 'lucide-react';

const ClaimsPage = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review state
  const [activeClaimId, setActiveClaimId] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Return confirm state
  const [confirmingReturnId, setConfirmingReturnId] = useState(null);
  const [confirmRole, setConfirmRole] = useState(''); // HANDOVER or RECEIPT
  const [submittingConfirm, setSubmittingConfirm] = useState(false);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/claims');
      setClaims(res.data || []);
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleReview = async (claimId, action) => {
    setActiveClaimId(claimId);
    setReviewAction(action);
  };

  const submitReviewAction = async () => {
    if (!activeClaimId || !reviewAction) return;

    setSubmittingReview(true);
    try {
      const res = await API.post(`/claims/${activeClaimId}/review`, {
        action: reviewAction,
        notes: reviewNotes,
      });
      success(`Claim updated to: ${res.data.status}`);
      setClaims((prev) =>
        prev.map((c) => (c.id === activeClaimId ? res.data : c))
      );
      setActiveClaimId(null);
      setReviewNotes('');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to review claim.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleConfirmReturn = async (claimId, type) => {
    setConfirmingReturnId(claimId);
    setConfirmRole(type);
  };

  const submitReturnConfirmation = async () => {
    if (!confirmingReturnId || !confirmRole) return;

    setSubmittingConfirm(true);
    try {
      const res = await API.post(`/claims/${confirmingReturnId}/confirm-return`, {
        confirmationType: confirmRole,
        notes: 'Confirmed by user via portal',
      });
      success(
        res.data.status === 'RETURNED'
          ? 'Item marked as RETURNED! Both parties have confirmed recovery.'
          : 'Your confirmation has been recorded. Waiting for other party.'
      );
      fetchClaims();
      setConfirmingReturnId(null);
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to confirm return.');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-primary-dark text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Verification & Handover Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Claims Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Review ownership verification questions, approve genuine claims, and confirm safe return.
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-64 bg-white rounded-3xl animate-pulse border border-neutral-200"
              ></div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 card-shadow">
            <Inbox className="w-14 h-14 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-800">No active claims found</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Claims submitted on your found listings or claims you filed for lost items will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {claims.map((claim) => {
              const isClaimant = user && claim.claimant.id === user.id;
              const isFinder = user && claim.item.userId === user.id;
              const isAdmin = user && user.role === 'ADMIN';

              let parsedAnswers = null;
              if (claim.verificationAnswers) {
                try {
                  parsedAnswers = JSON.parse(claim.verificationAnswers);
                } catch (e) {
                  parsedAnswers = { 'Verification details': claim.verificationAnswers };
                }
              }

              return (
                <div
                  key={claim.id}
                  className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 card-shadow space-y-6"
                >
                  {/* Top Bar: Item summary and Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-100">
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          claim.item.imageUrl ||
                          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300'
                        }
                        alt={claim.item.title}
                        className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 uppercase">
                          Claim #{claim.id} • {claim.item.category}
                        </span>
                        <h2 className="text-lg font-bold text-neutral-900 mt-1">
                          {claim.item.title}
                        </h2>
                        <p className="text-xs text-neutral-500">
                          Claimant:{' '}
                          <strong className="text-neutral-800">{claim.claimant.name}</strong> •
                          Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                          claim.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : claim.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : claim.status === 'RETURNED'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        Status: {claim.status}
                      </span>
                    </div>
                  </div>

                  {/* Visual Workflow Timeline */}
                  <div className="bg-neutral-50/70 p-4 sm:p-6 rounded-2xl border border-neutral-100">
                    <ClaimTimeline
                      status={claim.status}
                      finderConfirmed={claim.finderConfirmedHandover}
                      ownerConfirmed={claim.ownerConfirmedReceipt}
                    />
                  </div>

                  {/* Verification Answers Section (Private details) */}
                  {parsedAnswers && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/50 border border-orange-200/60 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
                        <Lock className="w-4 h-4 text-primary" />
                        Ownership Verification Details (Confidential)
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {Object.entries(parsedAnswers).map(([question, answer]) => (
                          <div
                            key={question}
                            className="p-3 rounded-xl bg-white border border-orange-100 space-y-1"
                          >
                            <span className="font-semibold text-neutral-500 block">
                              {question}:
                            </span>
                            <span className="text-neutral-900 font-medium whitespace-pre-wrap">
                              {answer || 'Not specified'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {claim.additionalNotes && (
                    <div className="text-xs text-neutral-600 bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                      <strong>Claimant Note:</strong> {claim.additionalNotes}
                    </div>
                  )}

                  {claim.adminNotes && (
                    <div className="text-xs text-neutral-700 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                      <strong>Reviewer Feedback:</strong> {claim.adminNotes}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
                    {/* Review Actions (Finder or Admin can review pending claims) */}
                    {(isFinder || isAdmin) &&
                      (claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW') && (
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-bold text-neutral-600 mr-1">
                            Finder Decision:
                          </span>
                          <button
                            onClick={() => handleReview(claim.id, 'APPROVE')}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve Ownership
                          </button>
                          <button
                            onClick={() => handleReview(claim.id, 'REQUEST_INFO')}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-100 text-primary-dark hover:bg-orange-200 transition-all flex items-center gap-1.5"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            Request More Info
                          </button>
                          <button
                            onClick={() => handleReview(claim.id, 'REJECT')}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-700 hover:bg-red-200 transition-all flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject Claim
                          </button>
                        </div>
                      )}

                    {/* Return Confirmation Flow: When claim is APPROVED */}
                    {claim.status === 'APPROVED' && (
                      <div className="flex flex-wrap items-center gap-3">
                        {isFinder && !claim.finderConfirmedHandover && (
                          <button
                            onClick={() => handleConfirmReturn(claim.id, 'HANDOVER')}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
                          >
                            <Handshake className="w-4 h-4" />
                            Confirm "Item Handed Over"
                          </button>
                        )}

                        {isClaimant && !claim.ownerConfirmedReceipt && (
                          <button
                            onClick={() => handleConfirmReturn(claim.id, 'RECEIPT')}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-600/20 transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm "Item Received"
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => handleConfirmReturn(claim.id, 'ADMIN_FORCE')}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-all flex items-center gap-1.5"
                          >
                            Admin Override: Mark Returned
                          </button>
                        )}
                      </div>
                    )}

                    {claim.status === 'RETURNED' && (
                      <div className="text-xs font-semibold text-green-700 flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                        Item recovery successfully confirmed by both parties.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {activeClaimId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              Confirm Decision: {reviewAction}
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Add any instructions or reasoning for the claimant.
            </p>

            <textarea
              rows="3"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Approved: Meet me at library desk at 3pm, or please provide wallpaper photo..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none mb-4"
            ></textarea>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveClaimId(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReviewAction}
                disabled={submittingReview}
                className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl"
              >
                {submittingReview ? 'Updating...' : 'Submit Decision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmingReturnId}
        onClose={() => setConfirmingReturnId(null)}
        onConfirm={submitReturnConfirmation}
        title="Confirm Item Handover / Receipt"
        message={
          confirmRole === 'HANDOVER'
            ? 'Are you confirming you have handed over the item to the rightful owner?'
            : 'Are you confirming you have received your lost item in acceptable condition?'
        }
        confirmText="Yes, Confirm Recovery"
        isDanger={false}
        isLoading={submittingConfirm}
      />
    </div>
  );
};

export default ClaimsPage;
