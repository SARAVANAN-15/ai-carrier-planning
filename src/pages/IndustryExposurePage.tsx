import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Tag,
  PlusCircle,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { JourneyStepper } from '../components/layout/JourneyStepper';

export const IndustryExposurePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [userActivities, setUserActivities] = useState<any[]>([]);

  // Filter state
  const [activeTab, setActiveTab] = useState<'all' | 'internship' | 'hackathon' | 'workshop' | 'company_connect'>('all');

  // Custom activity log modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customOrg, setCustomOrg] = useState('');
  const [customType, setCustomType] = useState('workshop');
  const [customDate, setCustomDate] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [logging, setLogging] = useState(false);

  useEffect(() => {
    loadExposureData();
  }, []);

  const loadExposureData = async () => {
    setLoading(true);
    try {
      const res = await api.getIndustryExposure();
      if (res) {
        setOpportunities(res.opportunities || []);
        setUserActivities(res.userActivities || []);
      }
    } catch (err) {
      console.error('Failed to load industry exposure data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLog = async (opp: any) => {
    try {
      await api.logIndustryActivity({
        activityType: opp.type,
        title: opp.title,
        organization: opp.organization,
        date: new Date().toISOString().split('T')[0],
        status: 'registered',
        isVerified: opp.isVerified,
        notes: `Registered via Career Solver for ${opp.title}`
      });
      loadExposureData();
    } catch (err) {
      console.error('Error logging activity:', err);
    }
  };

  const handleCustomLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customOrg) return;

    setLogging(true);
    try {
      await api.logIndustryActivity({
        activityType: customType,
        title: customTitle,
        organization: customOrg,
        date: customDate || new Date().toISOString().split('T')[0],
        status: 'completed',
        isVerified: 0,
        notes: customNotes
      });
      setShowLogModal(false);
      setCustomTitle('');
      setCustomOrg('');
      setCustomNotes('');
      loadExposureData();
    } catch (err) {
      console.error('Error logging custom activity:', err);
    } finally {
      setLogging(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (activeTab === 'all') return true;
    return opp.type === activeTab;
  });

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading Industry Exposure Opportunities..." subtext="Retrieving verified fellowships, hackathons, and corporate connect events" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <JourneyStepper />

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                Stage 10 Exposure
              </span>
              <span className="text-xs text-slate-500">
                Industry & Market Connect
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Industry Exposure Hub
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Gain practical market presence through verified corporate fellowships, innovation hackathons, and company connects.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Log External Activity</span>
            </button>

            <button
              onClick={() => navigate('/readiness')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <span>Career Readiness Score (Stage 11)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Verification Status Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified External Opportunities: Live external applications with verified partner platforms
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-700">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Sample Curriculum Opportunities: Clearly designated simulation listings for skill benchmarking
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Opportunities' },
          { id: 'internship', label: 'Internships & Fellowships' },
          { id: 'hackathon', label: 'Hackathons & Sprints' },
          { id: 'workshop', label: 'Masterclasses & Workshops' },
          { id: 'company_connect', label: 'Company Connects' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredOpportunities.map((opp) => {
          const isRegistered = Boolean(opp.userStatus);
          const isVerified = Boolean(opp.isVerified);

          return (
            <div
              key={opp.id}
              className={`bg-white rounded-2xl border p-6 transition-all shadow-sm ${
                isVerified ? 'border-slate-200/90 hover:border-slate-300' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {opp.type.replace(/_/g, ' ')}
                    </span>

                    {isVerified ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Opportunity
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Sample / Demo Listing
                      </span>
                    )}

                    <span className="text-xs text-slate-500 font-medium">
                      Deadline: {opp.deadline}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                    {opp.organization} • <span className="text-slate-500 font-normal">{opp.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isRegistered ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Activity Logged</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuickLog(opp)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log Participation</span>
                    </button>
                  )}

                  {isVerified && opp.externalUrl && (
                    <a
                      href={opp.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                      title="Open Verified External Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {opp.description}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-800">Compensation / Perk:</span>{' '}
                  <span className="text-indigo-600 font-bold">{opp.stipend}</span>
                  <span className="text-slate-400 mx-2">•</span>
                  <span className="font-semibold text-slate-800">Duration:</span>{' '}
                  <span className="text-slate-600">{opp.duration}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {(opp.skills || []).map((sk: string) => (
                    <span key={sk} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 text-[11px] font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Custom Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Log External Industry Activity
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Record a workshop, campus hackathon, or internship you participated in to boost your Career Readiness Score.
            </p>

            <form onSubmit={handleCustomLog} className="space-y-4 my-5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Community Day Chennai 2026"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Host Organization / Company *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services / IEEE Student Branch"
                  value={customOrg}
                  onChange={(e) => setCustomOrg(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Activity Type
                  </label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="workshop">Workshop / Webinar</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="internship">Internship</option>
                    <option value="company_connect">Company Connect</option>
                    <option value="industry_event">Industry Conference</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Date Completed
                  </label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Key Takeaways / Verified Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="What skills were demonstrated or certificates received?"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={logging}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {logging ? 'Logging...' : 'Save to Profile & Update Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
