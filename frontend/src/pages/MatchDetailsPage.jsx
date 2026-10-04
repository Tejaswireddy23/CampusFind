import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ClaimModal from '../components/ClaimModal';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle,
  XCircle,
  ShieldCheck,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  EyeOff,
  MapPin,
  Calendar,
  Clock,
  Layers,
  Tag,
  AlertTriangle,
  Info,
} from 'lucide-react';

const MatchDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await API.get(`/matches/${id}`);
        setMatch(res.data);
      } catch (err) {
        toastError('Unable to load match details.');
        navigate('/matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id, navigate, toastError]);

  const handleDismiss = async () => {
    if (!window.confirm('Are you sure you want to dismiss this match? The item report will NOT be deleted.')) {
      return;
    }
    setActionLoading(true);
    try {
      await API.put(`/matches/${id}/dismiss`);
      success('Match dismissed. You can continue browsing other reports.');
      navigate('/matches');
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not dismiss match.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSave = async () => {
    setActionLoading(true);
    try {
      const res = await API.put(`/matches/${id}/save`);
      setMatch(res.data);
      success(res.data.isSaved ? 'Match saved to favorites.' : 'Match removed from saved.');
    } catch (err) {
      toastError('Could not update saved status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimSuccess = () => {
    success('Claim submitted successfully! Status: PENDING.');
    setMatch((prev) => (prev ? { ...prev, status: 'ACCEPTED' } : prev));
  };

  if (loading) {
    return (
      <div className="bg-neutral-50/50 min-h-[90vh] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-10 w-48 bg-neutral-200 animate-pulse rounded-xl"></div>
          <div className="h-64 bg-white border border-neutral-200 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!match) return null;

  const lost = match.lostItem;
  const found = match.foundItem;
  const isLostOwner = user && lost.userId === user.id;
  const isFoundReporter = user && found.userId === user.id;
  const partnerUser = isLostOwner ? { id: found.userId, name: 'Finder' } : { id: lost.userId, name: 'Reporter' };

  // Matching and non-matching attributes
  const matchingAttrs = match.matchingAttributes || match.explanation?.matchingAttributes || [];
  const nonMatchingAttrs = match.nonMatchingAttributes || match.explanation?.nonMatchingAttributes || [];

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation & Actions Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Matches
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleToggleSave}
              disabled={actionLoading}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                match.isSaved
                  ? 'bg-orange-50 border-orange-300 text-primary-dark font-bold'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {match.isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-primary" />
                  Saved Match
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 text-neutral-400" />
                  Save Match
                </>
              )}
            </button>

            <button
              onClick={handleDismiss}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-neutral-200 text-neutral-600 hover:text-red-600 hover:border-red-200 transition-colors flex items-center gap-1.5"
            >
              <EyeOff className="w-4 h-4" />
              Dismiss
            </button>
          </div>
        </div>

        {/* Hero Confidence Banner */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-2xl bg-orange-500 text-white font-extrabold text-lg sm:text-xl flex items-center gap-2 shadow-md shadow-orange-500/25">
                <Sparkles className="w-5 h-5" />
                {match.matchScore}% Potential Match
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                  match.status === 'ACCEPTED'
                    ? 'bg-blue-100 text-blue-700'
                    : match.status === 'DISMISSED'
                    ? 'bg-neutral-100 text-neutral-500'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                Status: {match.status}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium">
              Calculated using weighted similarity (Category 25%, Brand 15%, Model 15%, Color 10%, Location 15%, Date 10%, Description 10%).
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
              <span>
                <strong>Notice:</strong> This is a potential match, never a confirmed match. Always verify ownership using the claim verification flow.
              </span>
            </div>
          </div>

          {/* Direct Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isLostOwner && match.status !== 'CLOSED' && (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="px-5 py-3 rounded-2xl font-bold text-sm text-white bg-primary hover:bg-primary-dark shadow-md shadow-orange-500/25 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Claim This Item
              </button>
            )}

            <button
              onClick={() => navigate(`/messages?with=${partnerUser.id}&item=${found.id}`)}
              className="px-5 py-3 rounded-2xl font-bold text-sm text-neutral-800 bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center gap-2 shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              Contact Person
            </button>
          </div>
        </div>

        {/* Side-by-Side Detailed Comparison: LOST vs FOUND */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LOST ITEM */}
          <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden card-shadow flex flex-col">
            <div className="p-4 bg-red-50/70 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-xs font-bold text-red-800 uppercase tracking-wider">
                  LOST ITEM REPORT
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {isLostOwner ? '(Reported by You)' : 'Reported Lost'}
              </span>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="flex gap-4 items-start">
                <img
                  src={
                    lost.imageUrl ||
                    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400'
                  }
                  alt={lost.title}
                  className="w-28 h-28 rounded-2xl object-cover border border-neutral-200 shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                    {lost.title}
                  </h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                    {lost.category}
                  </span>
                  <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{lost.location}</span>
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Lost on {lost.dateLostOrFound}</span>
                  </div>
                </div>
              </div>

              {/* Attributes Table */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">Brand</span>
                  <span className="font-bold text-neutral-800">{lost.brand || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">Model</span>
                  <span className="font-bold text-neutral-800">{lost.model || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">Color</span>
                  <span className="font-bold text-neutral-800">{lost.color || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 font-medium">Approx. Time</span>
                  <span className="font-bold text-neutral-800">{lost.approximateTime || 'Unknown'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  {lost.description}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/items/${lost.id}`}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View full lost report &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* FOUND ITEM */}
          <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden card-shadow flex flex-col">
            <div className="p-4 bg-green-50/70 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span className="text-xs font-bold text-green-800 uppercase tracking-wider">
                  FOUND ITEM REPORT
                </span>
              </div>
              <span className="text-xs text-neutral-500">
                {isFoundReporter ? '(Reported by You)' : 'Reported Found'}
              </span>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="flex gap-4 items-start">
                <img
                  src={
                    found.imageUrl ||
                    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400'
                  }
                  alt={found.title}
                  className="w-28 h-28 rounded-2xl object-cover border border-neutral-200 shrink-0"
                />
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                    {found.title}
                  </h3>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-xs font-semibold">
                    {found.category}
                  </span>
                  <div className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{found.location}</span>
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Found on {found.dateLostOrFound}</span>
                  </div>
                </div>
              </div>

              {/* Attributes Table */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">Brand</span>
                  <span className="font-bold text-neutral-800">{found.brand || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">Model</span>
                  <span className="font-bold text-neutral-800">{found.model || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-200/60">
                  <span className="text-neutral-500 font-medium">Color</span>
                  <span className="font-bold text-neutral-800">{found.color || 'Not specified'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 font-medium">Approx. Time</span>
                  <span className="font-bold text-neutral-800">{found.approximateTime || 'Unknown'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
                  Description
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                  {found.description}
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to={`/items/${found.id}`}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  View full found report &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Match Explanation & Attribute Analysis Card */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 card-shadow space-y-6">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Match Explanation Breakdown
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Clear attribute comparison explaining how the {match.matchScore}% potential match score was calculated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matching Attributes (✓) */}
            <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200/60 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Matching Attributes ({matchingAttrs.length})
                </h3>
              </div>
              <ul className="space-y-2">
                {matchingAttrs.length > 0 ? (
                  matchingAttrs.map((attr, idx) => (
                    <li
                      key={idx}
                      className="text-xs font-medium text-neutral-800 flex items-center gap-2 bg-white/80 px-3 py-2 rounded-xl border border-orange-100"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <span>{attr}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-neutral-400 italic">No exact matches identified.</li>
                )}
              </ul>
            </div>

            {/* Non-Matching Attributes (✕) */}
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-neutral-400 text-white flex items-center justify-center font-bold text-xs">
                  ✕
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Non-Matching or Differing Attributes ({nonMatchingAttrs.length})
                </h3>
              </div>
              <ul className="space-y-2">
                {nonMatchingAttrs.length > 0 ? (
                  nonMatchingAttrs.map((attr, idx) => (
                    <li
                      key={idx}
                      className="text-xs font-medium text-neutral-700 flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-neutral-200"
                    >
                      <XCircle className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{attr}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-green-600 font-medium">
                    All evaluated primary attributes align.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Configurable Engine Weights Explanatory Footer */}
          <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500">
            <span className="font-semibold text-neutral-700">Algorithm Weights:</span>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-neutral-100">Category: 25%</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100">Brand: 15%</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100">Model: 15%</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100">Location: 15%</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100">Color: 10%</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100">Date: 10%</span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100">Description: 10%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        item={found}
        matchId={match.id}
        onClaimSuccess={handleClaimSuccess}
      />
    </div>
  );
};

export default MatchDetailsPage;
