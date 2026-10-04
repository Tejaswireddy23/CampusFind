import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Bell,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import API from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const RegistrationSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lastEvent } = useNotifications();

  const initialStudent = location.state?.student || {
    studentId: 'Pending Verification',
    name: 'Student',
    department: 'Campus Department',
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };

  const [student, setStudent] = useState(initialStudent);
  const [checking, setChecking] = useState(false);

  // Poll or check on WebSocket notification event
  const checkStatus = async () => {
    if (!student.studentId || student.studentId === 'Pending Verification') return;
    setChecking(true);
    try {
      const res = await API.get(`/auth/status?identifier=${encodeURIComponent(student.studentId)}`);
      if (res.data) {
        setStudent(res.data);
      }
    } catch (err) {
      console.error('Error checking account status:', err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // If WebSocket receives an event or student approval broadcast
    if (lastEvent) {
      checkStatus();
    }
  }, [lastEvent]);

  // Periodic polling every 5 seconds while student is on this page
  useEffect(() => {
    if (student.status !== 'PENDING') return;
    const interval = setInterval(() => {
      checkStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [student.status, student.studentId]);

  const isApproved = student.status === 'APPROVED' || student.status === 'ACTIVE';
  const isRejected = student.status === 'REJECTED';

  const formattedDate = student.createdAt
    ? new Date(student.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString();

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-xl w-full bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 card-shadow text-center space-y-6">
        {/* Animated Status Header */}
        {isApproved ? (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-md shadow-green-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
              <Sparkles className="w-3.5 h-3.5 text-green-600" />
              Verified & Activated
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              🎉 Account Approved!
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Your CampusFind student account has been approved by the campus administrator. You can now log in and access the campus Lost & Found portal.
            </p>
          </div>
        ) : isRejected ? (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-md shadow-red-500/20">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              Registration Rejected
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Registration Rejected
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Your CampusFind registration request was rejected by campus administration.
            </p>
            {student.rejectionReason && (
              <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200 text-xs text-red-800 text-left">
                <span className="font-bold block mb-1">Reason provided:</span>
                {student.rejectionReason}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mx-auto shadow-md shadow-orange-500/20 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary-dark border border-orange-200">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Under Review
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Registration Submitted Successfully 🎉
            </h1>
            <p className="text-sm text-neutral-600 max-w-md mx-auto">
              Your CampusFind account has been submitted for administrator approval.
            </p>
          </div>
        )}

        {/* Student Details Card */}
        <div className="p-6 rounded-2xl bg-neutral-50 border border-neutral-200 text-left space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Student Details
            </span>
            <button
              onClick={checkStatus}
              disabled={checking}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              Check Status
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 block mb-0.5">Student ID</span>
              <span className="font-bold text-neutral-900 text-sm font-mono">
                {student.studentId}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5">Full Name</span>
              <span className="font-bold text-neutral-900 text-sm">
                {student.name}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5">Registration Date</span>
              <span className="font-medium text-neutral-700">
                {formattedDate}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block mb-0.5">Current Status</span>
              {isApproved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  🟢 APPROVED
                </span>
              ) : isRejected ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  🔴 REJECTED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-primary-dark">
                  🟠 PENDING APPROVAL
                </span>
              )}
            </div>
            {student.department && (
              <div className="sm:col-span-2">
                <span className="text-neutral-400 block mb-0.5">Department & Year</span>
                <span className="font-medium text-neutral-700">
                  {student.department} {student.year ? `• ${student.year}` : ''} {student.section ? `• ${student.section}` : ''}
                </span>
              </div>
            )}
            {student.approvedBy && isApproved && (
              <div className="sm:col-span-2 pt-2 border-t border-neutral-200/60">
                <span className="text-neutral-400 block mb-0.5">Verified & Approved By</span>
                <span className="font-semibold text-neutral-800">
                  {student.approvedBy}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Live Notification Indicator */}
        {!isApproved && !isRejected && (
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left flex items-start gap-3">
            <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">Real-time status tracking enabled</p>
              <p className="text-amber-800/90 leading-relaxed">
                Once your account is approved, you will be able to log in and access the campus Lost & Found portal. This page will automatically update in real time when your registration is approved.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          {isApproved ? (
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
              >
                Back to Login
              </Link>
              <Link
                to="/account-status"
                state={{ identifier: student.studentId }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-primary bg-primary-light hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
              >
                <span>Track Status</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessPage;
