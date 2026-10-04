import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Gift,
  Edit2,
  Save,
  Award,
  Lock,
  GraduationCap,
  Building,
  Hash,
  BookOpen,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [year, setYear] = useState(user?.year || '1st Year');
  const [section, setSection] = useState(user?.section || 'A');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  const handleStartEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setDepartment(user?.department || '');
    setYear(user?.year || '1st Year');
    setSection(user?.section || 'A');
    setAvatarUrl(user?.avatarUrl || '');
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/users/profile', {
        name,
        phone,
        department,
        year,
        section,
        avatarUrl,
      });
      success('Student profile updated successfully!');
      setIsEditing(false);
      refreshProfile();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update student profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-[90vh] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-100 text-primary">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Student Profile
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Institutional credentials, campus department details, and lost & found recovery activity.
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 card-shadow space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-neutral-100">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <img
                src={
                  user?.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'Student'}`
                }
                alt={user?.name}
                className="w-24 h-24 rounded-3xl object-cover border-2 border-orange-100 shadow-md"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">{user?.name}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 text-primary font-bold">
                    {user?.role || 'STUDENT'}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 flex items-center justify-center sm:justify-start gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {user?.email}
                </p>

                {user?.studentId && (
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1 text-xs font-bold text-neutral-700">
                    <span className="px-2 py-0.5 bg-neutral-100 rounded-md border border-neutral-200">
                      ID: {user.studentId}
                    </span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center gap-1 text-[10px]">
                      <ShieldCheck className="w-3 h-3 text-green-600" /> Verified Campus Student
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-neutral-200 hover:bg-neutral-50 text-neutral-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Edit2 className="w-3.5 h-3.5 text-primary" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <form onSubmit={handleSave} className="py-6 border-b border-neutral-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Update Profile Fields</h3>
                <span className="text-[11px] text-neutral-400">
                  * Student ID and College Email are institutional records and locked.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Section</label>
                  <input
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. A"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-dark shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Academic & Campus Details Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
              Campus Academic Record
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium">
                  <Building className="w-4 h-4 text-primary" />
                  <span>Department</span>
                </div>
                <p className="mt-1 font-bold text-sm text-neutral-900">
                  {user?.department || 'Not specified'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Year of Study</span>
                </div>
                <p className="mt-1 font-bold text-sm text-neutral-900">
                  {user?.year || 'Not specified'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                <div className="flex items-center gap-2 text-neutral-500 text-xs font-medium">
                  <Hash className="w-4 h-4 text-primary" />
                  <span>Section</span>
                </div>
                <p className="mt-1 font-bold text-sm text-neutral-900">
                  {user?.section ? `Section ${user.section}` : 'Not specified'}
                </p>
              </div>
            </div>

            {/* Institutional Security Notice */}
            <div className="mt-4 p-3.5 rounded-2xl bg-neutral-100/70 border border-neutral-200 flex items-start gap-2.5 text-xs text-neutral-600">
              <Lock className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <p>
                <strong>Institutional Security Notice:</strong> Student ID (<strong>{user?.studentId || 'N/A'}</strong>) and verified college email (<strong>{user?.email}</strong>) are tied to campus enrollment records and cannot be altered directly. For corrections, contact the campus registrar or portal administrator.
              </p>
            </div>
          </div>

          {/* Campus Helper System & Contribution Statistics (Requirement 20) */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Campus Helper System & Contribution Record
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Statistics and merit badges are awarded exclusively through verified dual-confirmation item recoveries.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-primary-dark">
                Verified System
              </span>
            </div>

            {/* 4 Required Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                <span className="text-xs text-neutral-500 font-medium block">Items Reported</span>
                <span className="text-2xl font-black text-neutral-900 mt-1 block">
                  {user?.reportsCount ?? 0}
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5 block">Lost & Found listings</span>
              </div>

              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200">
                <span className="text-xs text-primary-dark font-medium block">Items Found</span>
                <span className="text-2xl font-black text-primary mt-1 block">
                  {user?.itemsFoundCount ?? 0}
                </span>
                <span className="text-[10px] text-orange-600/70 mt-0.5 block">Reported as found</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-800 font-medium block">Items Returned</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">
                  {user?.returnedCount ?? 0}
                </span>
                <span className="text-[10px] text-emerald-600 mt-0.5 block">Handed back to owner</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-xs text-purple-800 font-medium block">Successful Recoveries</span>
                <span className="text-2xl font-black text-purple-700 mt-1 block">
                  {user?.recoveredCount ?? 0}
                </span>
                <span className="text-[10px] text-purple-600 mt-0.5 block">Recovered by you</span>
              </div>
            </div>

            {/* Merit Badges (Requirement 20) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/60 via-amber-50/40 to-neutral-50 border border-orange-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                  Earned Campus Recognition Badges
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Badge 1: Helpful Student */}
                {(() => {
                  const totalHelped = (user?.returnedCount || 0) + (user?.recoveredCount || 0);
                  const isEarned = totalHelped >= 1;
                  return (
                    <div
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                        isEarned
                          ? 'bg-white border-amber-300 shadow-sm'
                          : 'bg-neutral-100/60 border-neutral-200 opacity-60'
                      }`}
                    >
                      <div className="text-2xl">🥉</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-neutral-900">Helpful Student</h5>
                          {isEarned && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              EARNED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          1+ verified item recovery
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Badge 2: Campus Helper */}
                {(() => {
                  const totalHelped = (user?.returnedCount || 0) + (user?.recoveredCount || 0);
                  const isEarned = totalHelped >= 3;
                  return (
                    <div
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                        isEarned
                          ? 'bg-white border-slate-300 shadow-sm'
                          : 'bg-neutral-100/60 border-neutral-200 opacity-60'
                      }`}
                    >
                      <div className="text-2xl">🥈</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-neutral-900">Campus Helper</h5>
                          {isEarned && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                              EARNED
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          3+ verified item recoveries
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Badge 3: Lost & Found Champion */}
                {(() => {
                  const totalHelped = (user?.returnedCount || 0) + (user?.recoveredCount || 0);
                  const isEarned = totalHelped >= 5;
                  return (
                    <div
                      className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                        isEarned
                          ? 'bg-white border-yellow-400 shadow-sm ring-2 ring-yellow-200'
                          : 'bg-neutral-100/60 border-neutral-200 opacity-60'
                      }`}
                    >
                      <div className="text-2xl">🥇</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-neutral-900">Lost & Found Champion</h5>
                          {isEarned && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-yellow-100 text-yellow-800">
                              TOP HONORS
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          5+ verified item recoveries
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
