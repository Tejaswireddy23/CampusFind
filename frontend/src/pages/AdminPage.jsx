import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import SystemStatusSection from '../components/SystemStatusSection';
import {
  Users,
  Search,
  ShieldAlert,
  BarChart3,
  Flag,
  ListFilter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Clock,
  Layers,
  FileText,
  MapPin,
  TrendingUp,
  Bell,
  Send,
  ExternalLink,
  Eye,
  Check,
  X,
  Ban,
  GraduationCap,
  Trash2,
  Megaphone,
  Filter,
  Award,
  Phone,
  Mail,
  Building,
  Calendar,
  Lock,
} from 'lucide-react';

const AdminPage = ({ defaultTab = 'DASHBOARD' }) => {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  // Dashboard & Analytics
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Student Directory & Approvals
  const [studentsList, setStudentsList] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [studentQuery, setStudentQuery] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modals for Students
  const [viewStudentModal, setViewStudentModal] = useState(null);
  const [approveConfirmStudent, setApproveConfirmStudent] = useState(null);
  const [rejectReasonModal, setRejectReasonModal] = useState(null); // { student, reason }
  const [suspendConfirmStudent, setSuspendConfirmStudent] = useState(null);

  // Campus Alerts
  const [campusAlerts, setCampusAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    category: 'General',
    targetAudience: 'ALL STUDENTS',
    targetDepartment: '',
    targetYear: '',
    targetSection: '',
    priority: 'NORMAL',
  });

  // Moderation
  const [itemsList, setItemsList] = useState([]);
  const [moderateItemModal, setModerateItemModal] = useState(null);
  const [moderateReason, setModerateReason] = useState('Spam');

  // Reports
  const [reportsList, setReportsList] = useState([]);

  // Fraud alerts
  const [fraudAlerts, setFraudAlerts] = useState([]);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);

  // Campus Locations Management
  const [locationsList, setLocationsList] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationModal, setLocationModal] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);

  // Data Fetching Functions
  const fetchDashboard = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [dashRes, anaRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/analytics'),
      ]);
      setStats(dashRes.data);
      setAnalytics(anaRes.data);
    } catch (err) {
      console.error('Error fetching admin dashboard:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchPendingStudents = useCallback(async () => {
    try {
      const res = await API.get('/admin/students?status=PENDING&size=100');
      setPendingStudents(res.data.content || []);
    } catch (err) {
      console.error('Error fetching pending students:', err);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const statusParam = studentStatusFilter !== 'ALL' ? `&status=${studentStatusFilter}` : '';
      const queryParam = studentQuery ? `&query=${encodeURIComponent(studentQuery)}` : '';
      const res = await API.get(`/admin/students?size=100${statusParam}${queryParam}`);
      setStudentsList(res.data.content || []);
    } catch (err) {
      console.error('Error fetching students list:', err);
    } finally {
      setLoadingStudents(false);
    }
  }, [studentStatusFilter, studentQuery]);

  const fetchCampusAlerts = useCallback(async () => {
    setLoadingAlerts(true);
    try {
      const res = await API.get('/campus-alerts');
      setCampusAlerts(res.data.content || res.data || []);
    } catch (err) {
      console.error('Error fetching campus alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  const fetchModerationItems = useCallback(async () => {
    try {
      const res = await API.get('/admin/items?size=30');
      setItemsList(res.data.content || []);
    } catch (err) {
      console.error('Error fetching items for moderation:', err);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const res = await API.get('/admin/reports');
      setReportsList(res.data.content || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  }, []);

  const fetchFraudAlerts = useCallback(async () => {
    try {
      const res = await API.get('/admin/fraud-alerts');
      setFraudAlerts(res.data || []);
    } catch (err) {
      console.error('Error fetching fraud alerts:', err);
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await API.get('/admin/audit-logs');
      setAuditLogs(res.data.content || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  }, []);

  const fetchLocations = useCallback(async () => {
    setLoadingLocations(true);
    try {
      const res = await API.get('/campus-locations?all=true');
      setLocationsList(res.data || []);
    } catch (err) {
      console.error('Error fetching campus locations:', err);
    } finally {
      setLoadingLocations(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchPendingStudents();
  }, [fetchDashboard, fetchPendingStudents]);

  useEffect(() => {
    if (activeTab === 'STUDENT_APPROVALS') fetchPendingStudents();
    if (activeTab === 'STUDENTS') fetchStudents();
    if (activeTab === 'ALERTS') fetchCampusAlerts();
    if (activeTab === 'MODERATION') fetchModerationItems();
    if (activeTab === 'REPORTS') fetchReports();
    if (activeTab === 'FRAUD') fetchFraudAlerts();
    if (activeTab === 'AUDIT') fetchAuditLogs();
    if (activeTab === 'LOCATIONS') fetchLocations();
  }, [
    activeTab,
    fetchPendingStudents,
    fetchStudents,
    fetchCampusAlerts,
    fetchModerationItems,
    fetchReports,
    fetchFraudAlerts,
    fetchAuditLogs,
    fetchLocations,
  ]);

  // Student Actions
  const handleApproveStudent = async (studentId) => {
    try {
      await API.put(`/admin/students/${studentId}/approve`);
      success('Student account approved! Real-time notification dispatched.');
      setApproveConfirmStudent(null);
      setViewStudentModal(null);
      fetchPendingStudents();
      fetchStudents();
      fetchDashboard();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to approve student.');
    }
  };

  const handleRejectStudent = async () => {
    if (!rejectReasonModal) return;
    try {
      await API.put(`/admin/students/${rejectReasonModal.student.id}/reject`, {
        reason: rejectReasonModal.reason || 'Student ID could not be verified.',
      });
      success('Student registration request rejected.');
      setRejectReasonModal(null);
      setViewStudentModal(null);
      fetchPendingStudents();
      fetchStudents();
      fetchDashboard();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to reject student.');
    }
  };

  const handleSuspendStudent = async (studentId) => {
    try {
      await API.put(`/admin/students/${studentId}/suspend`);
      success('Student account suspended.');
      setSuspendConfirmStudent(null);
      setViewStudentModal(null);
      fetchStudents();
      fetchDashboard();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to suspend student.');
    }
  };

  // Campus Alerts Actions
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    setSendingAlert(true);
    try {
      await API.post('/campus-alerts', newAlert);
      success('Campus alert broadcasted via WebSockets and notifications!');
      setNewAlert({
        title: '',
        message: '',
        category: 'General',
        targetAudience: 'ALL STUDENTS',
        targetDepartment: '',
        targetYear: '',
        targetSection: '',
        priority: 'NORMAL',
      });
      fetchCampusAlerts();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to broadcast campus alert.');
    } finally {
      setSendingAlert(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await API.delete(`/campus-alerts/${alertId}`);
      success('Campus alert removed.');
      fetchCampusAlerts();
    } catch (err) {
      toastError('Failed to remove alert.');
    }
  };

  // Location Actions
  const handleToggleLocation = async (id) => {
    try {
      await API.put(`/campus-locations/${id}/toggle`);
      success('Location status toggled successfully.');
      fetchLocations();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to toggle location status.');
    }
  };

  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!locationModal) return;
    setSavingLocation(true);
    try {
      if (locationModal.id) {
        await API.put(`/campus-locations/${locationModal.id}`, locationModal);
        success('Campus location updated.');
      } else {
        await API.post('/campus-locations', locationModal);
        success('Campus location added.');
      }
      setLocationModal(null);
      fetchLocations();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save location.');
    } finally {
      setSavingLocation(false);
    }
  };

  const handleDeleteLocation = async (id) => {
    try {
      await API.delete(`/campus-locations/${id}`);
      success('Location deleted successfully.');
      fetchLocations();
    } catch (err) {
      toastError(err.response?.data?.message || 'Cannot delete location currently referenced in active reports.');
    }
  };

  // Moderation & Reports Actions
  const handleModerateSubmit = async (status) => {
    if (!moderateItemModal) return;
    try {
      await API.put(`/admin/items/${moderateItemModal.itemId}/moderate`, {
        status,
        reason: moderateReason,
      });
      success(`Listing marked as ${status}`);
      fetchModerationItems();
      setModerateItemModal(null);
    } catch (err) {
      toastError('Failed to moderate listing.');
    }
  };

  const handleReportAction = async (reportId, status) => {
    try {
      await API.put(`/admin/reports/${reportId}/status`, { status });
      success(`Report marked as ${status}`);
      fetchReports();
    } catch (err) {
      toastError('Failed to update report.');
    }
  };

  // Sidebar navigation items
  const navItems = [
    { key: 'DASHBOARD', label: 'Dashboard', icon: BarChart3 },
    {
      key: 'STUDENT_APPROVALS',
      label: 'Student Approvals',
      icon: CheckCircle2,
      badge: pendingStudents.length > 0 ? pendingStudents.length : null,
      badgeColor: 'bg-primary text-white',
    },
    { key: 'STUDENTS', label: 'Students', icon: Users },
    { key: 'REPORTS_LINK', label: 'Lost & Found Reports', icon: FileText, isExternal: true, path: '/admin/reports' },
    { key: 'MATCHES_LINK', label: 'Potential Matches', icon: TrendingUp, isExternal: true, path: '/matches' },
    { key: 'CLAIMS_LINK', label: 'Claims', icon: Layers, isExternal: true, path: '/claims' },
    { key: 'ALERTS', label: 'Campus Alerts', icon: Megaphone },
    { key: 'LOCATIONS', label: 'Campus Locations', icon: MapPin },
    { key: 'ANALYTICS', label: 'Analytics', icon: TrendingUp },
    { key: 'AUDIT', label: 'Audit Logs', icon: Clock },
    { key: 'MODERATION', label: 'Moderation Queue', icon: ListFilter },
    { key: 'FRAUD', label: 'Fraud Alerts', icon: AlertTriangle },
    { key: 'SYSTEM_STATUS', label: 'System & Deployment Status', icon: ShieldCheck },
  ];

  return (
    <div className="bg-neutral-50/60 min-h-[90vh] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200 card-shadow">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-primary" />
              <span>CampusFind Institutional Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              CampusFind Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Manage student access, campus Lost & Found reports, alerts, and recoveries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchDashboard();
                fetchPendingStudents();
                if (activeTab === 'STUDENTS') fetchStudents();
                if (activeTab === 'ALERTS') fetchCampusAlerts();
                if (activeTab === 'MODERATION') fetchModerationItems();
                if (activeTab === 'REPORTS') fetchReports();
                if (activeTab === 'FRAUD') fetchFraudAlerts();
                if (activeTab === 'AUDIT') fetchAuditLogs();
                if (activeTab === 'LOCATIONS') fetchLocations();
                success('Data refreshed from backend.');
              }}
              className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Refresh
            </button>

            <Link
              to="/campus-map"
              className="px-4 py-2 rounded-xl bg-orange-50 text-primary hover:bg-orange-100 border border-orange-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              Campus Map
            </Link>
          </div>
        </div>

        {/* Admin Navigation Ribbon */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-white rounded-2xl border border-neutral-200 scrollbar-none shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.isExternal) {
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{item.label}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                </Link>
              );
            }

            const isSelected = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-primary' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 0: SYSTEM STATUS & DEPLOYMENT DIAGNOSTICS */}
        {/* ========================================================================= */}
        {activeTab === 'SYSTEM_STATUS' && <SystemStatusSection />}

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD */}
        {/* ========================================================================= */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6">
            {/* Pending Approvals Alert Banner */}
            {pendingStudents.length > 0 && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">
                      {pendingStudents.length} Student Registration Request{pendingStudents.length > 1 ? 's' : ''} Awaiting Approval
                    </h3>
                    <p className="text-xs text-orange-100 mt-0.5">
                      New students cannot log in until their institutional credentials are confirmed by an administrator.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('STUDENT_APPROVALS')}
                  className="px-4 py-2 bg-white text-neutral-900 text-xs font-extrabold rounded-xl shadow-sm hover:bg-neutral-100 transition-colors whitespace-nowrap"
                >
                  Review Approvals &rarr;
                </button>
              </div>
            )}

            {/* Core Metrics Cards (Requirements 21 & 24) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {[
                { label: 'Registered Students', val: stats?.totalRegisteredStudents ?? stats?.totalStudents ?? 0, color: 'text-neutral-900' },
                { label: 'Pending Approvals', val: stats?.pendingStudentApprovals ?? pendingStudents.length, color: 'text-primary font-extrabold' },
                { label: 'Approved Students', val: stats?.approvedStudents ?? stats?.totalStudents ?? 0, color: 'text-green-700' },
                { label: 'Total Lost Reports', val: stats?.totalLostItems ?? 0, color: 'text-red-600' },
                { label: 'Total Found Reports', val: stats?.totalFoundItems ?? 0, color: 'text-emerald-700' },
                { label: 'Active Matches', val: stats?.activeMatches ?? 0, color: 'text-primary' },
                { label: 'Recovered Items', val: stats?.recoveredItems ?? stats?.returnedItems ?? 0, color: 'text-purple-700' },
                { label: 'Reports This Month', val: stats?.reportsThisMonth ?? 0, color: 'text-blue-700' },
              ].map((card, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-neutral-200 card-shadow">
                  <span className="text-[11px] font-semibold text-neutral-400 block mb-1">
                    {card.label}
                  </span>
                  <span className={`text-xl sm:text-2xl font-bold ${card.color}`}>
                    {loadingStats ? '...' : card.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Campus Insights Banner (Requirements 22, 23, 24) */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-50 via-white to-amber-50 border border-orange-200/80 card-shadow">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-primary-dark">
                  Campus Intelligence & Recovery Metrics
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 bg-white/90 rounded-2xl border border-orange-100 shadow-sm">
                  <span className="text-neutral-400 block text-[11px] font-medium">Recovery Rate (Req 24)</span>
                  <span className="font-extrabold text-2xl text-green-700 mt-1 block">
                    {analytics?.recoveryRate ?? 0}% Recovered
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Dynamically calculated from confirmed recoveries in database.
                  </p>
                </div>

                <div className="p-4 bg-white/90 rounded-2xl border border-orange-100 shadow-sm">
                  <span className="text-neutral-400 block text-[11px] font-medium">Most Common Lost Category (Req 22)</span>
                  <span className="font-extrabold text-lg text-neutral-900 mt-1 block truncate">
                    {analytics?.itemsByCategory ? Object.entries(analytics.itemsByCategory).sort((a,b) => b[1]-a[1])[0]?.[0] || 'Mobile Phones' : 'Mobile Phones'}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1">Based on real lost reports query.</p>
                </div>

                <div className="p-4 bg-white/90 rounded-2xl border border-orange-100 shadow-sm">
                  <span className="text-neutral-400 block text-[11px] font-medium">Top Reported Location (Req 23)</span>
                  <span className="font-extrabold text-lg text-primary mt-1 block truncate">
                    📍 {analytics?.topReportingLocations?.[0]?.location || 'Canteen'}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    {analytics?.topReportingLocations?.[0]?.count || 0} reports in active zone.
                  </p>
                </div>

                <div className="p-4 bg-white/90 rounded-2xl border border-orange-100 shadow-sm">
                  <span className="text-neutral-400 block text-[11px] font-medium">Total Campus Ecosystem Reports</span>
                  <span className="font-extrabold text-2xl text-neutral-900 mt-1 block">
                    {(stats?.totalLostItems || 0) + (stats?.totalFoundItems || 0)}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Across all academic blocks and hostels.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div
                onClick={() => setActiveTab('STUDENT_APPROVALS')}
                className="p-5 rounded-2xl bg-white border border-neutral-200 card-shadow hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-primary">Review &rarr;</span>
                </div>
                <h4 className="font-bold text-sm text-neutral-900">Student Approvals</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Verify institutional student IDs and approve pending accounts.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('ALERTS')}
                className="p-5 rounded-2xl bg-white border border-neutral-200 card-shadow hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-primary">Broadcast &rarr;</span>
                </div>
                <h4 className="font-bold text-sm text-neutral-900">Campus Alerts</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Send live announcements targeted by department, year, or section.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('LOCATIONS')}
                className="p-5 rounded-2xl bg-white border border-neutral-200 card-shadow hover:border-primary/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-primary">Configure &rarr;</span>
                </div>
                <h4 className="font-bold text-sm text-neutral-900">Campus Locations</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  Manage academic blocks, library, canteen, and campus hotspots.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STUDENT APPROVALS (Requirement 6, 8, 9) */}
        {/* ========================================================================= */}
        {activeTab === 'STUDENT_APPROVALS' && (
          <div className="bg-white rounded-3xl border border-neutral-200 card-shadow p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-orange-100 text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-extrabold text-neutral-900">
                    Student Registration Requests
                  </h2>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Students in PENDING status cannot access portal features or report items until verified and approved.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-orange-50 text-primary-dark border border-orange-200">
                  {pendingStudents.length} Pending Request{pendingStudents.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={fetchPendingStudents}
                  className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors"
                  title="Refresh Queue"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {pendingStudents.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50/70 rounded-2xl border border-dashed border-neutral-200">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-neutral-900">All Registration Requests Processed</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  There are currently no student accounts waiting for administrative approval.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-600">
                  <thead className="bg-neutral-50 text-neutral-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">College Email</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Year / Sec</th>
                      <th className="p-3">Registration Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {pendingStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-neutral-900">
                          {s.studentId || 'N/A'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={s.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`}
                              alt={s.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <span className="font-bold text-neutral-900">{s.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-neutral-600">{s.email}</td>
                        <td className="p-3 text-neutral-700 font-medium">{s.department || 'N/A'}</td>
                        <td className="p-3 text-neutral-600">
                          {s.year || '-'} {s.section ? `• Sec ${s.section}` : ''}
                        </td>
                        <td className="p-3 text-neutral-400 text-[11px] whitespace-nowrap">
                          {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-orange-100 text-primary-dark uppercase">
                            🟠 PENDING
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setViewStudentModal(s)}
                            className="px-2.5 py-1 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setApproveConfirmStudent(s)}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectReasonModal({ student: s, reason: '' })}
                            className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STUDENTS DIRECTORY (Requirement 12) */}
        {/* ========================================================================= */}
        {activeTab === 'STUDENTS' && (
          <div className="bg-white rounded-3xl border border-neutral-200 card-shadow p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Student Accounts Directory</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Institutional student directory with real-time status filtering and search.
                </p>
              </div>

              {/* Search Bar (Student ID, Name, Email, Department) */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder="Search by ID, Name, Email, Dept..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
            </div>

            {/* Filter Buttons (Requirement 12) */}
            <div className="flex flex-wrap gap-2 pt-1 border-b border-neutral-100 pb-3">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'DEACTIVATED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStudentStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    studentStatusFilter === st
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Student Directory Table */}
            {loadingStudents ? (
              <div className="text-center py-12 text-xs text-neutral-400">Loading student directory...</div>
            ) : studentsList.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400">
                No students found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-neutral-600">
                  <thead className="bg-neutral-50 text-neutral-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Student ID</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">College Email</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Year / Sec</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {studentsList.map((s) => (
                      <tr key={s.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-neutral-900">
                          {s.studentId || 'N/A'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={s.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`}
                              alt={s.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <span className="font-bold text-neutral-900">{s.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-neutral-600">{s.email}</td>
                        <td className="p-3 text-neutral-700 font-medium">{s.department || '-'}</td>
                        <td className="p-3 text-neutral-600">
                          {s.year || '-'} {s.section ? `• Sec ${s.section}` : ''}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              s.status === 'APPROVED' || s.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : s.status === 'PENDING'
                                ? 'bg-orange-100 text-primary-dark'
                                : s.status === 'SUSPENDED'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setViewStudentModal(s)}
                            className="px-2.5 py-1 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                          >
                            View
                          </button>
                          {s.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => setApproveConfirmStudent(s)}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setRejectReasonModal({ student: s, reason: '' })}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(s.status === 'APPROVED' || s.status === 'ACTIVE') && (
                            <button
                              onClick={() => setSuspendConfirmStudent(s)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100"
                            >
                              Suspend
                            </button>
                          )}
                          {s.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleApproveStudent(s.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100"
                            >
                              Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CAMPUS ALERTS (Requirement 17, 18, 19) */}
        {/* ========================================================================= */}
        {activeTab === 'ALERTS' && (
          <div className="space-y-6">
            {/* Create Alert Box */}
            <div className="bg-white rounded-3xl border border-neutral-200 card-shadow p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-100 text-primary">
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Broadcast Campus Announcement</h2>
                  <p className="text-xs text-neutral-500">
                    Dispatches live WebSocket alerts and persistent notifications to target campus students.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Alert Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAlert.title}
                      onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                      placeholder="e.g. 🚨 Important Lost & Found Alert"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Category
                      </label>
                      <select
                        value={newAlert.category}
                        onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs bg-white focus:border-primary outline-none"
                      >
                        <option value="General">General Announcement</option>
                        <option value="Found Item">Found Item Alert</option>
                        <option value="Lost Item">Lost Item Alert</option>
                        <option value="Campus Safety">Campus Safety</option>
                        <option value="Event Notice">Event Notice</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Priority *
                      </label>
                      <select
                        value={newAlert.priority}
                        onChange={(e) => setNewAlert({ ...newAlert, priority: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs bg-white font-bold text-neutral-800 focus:border-primary outline-none"
                      >
                        <option value="NORMAL">NORMAL</option>
                        <option value="IMPORTANT">IMPORTANT</option>
                        <option value="URGENT">URGENT</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Announcement Message *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    placeholder="e.g. A set of keys was found near the Library. If these belong to you, please check the CampusFind portal."
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                </div>

                {/* Target Audience Controls (Requirement 17, 19) */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-neutral-800">Target Audience (Requirement 19)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                        Audience Scope
                      </label>
                      <select
                        value={newAlert.targetAudience}
                        onChange={(e) => setNewAlert({ ...newAlert, targetAudience: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white focus:border-primary outline-none"
                      >
                        <option value="ALL STUDENTS">ALL STUDENTS</option>
                        <option value="SPECIFIC DEPARTMENT">SPECIFIC DEPARTMENT</option>
                        <option value="SPECIFIC YEAR">SPECIFIC YEAR</option>
                        <option value="SPECIFIC SECTION">SPECIFIC SECTION</option>
                        <option value="STUDENTS WITH RELEVANT REPORTS">STUDENTS WITH RELEVANT REPORTS</option>
                      </select>
                    </div>

                    {newAlert.targetAudience === 'SPECIFIC DEPARTMENT' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          required
                          value={newAlert.targetDepartment}
                          onChange={(e) => setNewAlert({ ...newAlert, targetDepartment: e.target.value })}
                          placeholder="e.g. Computer Science, ECE..."
                          className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs focus:border-primary outline-none"
                        />
                      </div>
                    )}

                    {newAlert.targetAudience === 'SPECIFIC YEAR' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Academic Year
                        </label>
                        <select
                          value={newAlert.targetYear}
                          onChange={(e) => setNewAlert({ ...newAlert, targetYear: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs bg-white focus:border-primary outline-none"
                        >
                          <option value="">Select Year...</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Postgraduate">Postgraduate</option>
                        </select>
                      </div>
                    )}

                    {newAlert.targetAudience === 'SPECIFIC SECTION' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Section
                        </label>
                        <input
                          type="text"
                          required
                          value={newAlert.targetSection}
                          onChange={(e) => setNewAlert({ ...newAlert, targetSection: e.target.value })}
                          placeholder="e.g. A, B, C..."
                          className="w-full px-3 py-1.5 rounded-xl border border-neutral-200 text-xs focus:border-primary outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sendingAlert}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingAlert ? 'Broadcasting...' : 'Broadcast Alert via WebSockets'}
                  </button>
                </div>
              </form>
            </div>

            {/* Past Alerts List */}
            <div className="bg-white rounded-3xl border border-neutral-200 card-shadow p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-neutral-900">Broadcasted Campus Alerts</h3>

              {loadingAlerts ? (
                <div className="text-center py-8 text-xs text-neutral-400">Loading alerts...</div>
              ) : campusAlerts.length === 0 ? (
                <div className="text-center py-8 text-xs text-neutral-400">
                  No campus announcements have been broadcasted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {campusAlerts.map((a) => (
                    <div
                      key={a.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        a.priority === 'URGENT'
                          ? 'bg-red-50/60 border-red-200'
                          : a.priority === 'IMPORTANT'
                          ? 'bg-orange-50/60 border-orange-200'
                          : 'bg-neutral-50/60 border-neutral-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              a.priority === 'URGENT'
                                ? 'bg-red-100 text-red-700'
                                : a.priority === 'IMPORTANT'
                                ? 'bg-orange-100 text-primary-dark'
                                : 'bg-neutral-200 text-neutral-700'
                            }`}
                          >
                            {a.priority}
                          </span>
                          <span className="text-[10px] font-semibold text-neutral-500">
                            Audience: <strong>{a.targetAudience}</strong>
                            {a.targetDepartment ? ` (${a.targetDepartment})` : ''}
                            {a.targetYear ? ` (${a.targetYear})` : ''}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-neutral-900">{a.title}</h4>
                        <p className="text-xs text-neutral-700 leading-relaxed">{a.message}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAlert(a.id)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors self-end sm:self-center"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CAMPUS LOCATIONS (Requirement 14, 15) */}
        {/* ========================================================================= */}
        {activeTab === 'LOCATIONS' && (
          <div className="bg-white rounded-3xl border border-neutral-200 card-shadow p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Campus Location Management</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Configure official campus zones and buildings for smart proximity matching. Locations referenced in active reports cannot be deleted.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/campus-map"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-primary bg-orange-50 border border-orange-200 hover:bg-orange-100 flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  View Campus Map
                </Link>
                <button
                  onClick={() =>
                    setLocationModal({ name: '', code: '', zone: 'Academic Zone', description: '', active: true })
                  }
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm flex items-center gap-1.5"
                >
                  + Add Location
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="max-w-md">
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Search campus locations, buildings, or zones..."
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {/* Locations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 text-neutral-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Location Name</th>
                    <th className="p-3">Code</th>
                    <th className="p-3">Campus Zone</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {locationsList
                    .filter((l) =>
                      !locationSearch ||
                      l.name?.toLowerCase().includes(locationSearch.toLowerCase()) ||
                      l.zone?.toLowerCase().includes(locationSearch.toLowerCase()) ||
                      l.code?.toLowerCase().includes(locationSearch.toLowerCase())
                    )
                    .map((loc) => (
                      <tr key={loc.id} className="hover:bg-neutral-50/70">
                        <td className="p-3 font-bold text-neutral-900 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {loc.name}
                        </td>
                        <td className="p-3 font-mono text-[11px] font-semibold text-neutral-700">
                          {loc.code}
                        </td>
                        <td className="p-3 text-neutral-600">{loc.zone}</td>
                        <td className="p-3 text-neutral-500 max-w-xs truncate">{loc.description}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              loc.active !== false
                                ? 'bg-green-100 text-green-700'
                                : 'bg-neutral-200 text-neutral-500'
                            }`}
                          >
                            {loc.active !== false ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setLocationModal(loc)}
                            className="px-2.5 py-1 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleLocation(loc.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              loc.active !== false
                                ? 'border border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border border-green-200 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {loc.active !== false ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteLocation(loc.id)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50"
                            title="Delete Location (only allowed if unused)"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CAMPUS ANALYTICS (Requirement 21, 22, 23, 24) */}
        {/* ========================================================================= */}
        {activeTab === 'ANALYTICS' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Lost vs Found Ratio */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center justify-between">
                  <span>Lost vs Found Ratio</span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </h3>
                <div className="space-y-3 pt-2">
                  {analytics?.lostVsFound &&
                    Object.entries(analytics.lostVsFound).map(([key, count]) => {
                      const total = (stats?.totalLostItems || 0) + (stats?.totalFoundItems || 0);
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-neutral-700">
                            <span>{key}</span>
                            <span>{count} ({pct}%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                key.includes('Lost') ? 'bg-red-500' : 'bg-green-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Items by Category (Requirement 22) */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Most Common Lost Items (Req 22)</h3>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {analytics?.itemsByCategory &&
                    Object.entries(analytics.itemsByCategory).map(([cat, count]) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 text-xs"
                      >
                        <span className="font-medium text-neutral-700">{cat}</span>
                        <span className="font-bold text-primary px-2 py-0.5 rounded-md bg-orange-100/60">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recovery KPI Card (Requirement 24) */}
              <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
                <h3 className="text-sm font-bold text-neutral-900">Campus Recovery Rate (Req 24)</h3>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100">
                    <span className="text-[11px] text-neutral-500 block">Recovery Rate</span>
                    <span className="text-2xl font-black text-primary mt-1 block">
                      {analytics?.recoveryRate ?? 0}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-green-50 border border-green-100">
                    <span className="text-[11px] text-neutral-500 block">Claim Success</span>
                    <span className="text-2xl font-black text-green-700 mt-1 block">
                      {analytics?.claimSuccessRate ?? 0}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-neutral-600 flex items-center justify-between border-t border-neutral-100">
                  <span>Avg. Recovery Time:</span>
                  <strong className="text-neutral-900">
                    {analytics?.averageRecoveryTimeDays ?? 2.4} Days
                  </strong>
                </div>
              </div>
            </div>

            {/* Top Reporting Locations (Requirement 23) */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                Most Common Campus Locations (Req 23)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {analytics?.topReportingLocations &&
                  analytics.topReportingLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-neutral-800 truncate pr-2">
                        📍 {loc.location}
                      </span>
                      <span className="font-bold text-neutral-600 shrink-0">
                        {loc.count} reports
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: AUDIT LOGS (Requirement 29) */}
        {/* ========================================================================= */}
        {activeTab === 'AUDIT' && (
          <div className="bg-white rounded-3xl border border-neutral-200 card-shadow p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-neutral-900">Security & Operational Audit Trail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-600">
                <thead className="bg-neutral-50 text-neutral-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Entity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50/70">
                      <td className="p-3 text-[11px] text-neutral-400 whitespace-nowrap">
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                      </td>
                      <td className="p-3 font-semibold text-neutral-800">
                        {log.userName || `User #${log.userId || 'Sys'}`}
                      </td>
                      <td className="p-3">
                        <span className="font-mono font-bold text-primary text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-neutral-500">
                        {log.entityType ? `${log.entityType} #${log.entityId}` : 'N/A'}
                      </td>
                      <td className="p-3 text-neutral-700">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: LISTING MODERATION */}
        {/* ========================================================================= */}
        {activeTab === 'MODERATION' && (
          <div className="bg-white rounded-3xl border border-neutral-200 card-shadow p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-neutral-900">Listings Moderation Queue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {itemsList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-neutral-200 flex items-start gap-4"
                >
                  <img
                    src={
                      item.imageUrl ||
                      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200'
                    }
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 uppercase">
                        {item.type} • {item.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.moderationStatus === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.moderationStatus}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 truncate">{item.title}</h4>
                    <p className="text-xs text-neutral-500 line-clamp-1">{item.description}</p>
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleModerateSubmit('APPROVED')}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          setModerateItemModal({ itemId: item.id, title: item.title })
                        }
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        Remove Listing
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: FRAUD ALERTS */}
        {/* ========================================================================= */}
        {activeTab === 'FRAUD' && (
          <div className="bg-white rounded-3xl border border-neutral-200 card-shadow p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Rule-Based Fraud Detection System
            </h2>
            {fraudAlerts.length === 0 ? (
              <div className="text-center py-12 text-xs text-green-700 font-semibold bg-green-50 rounded-2xl border border-green-200">
                ✓ No high-severity fraud flags detected in campus operations.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fraudAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-5 rounded-2xl border border-orange-200 bg-orange-50/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                        ⚠ {alert.severity} Risk
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900">{alert.title}</h4>
                    <p className="text-xs text-neutral-700">{alert.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: STUDENT DETAILS VIEW (Requirement 7) */}
      {/* ========================================================================= */}
      {viewStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-neutral-200">
            <div className="flex items-start justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <img
                  src={viewStudentModal.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${viewStudentModal.name}`}
                  alt={viewStudentModal.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-neutral-200"
                />
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{viewStudentModal.name}</h3>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      viewStudentModal.status === 'APPROVED' || viewStudentModal.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : viewStudentModal.status === 'PENDING'
                        ? 'bg-orange-100 text-primary-dark'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    Status: {viewStudentModal.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewStudentModal(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Details Grid (No Passwords Exposed - Req 7) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-400 block text-[10px]">Student ID</span>
                <span className="font-mono font-bold text-neutral-900 mt-0.5 block">
                  {viewStudentModal.studentId || 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-400 block text-[10px]">College Email</span>
                <span className="font-bold text-neutral-900 mt-0.5 block truncate">
                  {viewStudentModal.email}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-400 block text-[10px]">Phone Number</span>
                <span className="font-medium text-neutral-900 mt-0.5 block">
                  {viewStudentModal.phone || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-400 block text-[10px]">Department</span>
                <span className="font-medium text-neutral-900 mt-0.5 block">
                  {viewStudentModal.department || 'Not specified'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-400 block text-[10px]">Year & Section</span>
                <span className="font-medium text-neutral-900 mt-0.5 block">
                  {viewStudentModal.year || '1st Year'} • Sec {viewStudentModal.section || 'A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                <span className="text-neutral-400 block text-[10px]">Registration Date</span>
                <span className="font-medium text-neutral-900 mt-0.5 block">
                  {viewStudentModal.createdAt ? new Date(viewStudentModal.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Approval Info */}
            {viewStudentModal.approvedAt && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-100 text-xs text-green-800">
                <strong>Approved On:</strong> {new Date(viewStudentModal.approvedAt).toLocaleString()} by {viewStudentModal.approvedBy || 'Admin'}
              </div>
            )}

            {/* Rejection Info */}
            {viewStudentModal.rejectionReason && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-800">
                <strong>Rejection Reason:</strong> {viewStudentModal.rejectionReason}
              </div>
            )}

            {/* Admin Actions */}
            <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-neutral-100">
              {viewStudentModal.status !== 'APPROVED' && viewStudentModal.status !== 'ACTIVE' && (
                <button
                  onClick={() => {
                    const st = viewStudentModal;
                    setViewStudentModal(null);
                    setApproveConfirmStudent(st);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-600 hover:bg-green-700"
                >
                  Approve Student
                </button>
              )}

              {viewStudentModal.status !== 'REJECTED' && (
                <button
                  onClick={() => {
                    const st = viewStudentModal;
                    setViewStudentModal(null);
                    setRejectReasonModal({ student: st, reason: '' });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200"
                >
                  Reject Student
                </button>
              )}

              {(viewStudentModal.status === 'APPROVED' || viewStudentModal.status === 'ACTIVE') && (
                <button
                  onClick={() => {
                    const st = viewStudentModal;
                    setViewStudentModal(null);
                    setSuspendConfirmStudent(st);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100"
                >
                  Suspend Student
                </button>
              )}

              <button
                onClick={() => setViewStudentModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CONFIRM APPROVE (Requirement 8) */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={!!approveConfirmStudent}
        onClose={() => setApproveConfirmStudent(null)}
        onConfirm={() => approveConfirmStudent && handleApproveStudent(approveConfirmStudent.id)}
        title="Approve this student account?"
        message={`Are you sure you want to approve student ${approveConfirmStudent?.name} (ID: ${approveConfirmStudent?.studentId})? The student will receive an instant WebSocket notification and gain full portal access.`}
        confirmText="Yes, Approve Student"
        isDanger={false}
      />

      {/* ========================================================================= */}
      {/* MODAL 3: REJECT WITH REASON (Requirement 9) */}
      {/* ========================================================================= */}
      {rejectReasonModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900">
              Reject Registration: {rejectReasonModal.student.name}
            </h3>
            <p className="text-xs text-neutral-500">
              Please provide a reason for rejection. The student will safely view this reason when attempting to log in.
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                rows={3}
                required
                value={rejectReasonModal.reason}
                onChange={(e) =>
                  setRejectReasonModal({ ...rejectReasonModal, reason: e.target.value })
                }
                placeholder="e.g. Student ID could not be verified in college registry."
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setRejectReasonModal(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectStudent}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONFIRM SUSPEND */}
      {/* ========================================================================= */}
      <ConfirmModal
        isOpen={!!suspendConfirmStudent}
        onClose={() => setSuspendConfirmStudent(null)}
        onConfirm={() => suspendConfirmStudent && handleSuspendStudent(suspendConfirmStudent.id)}
        title="Suspend Student Account"
        message={`Are you sure you want to suspend student ${suspendConfirmStudent?.name}? The student will immediately be blocked from logging into CampusFind.`}
        confirmText="Yes, Suspend Account"
        isDanger={true}
      />

      {/* ========================================================================= */}
      {/* MODAL 5: LOCATION ADD/EDIT (Requirement 15) */}
      {/* ========================================================================= */}
      {locationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900">
              {locationModal.id ? 'Edit Campus Location' : 'Add New Campus Location'}
            </h3>
            <form onSubmit={handleSaveLocation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Location Name *
                </label>
                <input
                  type="text"
                  required
                  value={locationModal.name || ''}
                  onChange={(e) => setLocationModal({ ...locationModal, name: e.target.value })}
                  placeholder="e.g. Science Block, Canteen, Library..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Location Code
                  </label>
                  <input
                    type="text"
                    value={locationModal.code || ''}
                    onChange={(e) => setLocationModal({ ...locationModal, code: e.target.value })}
                    placeholder="e.g. SB, CAN, LIB"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Campus Zone
                  </label>
                  <input
                    type="text"
                    value={locationModal.zone || ''}
                    onChange={(e) => setLocationModal({ ...locationModal, zone: e.target.value })}
                    placeholder="e.g. Academic Zone"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={locationModal.description || ''}
                  onChange={(e) => setLocationModal({ ...locationModal, description: e.target.value })}
                  placeholder="Describe location boundaries, landmarks, rooms..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="locActive"
                  checked={locationModal.active !== false}
                  onChange={(e) => setLocationModal({ ...locationModal, active: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="locActive" className="text-xs font-medium text-neutral-700">
                  Active (available for students in lost/found reports)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setLocationModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLocation}
                  className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl shadow-sm"
                >
                  {savingLocation ? 'Saving...' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
