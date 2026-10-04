import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import {
  GraduationCap,
  Search,
  PlusCircle,
  Sparkles,
  MapPin,
  ShieldCheck,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle2,
  FileText,
  Users,
  Compass,
  Lock,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const res = await API.get('/items?size=6&sort=newest');
        const items = res.data.content || res.data || [];
        setRecentItems(items);
      } catch (err) {
        console.error('Failed to load recent items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentItems();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Campus Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white py-16 sm:py-24 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Campus Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200/60 text-primary-dark text-xs sm:text-sm font-bold mb-6 shadow-sm">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>Campus-Restricted Student Portal</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight leading-tight">
            Lost Something on Campus? <br className="hidden sm:inline" />
            <span className="text-primary bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              CampusFind Can Help.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            Report lost items, register found belongings, discover potential matches, and receive real-time campus alerts.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              to="/report-lost"
              className="px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </Link>

            <Link
              to="/report-found"
              className="px-6 py-3.5 rounded-2xl text-sm font-bold text-neutral-900 bg-white border-2 border-neutral-200 hover:border-primary hover:text-primary transition-all shadow-sm flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4 text-green-600" />
              Report Found Item
            </Link>

            <Link
              to="/browse"
              className="px-6 py-3.5 rounded-2xl text-sm font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 transition-all flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-neutral-600" />
              Browse Campus Items
            </Link>
          </div>

          {/* Mini Stats Banner */}
          <div className="mt-12 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-3xl bg-white/80 backdrop-blur-md border border-neutral-200/80 shadow-md">
            <div>
              <span className="text-2xl font-extrabold text-neutral-900 block">14+</span>
              <span className="text-xs text-neutral-500 font-medium">Campus Locations</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-primary block">100%</span>
              <span className="text-xs text-neutral-500 font-medium">Student Verified</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-green-600 block">Real-time</span>
              <span className="text-xs text-neutral-500 font-medium">Match Alerts</span>
            </div>
            <div>
              <span className="text-2xl font-extrabold text-neutral-900 block">Secure</span>
              <span className="text-xs text-neutral-500 font-medium">Contact Workflow</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-neutral-50/60 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Campus Recovery Process
            </span>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-3">
              How It Works
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              Five streamlined steps designed for student life and fast item recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Step 1: Report */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow text-center relative group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-extrabold text-lg mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-neutral-900">Report</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Submit details of what you lost or found, selecting the exact campus location.
              </p>
            </div>

            {/* Step 2: Search */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow text-center relative group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-extrabold text-lg mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-neutral-900">Search</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Filter across campus zones, categories, dates, and item keywords.
              </p>
            </div>

            {/* Step 3: Match */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow text-center relative group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-extrabold text-lg mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-neutral-900">Match</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Our smart campus engine correlates lost and found reports automatically.
              </p>
            </div>

            {/* Step 4: Get Alert */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow text-center relative group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-extrabold text-lg mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-neutral-900">Get Alert</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Receive instant notifications when an item matching yours is registered.
              </p>
            </div>

            {/* Step 5: Recover */}
            <div className="bg-white p-6 rounded-3xl border border-neutral-200 card-shadow text-center relative group hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-green-100 text-green-700 flex items-center justify-center font-extrabold text-lg mb-4">
                5
              </div>
              <h3 className="text-base font-bold text-neutral-900">Recover</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Connect securely with the finder and hand over your belongings safely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Campus Highlights
            </span>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-3">
              Platform Features
            </h2>
            <p className="text-sm text-neutral-500 mt-2">
              Engineered exclusively for academic institutions and student communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl border border-neutral-200 bg-white card-shadow hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mb-5">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Campus-Only Reports</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Only verified students with valid college email and Student ID can report or view items. Zero external spam.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-200 bg-white card-shadow hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Smart Matching</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Automatically calculates match confidence across Category, Brand, Model, Color, and Campus Location.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-200 bg-white card-shadow hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mb-5">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Live Alerts</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Real-time WebSocket alerts notify you immediately when someone finds an item matching your lost report.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-200 bg-white card-shadow hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mb-5">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Secure Student Access</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Strict privacy architecture. Phone numbers and emails are never exposed publicly; communication stays internal.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-200 bg-white card-shadow hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">Easy Recovery</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Contact the finder with one click to arrange a safe on-campus handover at the Security Booth or Library.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-neutral-200 bg-white card-shadow hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-5">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">14 Predefined Zones</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                From Library and Canteen to Computer Block and Lab, items are catalogued by campus location for accurate recovery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Campus Reports Preview */}
      <section className="py-16 bg-neutral-50/50 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                Recent Campus Listings
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                Latest lost and found items reported by fellow students.
              </p>
            </div>

            <Link
              to="/browse"
              className="text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 group"
            >
              View all listings
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-3xl bg-neutral-100 animate-pulse"></div>
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-neutral-200 text-neutral-400">
              No recent campus items reported yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/items/${item.id}`)}
                  className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden card-shadow hover:shadow-lg hover:border-primary/40 transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-44 bg-neutral-100 relative overflow-hidden">
                    <img
                      src={
                        item.imageUrl ||
                        'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'
                      }
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm ${
                          item.type === 'LOST'
                            ? 'bg-primary text-white'
                            : 'bg-green-600 text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-neutral-800 shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-500 mt-1.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
                      <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{item.location || item.campusLocation || 'Campus'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.dateLostOrFound || 'Recent'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
