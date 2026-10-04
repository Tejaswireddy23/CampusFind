import React from 'react';
import { AlertTriangle, X, ArrowRight, ExternalLink, MapPin, Calendar } from 'lucide-react';

const DuplicateWarningModal = ({
  isOpen = true,
  onClose,
  onCancel,
  onProceed,
  similarReports = [],
  highestScore = 0,
  reason = '',
  data,
}) => {
  const handleClose = onClose || onCancel;
  const reports = similarReports.length > 0 ? similarReports : (data?.similarReports || []);
  const score = highestScore || data?.highestScore || 0;
  const msg = reason || data?.reason || 'Similar campus report found.';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-neutral-200 card-shadow overflow-hidden space-y-4">
        {/* Header */}
        <div className="p-6 pb-0 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-neutral-900">
                Similar Campus Report Found ({score}% Match)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                We found existing campus reports with identical or highly similar details.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reason Alert */}
        <div className="px-6">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 leading-relaxed font-medium">
            {msg}
          </div>
        </div>

        {/* Similar Item Cards */}
        <div className="px-6 max-h-60 overflow-y-auto space-y-3">
          {reports.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center gap-3.5 hover:bg-neutral-100/70 transition-colors"
            >
              <img
                src={
                  item.imageUrl ||
                  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'
                }
                alt={item.title}
                className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                  {item.category}
                </span>
                <h4 className="text-xs font-bold text-neutral-900 truncate mt-1">{item.title}</h4>
                <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              <a
                href={`/items/${item.id}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:text-primary transition-colors shrink-0"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-2 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            Cancel & Review Existing
          </button>

          <button
            type="button"
            onClick={onProceed}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary-dark shadow-sm shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <span>It's Different — Submit Anyway</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarningModal;
