import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Flag,
  UserCheck,
  Building2,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Sliders,
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'mentors' | 'organizations' | 'system'>('overview');

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [mentorsList, setMentorsList] = useState<any[]>([]);
  const [orgsData, setOrgsData] = useState<{ organizations: any[]; opportunities: any[] }>({ organizations: [], opportunities: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Search filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [s, u, r, m, o] = await Promise.all([
        api.getAdminStats().catch(() => ({ counts: {} })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminReports().catch(() => ({ reports: [] })),
        api.getAdminMentors().catch(() => ({ mentors: [] })),
        api.getAdminOrganizations().catch(() => ({ organizations: [], opportunities: [] }))
      ]);

      setStats(s.counts || {});
      setUsersList(u.users || []);
      setReportsList(r.reports || []);
      setMentorsList(m.mentors || []);
      setOrgsData(o || { organizations: [], opportunities: [] });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to load admin data', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setMessage({ text: `Updated user role to ${newRole}`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update role', type: 'error' });
    }
  };

  const handleReportAction = async (reportId: string, action: 'dismiss' | 'delete_post') => {
    try {
      const res = await api.handleReportAction(reportId, action);
      setReportsList(prev => prev.filter(r => r.id !== reportId));
      setMessage({ text: res.message || 'Moderation action completed', type: 'success' });
      // reload stats
      const s = await api.getAdminStats();
      setStats(s.counts || {});
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to apply action', type: 'error' });
    }
  };

  const handleToggleMentorVerify = async (mentorId: string) => {
    try {
      const res = await api.toggleMentorVerification(mentorId);
      setMentorsList(prev => prev.map(m => m.id === mentorId ? { ...m, verification_status: res.verification_status } : m));
      setMessage({ text: `Mentor verification updated: ${res.verification_status}`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to toggle verification', type: 'error' });
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo data and restore initial seeds?')) return;
    try {
      await api.resetDemoData();
      setMessage({ text: 'Demo database reset to default state.', type: 'success' });
      loadData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Reset failed', type: 'error' });
    }
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.persona_type || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400">
              Platform Administration & Moderation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Inspect platform personas, audit roadmaps, moderate community content, verify mentor credentials, and manage demo datasets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Data
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-medium ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Overview & Metrics
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          Users & Personas ({usersList.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 relative ${
            activeTab === 'reports'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Flag className="w-4 h-4" />
          Moderation Queue
          {reportsList.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {reportsList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('mentors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'mentors'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Mentors ({mentorsList.length})
        </button>

        <button
          onClick={() => setActiveTab('organizations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'organizations'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Partners & Opps ({orgsData.opportunities?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeTab === 'system'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          Demo Controls
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner text="Retrieving platform state..." />
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Users</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stats.users || 0}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold">6 Personas Active</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Active Goals</p>
                  <p className="text-2xl font-black text-indigo-600 mt-1">{stats.goals || 0}</p>
                  <span className="text-[10px] text-slate-400">Target Pathways</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Tasks Created</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stats.tasks || 0}</p>
                  <span className="text-[10px] text-indigo-600 font-semibold">Hands-on micro-tasks</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Community Posts</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{stats.posts || 0}</p>
                  <span className="text-[10px] text-slate-400">Peer growth exchange</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Human Mentors</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{stats.mentors || 0}</p>
                  <span className="text-[10px] text-slate-400">Hub Network</span>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Pending Reports</p>
                  <p className="text-2xl font-black text-rose-600 mt-1">{stats.pendingReports || 0}</p>
                  <span className="text-[10px] text-rose-500 font-semibold">Requires moderation</span>
                </div>
              </div>

              {/* Quick Persona Inspection Grid */}
              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Supported Product Personas (Section 4)</h2>
                    <p className="text-xs text-slate-500">All demographic groups identified in product architecture</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    6 Archetypes Seeded
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {usersList.slice(0, 6).map((u) => (
                    <div key={u.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-100/70 transition-all">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-indigo-200" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-500 capitalize">{u.persona_type?.replace(/_/g, ' ')}</p>
                        </div>
                        <Badge variant="indigo">{u.role}</Badge>
                      </div>
                      <p className="text-xs text-slate-700 mt-3 font-medium line-clamp-1">Goal: {u.target_goal || 'Career advancement'}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                        <span>Profile Completion:</span>
                        <span className="font-bold text-indigo-600">{u.completion_pct || 85}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, or persona..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Filter Role:</span>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="user">Learner / User</option>
                    <option value="mentor">Mentor</option>
                    <option value="organization">Organization</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="py-3 px-3">User & Persona</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Target Pathway</th>
                      <th className="py-3 px-3">Profile %</th>
                      <th className="py-3 px-3">Current Role</th>
                      <th className="py-3 px-3 text-right">Role Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border" />
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[10px] text-slate-500 capitalize">{u.persona_type?.replace(/_/g, ' ') || 'Learner'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-3 text-slate-700 max-w-xs truncate">{u.target_goal || 'Skill Progression'}</td>
                        <td className="py-3 px-3 font-semibold text-indigo-600">{u.completion_pct || 80}%</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            u.role === 'mentor' ? 'bg-emerald-100 text-emerald-700' :
                            u.role === 'organization' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-[11px] py-1 px-2 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="user">User</option>
                            <option value="mentor">Mentor</option>
                            <option value="organization">Organization</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONTENT MODERATION / REPORTS */}
          {activeTab === 'reports' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Community Safety & Moderation (Section 45)</h2>
                  <p className="text-xs text-slate-500">Review reported posts, take immediate action to protect learners.</p>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  {reportsList.length} Pending Flags
                </span>
              </div>

              {reportsList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">Moderation Queue is Clear</p>
                  <p className="text-xs">No community posts currently flagged for review.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportsList.map((r) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
                            <AlertTriangle className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Flagged Post: {r.post_title || 'Untitled Post'}</p>
                            <p className="text-[11px] text-slate-500">By {r.author_name} &bull; Category: {r.post_category}</p>
                          </div>
                        </div>
                        <Badge variant="rose">Reported by {r.reporter_name || 'Community Member'}</Badge>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-rose-200/60 text-xs text-slate-700">
                        <p className="font-semibold text-slate-800 mb-1">Report Reason: <span className="font-normal text-rose-700">{r.reason}</span></p>
                        <p className="italic text-slate-600 bg-slate-50 p-2 rounded-lg">"{r.post_content}"</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleReportAction(r.id, 'dismiss')}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100"
                        >
                          Dismiss Report
                        </button>
                        <button
                          onClick={() => handleReportAction(r.id, 'delete_post')}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm"
                        >
                          Remove Inappropriate Post
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MENTORS */}
          {activeTab === 'mentors' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Human Mentor Hub Verification (Section 14 & 15)</h2>
                  <p className="text-xs text-slate-500">Verify credentials, inspect engagement ratings, and validate participation types.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentorsList.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={m.avatar} alt={m.name} className="w-12 h-12 rounded-full object-cover border" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{m.name}</p>
                          <Badge variant={m.verification_status === 'Verified Mentor' ? 'emerald' : 'amber'}>
                            {m.verification_status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">{m.current_title} &bull; {m.company_or_field}</p>
                        <p className="text-[10px] text-slate-400 capitalize">{m.participation_type} &bull; {m.experience_years} Yrs Exp</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{m.bio}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-[11px] font-semibold text-slate-500">Rating: {m.rating} ★ ({m.reviews_count} reviews)</span>
                      <button
                        onClick={() => handleToggleMentorVerify(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          m.verification_status === 'Verified Mentor'
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {m.verification_status === 'Verified Mentor' ? 'Revoke Verification' : 'Verify Mentor'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ORGANIZATIONS & OPPORTUNITIES */}
          {activeTab === 'organizations' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900">Partner Organizations (Section 16)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orgsData.organizations?.map((o) => (
                    <div key={o.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">{o.name}</p>
                        <Badge variant="blue">{o.org_type}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{o.description}</p>
                      <p className="text-[10px] text-slate-400">{o.location} &bull; {o.industry}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <h2 className="text-base font-bold text-slate-900">Active Listings & Apprenticeships (Section 17)</h2>
                <div className="space-y-3">
                  {orgsData.opportunities?.map((opp) => (
                    <div key={opp.id} className="p-3.5 rounded-xl border border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{opp.title}</p>
                          <Badge variant="indigo">{opp.opp_type}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opp.org_name} &bull; {opp.location} &bull; Duration: {opp.duration}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {opp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DEMO CONTROLS */}
          {activeTab === 'system' && (
            <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6 max-w-2xl">
              <div>
                <h2 className="text-base font-bold text-slate-900">Demo & System Operations</h2>
                <p className="text-xs text-slate-500">Maintain environment state, seed reset, and testing utilities.</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Database className="w-4 h-4 text-amber-700" />
                  Reset Demo Persona State & Seed Data
                </div>
                <p className="text-xs text-amber-800">
                  Restores default roadmaps, tasks, practice questions, challenges, and mentors for live presentation without dropping database schema.
                </p>
                <button
                  onClick={handleResetDemo}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-sm"
                >
                  Reset Demo State Now
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-800">AI Integration Architecture</p>
                <p className="text-xs text-slate-600">
                  Dual-tier AI with Google Gemini 1.5 Flash API as primary neural engine, backed by deterministic heuristics fallback ensuring zero downtime.
                </p>
                <div className="pt-2 text-[11px] text-indigo-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dual-Engine Operational
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
