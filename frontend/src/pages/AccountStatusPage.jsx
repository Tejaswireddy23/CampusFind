import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  Search,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const AccountStatusPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lastEvent } = useNotifications();

  const [identifier, setIdentifier] = useState(
    location.state?.identifier || ''
  );
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchStatus = async (searchId) => {
    const idToSearch = (searchId || identifier).trim();
    if (!idToSearch) {
      setErrorMsg('Please enter your Student ID or College Email.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await API.get(`/auth/status?identifier=${encodeURIComponent(idToSearch)}`);
      setStudent(res.data);
      setHasSearched(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'No registration record found for this identifier.');
      setStudent(null);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.identifier) {
      fetchStatus(location.state.identifier);
    }
  }, [location.state]);

  // Live update if WebSocket receives notification
  useEffect(() => {
    if (student && student.status === 'PENDING' && lastEvent) {
      fetchStatus(student.studentId || student.email);
    }
  }, [lastEvent]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStatus();
  };

  const isApproved = student?.status === 'APPROVED' || student?.status === 'ACTIVE';
  const isPending = student?.status === 'PENDING';
  const isRejected = student?.status === 'REJECTED';
  const isSuspended = student?.status === 'SUSPENDED';

  return (
    <div className="min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-orange-100 text-primary shadow-sm mb-2">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
            Check Student Account Status
          </h1>
          <p className="text-sm text-neutral-500 max-w-md mx-auto">
            Track your CampusFind registration approval and access status using your Student ID or College Email.
          </p>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 card-shadow space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter Student ID (e.g. STU2024001) or College Email"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-primary hover:bg-primary-dark shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Check Status</span>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Status Result */}
          {student && (
            <div className="pt-4 border-t border-neutral-200 space-y-6">
              {/* Status Banner */}
              <div
                className={`p-6 rounded-2xl border text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isApproved
                    ? 'bg-green-50/80 border-green-200'
                    : isRejected
                    ? 'bg-red-50/80 border-red-200'
                    : isSuspended
                    ? 'bg-amber-50/80 border-amber-200'
                    : 'bg-orange-50/80 border-orange-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isApproved
                        ? 'bg-green-100 text-green-700'
                        : isRejected
                        ? 'bg-red-100 text-red-700'
                        : isSuspended
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-orange-100 text-primary'
                    }`}
                  >
                    {isApproved ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : isRejected ? (
                      <AlertCircle className="w-7 h-7" />
                    ) : isSuspended ? (
                      <AlertCircle className="w-7 h-7" />
                    ) : (
                      <Clock className="w-7 h-7" />
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-0.5">
                      Account Status
                    </span>
                    <span
                      className={`text-lg font-black tracking-tight ${
                        isApproved
                          ? 'text-green-800'
                          : isRejected
                          ? 'text-red-800'
                          : isSuspended
                          ? 'text-amber-800'
                          : 'text-primary-dark'
                      }`}
                    >
                      {isApproved
                        ? '🟢 APPROVED'
                        : isRejected
                        ? '🔴 REJECTED'
                        : isSuspended
                        ? '⛔ SUSPENDED'
                        : '🟠 PENDING APPROVAL'}
                    </span>
                  </div>
                </div>

                {isApproved && (
                  <Link
                    to="/login"
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Log In Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Status Explanation */}
              <div className="text-xs text-neutral-600 px-1 leading-relaxed">
                {isApproved && (
                  <p className="text-green-800 font-medium">
                    "Your account has been verified and approved by the campus administrator. You have full access to report, search, and claim campus lost & found items."
                  </p>
                )}
                {isPending && (
                  <p className="text-orange-800 font-medium">
                    "Your account is waiting for administrator approval. Registrations are typically verified within one business day."
                  </p>
                )}
                {isRejected && (
                  <div className="space-y-1">
                    <p className="text-red-800 font-medium">
                      "Your CampusFind registration request was rejected."
                    </p>
                    {student.rejectionReason && (
                      <p className="p-3 rounded-xl bg-red-100/60 border border-red-200 text-red-900 font-semibold">
                        Reason: {student.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
                {isSuspended && (
                  <p className="text-amber-800 font-medium">
                    "Your account has been suspended. Please contact the campus security or administration office."
                  </p>
                )}
              </div>

              {/* Record Summary */}
              <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Student ID</span>
                  <span className="font-bold text-neutral-900 font-mono text-sm">
                    {student.studentId || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Student Name</span>
                  <span className="font-bold text-neutral-900 text-sm">
                    {student.name}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">College Email</span>
                  <span className="font-medium text-neutral-700">
                    {student.email}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Department</span>
                  <span className="font-medium text-neutral-700">
                    {student.department || 'N/A'} {student.year ? `(${student.year})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Registration Date</span>
                  <span className="font-medium text-neutral-700">
                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {student.approvedAt && isApproved && (
                  <div>
                    <span className="text-neutral-400 block mb-0.5">Approval Date</span>
                    <span className="font-medium text-neutral-700">
                      {new Date(student.approvedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {student.approvedBy && isApproved && (
                  <div className="sm:col-span-2">
                    <span className="text-neutral-400 block mb-0.5">Approved By</span>
                    <span className="font-semibold text-neutral-800">
                      {student.approvedBy}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1"
          >
            <span>Back to Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountStatusPage;
