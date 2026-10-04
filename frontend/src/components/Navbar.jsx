import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  GraduationCap,
  Search,
  PlusCircle,
  Bell,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Layers,
  Sparkles,
  MapPin,
  CheckCheck,
  CheckCircle2,
  Inbox,
  FileText,
  Megaphone,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const notifDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotifClick = (n) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    setNotifDropdownOpen(false);
    if (n.link) {
      navigate(n.link);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Campus Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-dark to-primary flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-neutral-900 leading-none">
                  Campus<span className="text-primary">Find</span>
                </span>
                <span className="text-[10px] font-semibold text-neutral-400 tracking-wider uppercase mt-0.5">
                  Campus Lost & Found Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <Link
                to="/"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-primary bg-primary-light font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/browse"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/browse')
                    ? 'text-primary bg-primary-light font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Search className="w-4 h-4 mr-1.5" />
                Browse
              </Link>
              <Link
                to="/report-lost"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/report-lost')
                    ? 'text-primary bg-primary-light font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 mr-1.5 text-primary" />
                Report Lost
              </Link>
              <Link
                to="/report-found"
                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/report-found')
                    ? 'text-primary bg-primary-light font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-green-600" />
                Report Found
              </Link>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-primary bg-primary-light font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-reports"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/my-reports')
                      ? 'text-primary bg-primary-light font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  My Reports
                </Link>
                <Link
                  to="/matches"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/matches')
                      ? 'text-primary bg-primary-light font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  Matches
                </Link>
                <Link
                  to="/campus-alerts"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive('/campus-alerts')
                      ? 'text-primary bg-primary-light font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5 text-primary" />
                  Alerts
                </Link>
                <Link
                  to="/campus-map"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive('/campus-map')
                      ? 'text-primary bg-primary-light font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Map
                </Link>
                <Link
                  to="/messages"
                  title="Messages"
                  className={`p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors relative ${
                    isActive('/messages') ? 'text-primary bg-primary-light' : ''
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notification Bell with Dropdown */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    title="Notifications"
                    className={`p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors relative focus:outline-none ${
                      notifDropdownOpen || isActive('/notifications')
                        ? 'text-primary bg-primary-light'
                        : ''
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-neutral-900">Campus Alerts</h4>
                          {unreadCount > 0 && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-primary-dark">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-neutral-400">
                            <Inbox className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotifClick(n)}
                              className={`p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                                n.isRead ? 'bg-white hover:bg-neutral-50' : 'bg-orange-50/60 hover:bg-orange-50/90'
                              }`}
                            >
                              <div className="p-2 rounded-xl bg-neutral-100 shrink-0 mt-0.5">
                                <Sparkles className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-neutral-900 truncate">
                                  {n.title}
                                </h5>
                                <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                                  {n.message}
                                </p>
                                <span className="text-[10px] text-neutral-400 mt-1 block">
                                  {new Date(n.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {!n.isRead && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></span>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-neutral-100 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs font-bold text-primary hover:underline block py-1"
                        >
                          View all campus alerts &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <Link
                    to="/admin/reports"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-sm ml-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-primary" />
                    Admin Reports
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative ml-2" ref={profileDropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full border border-neutral-200 hover:border-primary/50 transition-colors focus:outline-none"
                  >
                    <img
                      src={
                        user?.avatarUrl ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Student'}`
                      }
                      alt={user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-fadeIn">
                      <div className="px-4 py-2.5 border-b border-neutral-100">
                        <p className="text-sm font-bold text-neutral-900 truncate">{user?.name}</p>
                        <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                        {user?.studentId && (
                          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-primary-dark">
                            ID: {user.studentId}
                          </span>
                        )}
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2.5 text-neutral-400" />
                        Student Profile
                      </Link>

                      <Link
                        to="/my-reports"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <FileText className="w-4 h-4 mr-2.5 text-neutral-400" />
                        My Reports
                      </Link>

                      <Link
                        to="/account-status"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2.5 text-primary" />
                        Account Status
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2.5 text-primary" />
                          Admin Command Center
                        </Link>
                      )}

                      <div className="border-t border-neutral-100 mt-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/account-status"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors hidden sm:inline-block"
                >
                  Status Check
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-md shadow-orange-500/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
            }`}
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/browse') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
            }`}
          >
            Browse Campus Items
          </Link>
          <Link
            to="/report-lost"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/report-lost') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
            }`}
          >
            Report Lost Item
          </Link>
          <Link
            to="/report-found"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/report-found') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
            }`}
          >
            Report Found Item
          </Link>

          {isAuthenticated ? (
            <>
              <div className="border-t border-neutral-100 pt-2"></div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/dashboard') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/my-reports"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/my-reports') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                My Reports
              </Link>
              <Link
                to="/matches"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/matches') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                Matches
              </Link>
              <Link
                to="/messages"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/messages') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                Messages
              </Link>
              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/notifications') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                Campus Alerts ({unreadCount})
              </Link>
              <Link
                to="/campus-alerts"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/campus-alerts') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                Campus Alerts
              </Link>
              <Link
                to="/campus-map"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/campus-map') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                Campus Map & Report Hotspots
              </Link>
              <Link
                to="/account-status"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/account-status') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                Registration & Account Status
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive('/profile') ? 'text-primary bg-primary-light font-bold' : 'text-neutral-700'
                }`}
              >
                Student Profile ({user?.studentId || user?.email})
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-bold bg-neutral-900 text-white"
                >
                  Admin Command Center
                </Link>
              )}

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-neutral-100 pt-3 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-800"
              >
                Student Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-md"
              >
                Register as Student
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
