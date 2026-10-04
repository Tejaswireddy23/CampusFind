import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  AlertTriangle,
  Flame,
  Info,
  Clock,
  Sparkles,
  Building,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

const CampusAlertsPage = () => {
  const { lastEvent } = useNotifications();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('ALL');

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/campus-alerts');
      setAlerts(res.data.content || []);
    } catch (err) {
      console.error('Error fetching campus alerts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts, lastEvent]);

  const filteredAlerts = alerts.filter((a) => {
    if (filterPriority === 'ALL') return true;
    return a.priority === filterPriority;
  });

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Campus Alerts & Announcements
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Official campus lost & found broadcasts, emergency recovery bulletins, and targeted notifications.
            </p>
          </div>

          <button
            onClick={fetchAlerts}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'URGENT', 'IMPORTANT', 'NORMAL'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterPriority === p
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              {p === 'ALL'
                ? 'All Broadcasts'
                : p === 'URGENT'
                ? '🚨 Urgent'
                : p === 'IMPORTANT'
                ? '⚠️ Important'
                : '📢 Normal'}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white p-6 rounded-3xl border border-neutral-200 animate-pulse space-y-3"
              >
                <div className="h-4 bg-neutral-100 rounded w-1/3"></div>
                <div className="h-3 bg-neutral-100 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-neutral-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-800">No active alerts</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              There are currently no active campus announcements matching this priority.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => {
              const isUrgent = alert.priority === 'URGENT';
              const isImportant = alert.priority === 'IMPORTANT';

              return (
                <div
                  key={alert.id}
                  className={`bg-white p-6 sm:p-7 rounded-3xl border card-shadow transition-all relative overflow-hidden ${
                    isUrgent
                      ? 'border-red-300 shadow-red-500/5'
                      : isImportant
                      ? 'border-amber-300 shadow-amber-500/5'
                      : 'border-neutral-200'
                  }`}
                >
                  {/* Priority Accent Stripe */}
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                      isUrgent
                        ? 'bg-red-500'
                        : isImportant
                        ? 'bg-amber-500'
                        : 'bg-primary'
                    }`}
                  />

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isUrgent
                              ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                              : isImportant
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-blue-100 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {alert.priority}
                        </span>

                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">
                          {alert.category || 'General'}
                        </span>

                        {alert.targetAudience !== 'ALL STUDENTS' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-primary-dark border border-orange-200">
                            Target: {alert.targetAudience}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <h2 className="text-lg font-extrabold text-neutral-900 tracking-tight">
                      {alert.title}
                    </h2>

                    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                      {alert.message}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-100">
                      <span>Posted by: <strong className="text-neutral-600">{alert.createdBy || 'Campus Administration'}</strong></span>
                      {alert.department && <span>Department: {alert.department}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusAlertsPage;
