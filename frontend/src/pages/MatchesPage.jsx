import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Calendar,
  Compass,
  Inbox,
  Bookmark,
  BookmarkCheck,
  EyeOff,
  Filter,
} from 'lucide-react';

const MatchesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState('ALL'); // 'ALL' or 'SAVED'

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const url = viewFilter === 'SAVED' ? '/matches?savedOnly=true' : '/matches';
      const res = await API.get(url);
      setMatches(res.data || []);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [viewFilter]);

  const handleToggleSave = async (e, matchId) => {
    e.stopPropagation();
    try {
      const res = await API.put(`/matches/${matchId}/save`);
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, isSaved: res.data.isSaved } : m))
      );
      success(res.data.isSaved ? 'Match saved!' : 'Match removed from saved.');
    } catch (err) {
      toastError('Could not update saved status.');
    }
  };

  const handleDismiss = async (e, matchId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to dismiss this match? The item itself will NOT be deleted.')) {
      return;
    }
    try {
      await API.put(`/matches/${matchId}/dismiss`);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      success('Match dismissed.');
    } catch (err) {
      toastError('Failed to dismiss match.');
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-primary-dark text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Smart Matching Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Potential Matches
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Real-time algorithmically identified potential matches between Lost and Found reports.
            </p>
          </div>

          {/* Filter Tabs: All vs Saved */}
          <div className="flex bg-white p-1 rounded-2xl border border-neutral-200 card-shadow self-start">
            <button
              onClick={() => setViewFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                viewFilter === 'ALL'
                  ? 'bg-primary text-white shadow-sm shadow-orange-500/20'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setViewFilter('SAVED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewFilter === 'SAVED'
                  ? 'bg-primary text-white shadow-sm shadow-orange-500/20'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-white rounded-3xl animate-pulse border border-neutral-200"
              ></div>
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 card-shadow">
            <Inbox className="w-14 h-14 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-800">
              {viewFilter === 'SAVED' ? 'No saved matches' : 'No potential matches found'}
            </h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              {viewFilter === 'SAVED'
                ? 'Save matches you want to keep an eye on by clicking the bookmark icon.'
                : 'When new reports closely match your items, they will automatically appear here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((m) => {
              const displayItem = user && m.lostItem.userId === user.id ? m.foundItem : m.lostItem;
              const matchingAttributes = m.matchingAttributes || m.explanation?.matchingAttributes || [];

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl border border-neutral-200 overflow-hidden card-shadow hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Item Image with Match Score Badge */}
                    <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                      <img
                        src={
                          displayItem.imageUrl ||
                          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500'
                        }
                        alt={displayItem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-md shadow-orange-500/30 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {m.matchScore}% Potential Match
                      </div>

                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleToggleSave(e, m.id)}
                          title={m.isSaved ? 'Unsave' : 'Save'}
                          className={`p-2 rounded-xl backdrop-blur-md transition-colors ${
                            m.isSaved
                              ? 'bg-orange-500 text-white'
                              : 'bg-white/80 text-neutral-700 hover:bg-white'
                          }`}
                        >
                          {m.isSaved ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDismiss(e, m.id)}
                          title="Dismiss Match"
                          className="p-2 rounded-xl bg-white/80 hover:bg-white text-neutral-600 hover:text-red-600 backdrop-blur-md transition-colors"
                        >
                          <EyeOff className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase shadow-sm ${
                            displayItem.type === 'LOST'
                              ? 'bg-red-500 text-white'
                              : 'bg-green-600 text-white'
                          }`}
                        >
                          {displayItem.type} ITEM
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                          {displayItem.category}
                        </span>
                        <h3 className="text-base font-bold text-neutral-900 group-hover:text-primary transition-colors line-clamp-1">
                          {displayItem.title}
                        </h3>
                      </div>

                      <div className="space-y-1.5 text-xs text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{displayItem.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span>{displayItem.dateLostOrFound}</span>
                        </div>
                      </div>

                      {/* Matching attributes tags (✓) */}
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase block mb-1.5">
                          Matching Attributes:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {matchingAttributes.length > 0 ? (
                            matchingAttributes.slice(0, 3).map((attr, idx) => (
                              <span
                                key={idx}
                                className="text-[11px] font-medium bg-orange-50 text-primary-dark border border-orange-200/60 px-2 py-0.5 rounded-lg flex items-center gap-1"
                              >
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                {attr}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-neutral-400 italic">
                              Multiple criteria match
                            </span>
                          )}
                          {matchingAttributes.length > 3 && (
                            <span className="text-[10px] text-neutral-400 font-semibold self-center">
                              +{matchingAttributes.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with "View Match" Button */}
                  <div className="p-5 pt-0">
                    <Link
                      to={`/matches/${m.id}`}
                      className="w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm text-center bg-primary hover:bg-primary-dark text-white shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                    >
                      <span>View Match</span>
                      <ArrowRight className="w-4 h-4 transition-transform" />
                    </Link>
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

export default MatchesPage;
