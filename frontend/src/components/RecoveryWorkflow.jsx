import React from 'react';
import {
  FileText,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';

/**
 * RecoveryWorkflow Component
 * Visualizes the 6 stages of the CampusFind Recovery Lifecycle:
 * ACTIVE -> MATCHED -> CLAIM_PENDING -> VERIFICATION -> RECOVERED -> CLOSED
 */
const STAGES = [
  {
    key: 'ACTIVE',
    label: 'Active Report',
    desc: 'Reported on Campus',
    icon: FileText,
  },
  {
    key: 'MATCHED',
    label: 'Potential Match',
    desc: 'AI Match Identified',
    icon: Sparkles,
  },
  {
    key: 'CLAIM_PENDING',
    label: 'Claim Pending',
    desc: 'Ownership Claimed',
    icon: ShieldAlert,
  },
  {
    key: 'VERIFICATION',
    label: 'Verification',
    desc: 'Answers Verified',
    icon: ShieldCheck,
  },
  {
    key: 'RECOVERED',
    label: 'Recovered',
    desc: 'Item Reunited',
    icon: CheckCircle2,
  },
  {
    key: 'CLOSED',
    label: 'Closed',
    desc: 'Case Resolved',
    icon: Lock,
  },
];

const STAGE_ORDER = {
  ACTIVE: 0,
  PENDING_VERIFICATION: 0,
  MATCHED: 1,
  CLAIM_PENDING: 2,
  UNDER_REVIEW: 2,
  VERIFICATION: 3,
  VERIFICATION_PENDING: 3,
  VERIFIED: 3,
  RECOVERED: 4,
  RETURNED: 4,
  CLOSED: 5,
  REMOVED: -1,
  REJECTED: -1,
};

const RecoveryWorkflow = ({ currentStatus = 'ACTIVE' }) => {
  const normalizedStatus = (currentStatus || 'ACTIVE').toUpperCase();
  const isRemoved = normalizedStatus === 'REMOVED' || normalizedStatus === 'REJECTED';
  const currentStageIndex = STAGE_ORDER[normalizedStatus] ?? 0;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-6 card-shadow space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">
            Campus Lifecycle
          </span>
          <h3 className="text-base font-bold text-neutral-900">Recovery Workflow Progress</h3>
        </div>
        <div className="flex items-center gap-2">
          {isRemoved ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {normalizedStatus}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-primary-dark flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Current: {normalizedStatus.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Responsive Horizontal Stepper */}
      <div className="relative pt-2 pb-2">
        {/* Track Line */}
        <div className="hidden md:block absolute top-7 left-8 right-8 h-1 bg-neutral-100 -z-0">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-primary transition-all duration-500 rounded-full"
            style={{
              width: `${Math.min(100, Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100))}%`,
            }}
          />
        </div>

        {/* Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-2 relative z-10">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = idx < currentStageIndex || normalizedStatus === 'RECOVERED' && idx <= 4 || normalizedStatus === 'CLOSED';
            const isCurrent = idx === currentStageIndex && !isRemoved;

            return (
              <div
                key={stage.key}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all text-center ${
                  isCurrent
                    ? 'bg-orange-50/80 border border-orange-200 scale-105 shadow-sm'
                    : isCompleted
                    ? 'bg-neutral-50/60 border border-neutral-100'
                    : 'bg-white border border-neutral-100 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                    isCurrent
                      ? 'bg-primary text-white shadow-md shadow-orange-500/30 ring-4 ring-orange-100'
                      : isCompleted
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border-2 border-neutral-200 text-neutral-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs font-bold leading-tight ${
                    isCurrent ? 'text-primary-dark' : isCompleted ? 'text-neutral-800' : 'text-neutral-400'
                  }`}
                >
                  {stage.label}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5 leading-tight">
                  {stage.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecoveryWorkflow;
