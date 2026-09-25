import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  MapPin,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const OrganizationsPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'opportunities' | 'organizations'>('opportunities');

  // Post Opportunity Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [postForm, setPostForm] = useState({
    title: '',
    opp_type: 'Internship',
    organization_id: '',
    skills: '',
    location: 'Remote / Hybrid',
    duration: '3 Months',
    description: '',
    eligibility: 'Open to passionate learners with foundational skills'
  });
  const [posting, setPosting] = useState(false);

  const handlePostOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.description) return;
    setPosting(true);
    try {
      const skillsArr = postForm.skills.split(',').map(s => s.trim()).filter(Boolean);
      await api.createOpportunity({
        ...postForm,
        skills: skillsArr.length > 0 ? skillsArr : ['General Skills']
      });
      setShowPostModal(false);
      setPostForm({
        title: '',
        opp_type: 'Internship',
        organization_id: '',
        skills: '',
        location: 'Remote / Hybrid',
        duration: '3 Months',
        description: '',
        eligibility: 'Open to passionate learners with foundational skills'
      });
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to post opportunity');
    } finally {
      setPosting(false);
    }
  };

  // Application modal
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [appNotes, setAppNotes] = useState('');
  const [appliedOpps, setAppliedOpps] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [oppRes, orgRes] = await Promise.all([
        api.getOpportunities(typeFilter, search),
        api.getOrganizations()
      ]);
      setOpportunities(oppRes.opportunities || []);
      setOrganizations(orgRes.organizations || []);
    } catch (err) {
      console.warn('Failed to load opportunities/organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    setSubmitting(true);
    try {
      await api.applyOpportunity(selectedOpp.id, appNotes);
      setAppliedOpps((prev) => [...prev, selectedOpp.id]);
      setSelectedOpp(null);
      setAppNotes('');

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Application failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Modules 16 & 17 — Ecosystem & Opportunities
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              Demo / Sample Listings
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Pathways, Apprenticeships & Programs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Discover verified training providers, trade guilds, and hiring employers aligned with your skill roadmap.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPostModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            + Post Listing
          </button>
          <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('opportunities')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'opportunities' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Opportunities ({opportunities.length})
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'organizations' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Organizations ({organizations.length})
          </button>
        </div>
        </div>
      </div>

      {activeTab === 'opportunities' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') fetchData();
                }}
                placeholder="Search opportunities by role or keyword..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {['All', 'Internship', 'Apprenticeship', 'Entry-Level Job'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    typeFilter === t
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Opportunities Stream */}
          <div className="space-y-4">
            {opportunities.map((opp) => {
              const hasApplied = appliedOpps.includes(opp.id);

              return (
                <div
                  key={opp.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 interactive-card"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {opp.opp_type}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        Sample Listing
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                    <p className="text-xs font-semibold text-indigo-600">{opp.org_name}</p>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {opp.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {opp.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {opp.duration}
                      </span>
                    </div>

                    {/* Skill tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(opp.skills || []).map((sk: string, sIdx: number) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="self-end md:self-center shrink-0">
                    {hasApplied ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Applied (Demo)
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedOpp(opp)}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                      >
                        <span>Apply / View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organizations.map((org) => (
            <div key={org.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
              <div className="flex items-center gap-3">
                <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-100 shadow-sm" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{org.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                    {org.org_type} • {org.industry}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{org.description}</p>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{org.location}</span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1">
                  Verified Partner (Demo)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {/* Post Opportunity Modal (Section 16 & 30) */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Post Opportunity or Workshop</h3>
                <p className="text-[11px] text-slate-500">Employer / Training Provider Collaboration</p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">&times;</button>
            </div>

            <form onSubmit={handlePostOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="e.g. Junior Backend Trainee or Electrical Apprentice"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opportunity Type</label>
                  <select
                    value={postForm.opp_type}
                    onChange={(e) => setPostForm({ ...postForm, opp_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Internship">Internship</option>
                    <option value="Apprenticeship">Apprenticeship</option>
                    <option value="Training Program">Training Program</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Entry-Level Job">Entry-Level Job</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={postForm.location}
                    onChange={(e) => setPostForm({ ...postForm, location: e.target.value })}
                    placeholder="e.g. Remote / Bangalore"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={postForm.duration}
                    onChange={(e) => setPostForm({ ...postForm, duration: e.target.value })}
                    placeholder="e.g. 3 Months or 6 Months"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={postForm.skills}
                    onChange={(e) => setPostForm({ ...postForm, skills: e.target.value })}
                    placeholder="e.g. Java, SQL, Spring Boot"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={postForm.description}
                  onChange={(e) => setPostForm({ ...postForm, description: e.target.value })}
                  placeholder="Describe the learning outcomes, daily hands-on involvement, and mentorship provided..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Eligibility Criteria</label>
                <input
                  type="text"
                  value={postForm.eligibility}
                  onChange={(e) => setPostForm({ ...postForm, eligibility: e.target.value })}
                  placeholder="e.g. Open to college students or vocational trainees"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {posting ? 'Posting...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {selectedOpp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-fade-in">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Sample Application Workflow
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedOpp.title}</h3>
              <p className="text-xs text-slate-500">{selectedOpp.org_name} • {selectedOpp.location}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
              <p><strong>Eligibility:</strong> {selectedOpp.eligibility}</p>
              <p><strong>Application Details:</strong> {selectedOpp.application_info}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Note / Link to GitHub or Skill Passport
                </label>
                <textarea
                  rows={3}
                  value={appNotes}
                  onChange={(e) => setAppNotes(e.target.value)}
                  placeholder="Share a short note on why you're interested and link your project/portfolio..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOpp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Demo Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
