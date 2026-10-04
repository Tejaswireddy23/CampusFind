import React from 'react';
import { Clock, Eye, CheckCircle2, XCircle, Gift, ArrowRight } from 'lucide-react';

const ClaimTimeline = ({ status, finderConfirmed, ownerConfirmed }) => {
  const isRejected = status === 'REJECTED';

  const steps = [
    {
      id: 'PENDING',
      label: 'Submitted',
      desc: 'Claim created',
      icon: Clock,
      isDone: true,
      isCurrent: status === 'PENDING',
    },
    {
      id: 'UNDER_REVIEW',
      label: 'Under Review',
      desc: 'Verification in progress',
      icon: Eye,
      isDone: status === 'UNDER_REVIEW' || status === 'APPROVED' || status === 'RETURNED' || isRejected,
      isCurrent: status === 'UNDER_REVIEW',
    },
    {
      id: 'DECISION',
      label: isRejected ? 'Rejected' : 'Approved',
      desc: isRejected ? 'Claim denied' : 'Ownership verified',
      icon: isRejected ? XCircle : CheckCircle2,
      isDone: status === 'APPROVED' || status === 'RETURNED' || isRejected,
      isCurrent: status === 'APPROVED' || isRejected,
      color: isRejected ? 'text-red-500' : 'text-green-500',
    },
    {
      id: 'RETURNED',
      label: 'Returned',
      desc: 'Item recovered',
      icon: Gift,
      isDone: status === 'RETURNED',
      isCurrent: status === 'RETURNED',
      color: 'text-primary',
    },
  ];

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-neutral-200 -z-0">
          <div
            className={`h-full transition-all duration-500 ${
              isRejected ? 'bg-red-500' : 'bg-primary'
            }`}
            style={{
              width:
                status === 'RETURNED'
                  ? '100%'
                  : status === 'APPROVED'
                  ? '66%'
                  : status === 'UNDER_REVIEW'
                  ? '33%'
                  : isRejected
                  ? '66%'
                  : '10%',
            }}
          ></div>
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const active = step.isDone;
          const current = step.isCurrent;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                  isRejected && step.id === 'DECISION'
                    ? 'bg-red-600 text-white ring-4 ring-red-100'
                    : current
                    ? 'bg-primary text-white ring-4 ring-orange-100 scale-110'
                    : active
                    ? 'bg-primary text-white'
                    : 'bg-white border-2 border-neutral-300 text-neutral-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                  current ? 'text-primary' : active ? 'text-neutral-900' : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
              <span className="hidden sm:block text-[10px] text-neutral-400 whitespace-nowrap">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Confirmation Sub-status for Approved */}
      {(status === 'APPROVED' || status === 'RETURNED') && (
        <div className="mt-6 p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/50 flex flex-wrap items-center justify-between text-xs gap-3">
          <span className="font-semibold text-neutral-700">Dual-Party Return Verification:</span>
          <div className="flex items-center gap-4">
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                finderConfirmed ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {finderConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              Finder: Handover Confirmed
            </span>
            <span
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                ownerConfirmed ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
              }`}
            >
              {ownerConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              Owner: Receipt Confirmed
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimTimeline;
