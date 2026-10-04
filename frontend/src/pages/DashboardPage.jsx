import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  FileText,
  Search,
  Sparkles,
  ShieldCheck,
  Bell,
  PlusCircle,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Flame,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { lastEvent, notifications } = useNotifications();
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, matchesRes] = await Promise.allSettled([
        API.get('/items/dashboard/stats'),
        API.get('/matches'),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      }
      if (matchesRes.status === 'fulfilled') {
        setMatches(matchesRes.value.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, lastEvent]);

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Welcome to Campus<span className="text-primary">Find</span>{user?.name ? `, ${user.name}` : ''}!
              </h1>
              {user?.studentId && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-primary-dark font-bold">
                  {user.studentId}
                </span>
              )}
              {user?.department && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                  {user.department}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Your campus Lost & Found dashboard.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/report-lost"
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary-dark shadow-sm shadow-orange-500/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-green-600" />
              Report Found Item
            </Link>
            <Link
              to="/browse"
              className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-neutral-600" />
              Browse Campus Items
            </Link>
          </div>
        </div>

        {/* 5 Required Dashboard Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1: My Lost Reports */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200 card-shadow flex flex-col justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider block mb-1">
              My Lost Reports
            </span>
            <div className="text-3xl font-extrabold text-neutral-900 mt-2">
              {loading ? '...' : stats?.lostItems ?? 0}
            </div>
            <Link
              to="/my-reports?tab=lost"
              className="text-[11px] font-semibold text-primary hover:underline mt-3 block"
            >
              View lost reports &rarr;
            </Link>
          </div>

          {/* Card 2: My Found Reports */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200 card-shadow flex flex-col justify-between">
            <span className="text-xs font-semibold text-green-700 uppercase tracking-wider block mb-1">
              My Found Reports
            </span>
            <div className="text-3xl font-extrabold text-neutral-900 mt-2">
              {loading ? '...' : stats?.foundItems ?? 0}
            </div>
            <Link
              to="/my-reports?tab=found"
              className="text-[11px] font-semibold text-green-700 hover:underline mt-3 block"
            >
              View found reports &rarr;
            </Link>
          </div>

          {/* Card 3: Potential Matches */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200 card-shadow flex flex-col justify-between">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider block mb-1">
              Potential Matches
            </span>
            <div className="text-3xl font-extrabold text-primary mt-2">
              {loading ? '...' : stats?.matchedItems ?? matches.length}
            </div>
            <Link
              to="/matches"
              className="text-[11px] font-semibold text-primary hover:underline mt-3 block"
            >
              Check match scores &rarr;
            </Link>
          </div>

          {/* Card 4: Recovered Items */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200 card-shadow flex flex-col justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block mb-1">
              Recovered Items
            </span>
            <div className="text-3xl font-extrabold text-purple-700 mt-2">
              {loading ? '...' : stats?.returnedItems ?? 0}
            </div>
            <span className="text-[11px] font-medium text-neutral-400 mt-3 block">
              Successful recoveries
            </span>
          </div>

          {/* Card 5: Live Campus Alerts */}
          <div className="bg-white p-5 rounded-3xl border border-neutral-200 card-shadow flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block mb-1">
              Live Campus Alerts
            </span>
            <div className="text-3xl font-extrabold text-amber-600 mt-2">
              {loading ? '...' : stats?.unreadNotifications ?? 0}
            </div>
            <Link
              to="/notifications"
              className="text-[11px] font-semibold text-amber-700 hover:underline mt-3 block"
            >
              Open notifications &rarr;
            </Link>
          </div>
        </div>

        {/* 3 Widgets: Recent Reports, Recent Matches, Recent Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reports Widget */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Recent Reports
              </h3>
              <Link to="/my-reports" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="flex-1 space-y-2.5">
              {!stats?.recentReports || stats.recentReports.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  <Compass className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  No reports filed yet.
                </div>
              ) : (
                stats.recentReports.slice(0, 4).map((r) => (
                  <Link
                    key={r.id}
                    to={`/items/${r.id}`}
                    className="p-3 rounded-2xl bg-neutral-50 hover:bg-orange-50/50 transition-colors flex items-center justify-between block group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-primary line-clamp-1">
                        {r.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {r.category} • {r.location || r.campusLocation}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        r.type === 'LOST'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {r.type}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Potential Matches Widget */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Recent Matches
              </h3>
              <Link to="/matches" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="flex-1 space-y-2.5">
              {matches.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  No potential matches yet.
                </div>
              ) : (
                matches.map((m) => (
                  <Link
                    key={m.id}
                    to={`/matches/${m.id}`}
                    className="p-3 rounded-2xl bg-orange-50/50 hover:bg-orange-50 transition-colors flex items-center justify-between block group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 group-hover:text-primary line-clamp-1">
                        {m.foundItem?.title || m.lostItem?.title}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-0.5">
                        Location: {m.foundItem?.location || m.lostItem?.location}
                      </p>
                    </div>
                    <span className="text-[11px] font-extrabold text-primary bg-white px-2 py-0.5 rounded-lg border border-orange-200 shadow-xs">
                      {m.matchScore}%
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Campus Alerts Widget */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                Recent Alerts
              </h3>
              <Link to="/notifications" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="flex-1 space-y-2.5">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                  No alerts currently.
                </div>
              ) : (
                notifications.slice(0, 4).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-2xl text-xs ${
                      n.isRead ? 'bg-neutral-50' : 'bg-orange-50/70 border border-orange-100'
                    }`}
                  >
                    <h5 className="font-bold text-neutral-900 truncate">{n.title}</h5>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
