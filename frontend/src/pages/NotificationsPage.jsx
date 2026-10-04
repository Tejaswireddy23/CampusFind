import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';
import {
  Bell,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Gift,
  MessageSquare,
  Clock,
  Inbox,
  Filter,
  Check,
  Trash2,
  Sliders,
  Save,
  X,
  MapPin,
  Tag,
  AlertCircle,
  Volume2,
} from 'lucide-react';

const TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'MATCH', label: 'Matches' },
  { key: 'MESSAGE', label: 'Messages' },
  { key: 'CLAIM', label: 'Claims' },
  { key: 'RECOVERY', label: 'Recovery' },
  { key: 'ADMIN', label: 'Admin' },
  { key: 'SYSTEM', label: 'System' },
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

const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ALL');
  const [prefModalOpen, setPrefModalOpen] = useState(false);

  // Alert preferences
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [prefEnabled, setPrefEnabled] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [campusLocations, setCampusLocations] = useState(FALLBACK_LOCATIONS);
  const [categoriesList, setCategoriesList] = useState(FALLBACK_CATEGORIES);
  const [browserPermission, setBrowserPermission] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  // Fetch campus metadata & alert preferences
  useEffect(() => {
    const fetchMetadataAndPrefs = async () => {
      try {
        const [locRes, catRes, prefRes] = await Promise.all([
          API.get('/campus-locations').catch(() => ({ data: [] })),
          API.get('/categories').catch(() => ({ data: [] })),
          API.get('/alert-preferences').catch(() => ({ data: null })),
        ]);

        if (locRes.data && locRes.data.length > 0) setCampusLocations(locRes.data.map((l) => l.name));
        if (catRes.data && catRes.data.length > 0) setCategoriesList(catRes.data.map((c) => c.name));

        if (prefRes.data) {
          setSelectedCategories(prefRes.data.categories || []);
          setSelectedLocations(prefRes.data.locations || []);
          setPrefEnabled(prefRes.data.enabled !== false);
        }
      } catch (err) {
        console.error('Error fetching alert preferences metadata:', err);
      }
    };
    fetchMetadataAndPrefs();
  }, []);

  const requestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setBrowserPermission(res);
      if (res === 'granted') {
        success('Browser notifications enabled! You will receive live desktop alerts.');
      } else {
        toastError('Browser notifications were blocked or dismissed.');
      }
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      await API.put('/alert-preferences', {
        categories: selectedCategories,
        locations: selectedLocations,
        enabled: prefEnabled,
        emailAlerts: true,
        pushAlerts: true,
      });
      success('Campus alert preferences saved successfully.');
      setPrefModalOpen(false);
    } catch (err) {
      toastError('Failed to save alert preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleLocation = (loc) => {
    setSelectedLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const getIcon = (type) => {
    switch (type) {
      case 'MATCH':
      case 'MATCH_ALERT':
        return <Sparkles className="w-5 h-5 text-primary" />;
      case 'CLAIM':
      case 'CLAIM_SUBMITTED':
        return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'CLAIM_APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'CLAIM_REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'RECOVERY':
      case 'RETURNED':
        return <Gift className="w-5 h-5 text-emerald-600" />;
      case 'MESSAGE':
        return <MessageSquare className="w-5 h-5 text-amber-500" />;
      case 'ADMIN':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'GEOFENCE_ALERT':
      case 'SYSTEM':
      default:
        return <Bell className="w-5 h-5 text-neutral-500" />;
    }
  };

  const matchesTab = (notif, tabKey) => {
    if (tabKey === 'ALL') return true;
    if (tabKey === 'MATCH') return notif.type === 'MATCH' || notif.type === 'MATCH_ALERT';
    if (tabKey === 'MESSAGE') return notif.type === 'MESSAGE';
    if (tabKey === 'CLAIM') {
      return (
        notif.type === 'CLAIM' ||
        notif.type === 'CLAIM_SUBMITTED' ||
        notif.type === 'CLAIM_APPROVED' ||
        notif.type === 'CLAIM_REJECTED' ||
        notif.type === 'INFO_REQUESTED'
      );
    }
    if (tabKey === 'RECOVERY') return notif.type === 'RECOVERY' || notif.type === 'RETURNED';
    if (tabKey === 'ADMIN') return notif.type === 'ADMIN';
    if (tabKey === 'SYSTEM') return notif.type === 'SYSTEM' || notif.type === 'GEOFENCE_ALERT';
    return true;
  };

  const filteredNotifications = notifications.filter((n) => matchesTab(n, activeTab));

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-orange-100 text-primary">
                <Bell className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Campus Notification Center
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Live alerts for smart matches, claims, direct messages, and campus recovery updates.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPrefModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-4 h-4 text-primary" />
              Alert Preferences
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <CheckCheck className="w-4 h-4 text-primary" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Browser Notification Banner if not granted */}
        {browserPermission !== 'granted' && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-orange-950">
              <Volume2 className="w-5 h-5 text-primary shrink-0" />
              <span>
                <strong>Enable Browser Alerts:</strong> Receive instant "CampusFind — Potential Match Found" desktop alerts when a match or message arrives without refreshing.
              </span>
            </div>
            <button
              onClick={requestBrowserPermission}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-dark shrink-0"
            >
              Enable Notifications
            </button>
          </div>
        )}

        {/* Filter Tabs: MATCH, MESSAGE, CLAIM, RECOVERY, ADMIN, SYSTEM */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-neutral-200 card-shadow overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const count = notifications.filter((n) => matchesTab(n, tab.key)).length;
            const unreadInTab = notifications.filter((n) => matchesTab(n, tab.key) && !n.isRead).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-sm shadow-orange-500/20'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-white/20 text-white'
                      : unreadInTab > 0
                      ? 'bg-orange-100 text-primary-dark font-extrabold'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 card-shadow">
            <Inbox className="w-14 h-14 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-800">
              No {activeTab === 'ALL' ? '' : activeTab} notifications
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              You are all caught up! Live campus alerts will appear here automatically via WebSocket.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-neutral-200 card-shadow overflow-hidden divide-y divide-neutral-100">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 sm:p-5 flex items-start gap-4 cursor-pointer transition-colors group ${
                  notif.isRead
                    ? 'bg-white hover:bg-neutral-50/70'
                    : 'bg-orange-50/40 hover:bg-orange-50/70'
                }`}
              >
                <div className="p-2.5 rounded-2xl bg-neutral-100/80 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-neutral-900">{notif.title}</h4>
                    <span className="text-[11px] text-neutral-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleDateString()}{' '}
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-1">
                    {notif.link ? (
                      <span className="text-[11px] font-bold text-primary hover:underline">
                        View Match / Details &rarr;
                      </span>
                    ) : (
                      <span></span>
                    )}

                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-neutral-200 shadow-xs"
                        >
                          <Check className="w-3 h-3 text-primary" />
                          Mark read
                        </button>
                      )}

                      {/* Delete notification */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notif.id);
                        }}
                        className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {!notif.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campus Alert Preferences Modal */}
      {prefModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-neutral-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-orange-100 text-primary">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">
                    Campus Alert Preferences
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Choose which item categories and campus zones you want prioritized alerts for.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPrefModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePreferences} className="space-y-5">
              {/* Enabled Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">Personalized Campus Alerts</span>
                  <span className="text-[11px] text-neutral-500">Receive alerts when items matching your saved preferences are reported</span>
                </div>
                <input
                  type="checkbox"
                  checked={prefEnabled}
                  onChange={(e) => setPrefEnabled(e.target.checked)}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
              </div>

              {/* Categories of Interest */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary" />
                  Categories You Care About
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categoriesList.map((cat) => (
                    <label
                      key={cat}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        selectedCategories.includes(cat)
                          ? 'border-orange-300 bg-orange-50/70 text-primary-dark'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="truncate">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Campus Locations of Interest */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Campus Locations You Frequent
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {campusLocations.map((loc) => (
                    <label
                      key={loc}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors ${
                        selectedLocations.includes(loc)
                          ? 'border-orange-300 bg-orange-50/70 text-primary-dark'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc)}
                        onChange={() => toggleLocation(loc)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <span className="truncate">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setPrefModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPrefs}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingPrefs ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
