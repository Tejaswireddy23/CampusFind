import React, { useState } from 'react';
import { ShieldCheck, Lock, X, Check } from 'lucide-react';
import API from '../services/api';
import { useToast } from '../context/ToastContext';

const ClaimModal = ({ isOpen, onClose, item, matchId, onClaimSuccess }) => {
  const { success, error: toastError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [q1, setQ1] = useState(''); // Unique feature not visible
  const [q2, setQ2] = useState(''); // Contents / inside details
  const [q3, setQ3] = useState(''); // Case / exterior design
  const [q4, setQ4] = useState(''); // Approx purchase date / identifier
  const [additionalNotes, setAdditionalNotes] = useState('');

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!q1.trim() && !q2.trim() && !q3.trim()) {
      toastError('Please answer at least one verification question so the finder can verify ownership.');
      return;
    }

    setSubmitting(true);
    try {
      const answersMap = {
        'Unique feature not visible in listing': q1,
        'Contents or inside items': q2,
        'Case design or wallpaper': q3,
        'Approximate purchase date or identifier': q4,
      };

      const res = await API.post('/claims', {
        itemId: item.id,
        matchId: matchId || null,
        verificationAnswers: answersMap,
        additionalNotes: additionalNotes,
      });

      success('Claim submitted successfully! Status: PENDING review.');
      if (onClaimSuccess) onClaimSuccess(res.data);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to submit claim. Please try again.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-100 transform transition-all animate-scale-up">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-primary flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">Claim This Item</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Verifying ownership for: <span className="font-semibold text-neutral-700">{item.title}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 p-1.5 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="my-4 p-3.5 rounded-xl bg-orange-50 border border-orange-200/60 flex items-start gap-3 text-xs text-orange-900 leading-relaxed">
          <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Privacy Protected:</strong> Your verification answers will only be visible to the item finder and verified portal administrators. They are never shown publicly.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              1. Unique feature not visible in the listing *
            </label>
            <input
              type="text"
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              placeholder="e.g. Small scratch on top corner, specific lockscreen wallpaper, sticker..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              2. What was inside or attached to the item?
            </label>
            <input
              type="text"
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              placeholder="e.g. 2 credit cards, gym pass, blue keychain, notebook inside bag..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                3. Exterior design / case pattern
              </label>
              <input
                type="text"
                value={q3}
                onChange={(e) => setQ3(e.target.value)}
                placeholder="e.g. Black silicone, leather weave..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                4. Purchase date or serial details
              </label>
              <input
                type="text"
                value={q4}
                onChange={(e) => setQ4(e.target.value)}
                placeholder="e.g. Purchased May 2025, serial ends in 98X"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Additional message to finder (Optional)
            </label>
            <textarea
              rows="2"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Provide any additional contact preference or meetup details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm resize-none"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              Submit Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimModal;
