import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Star,
  Clock,
  Globe,
  CheckCircle2,
  Send,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

export const MentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);

  // Request modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestGoals, setRequestGoals] = useState('');
  const [preferredTime, setPreferredTime] = useState('Weekend afternoon');
  const [sendingRequest, setSendingRequest] = useState(false);

  // My requests tab
  const [tab, setTab] = useState<'browse' | 'my_requests'>('browse');
  const [myRequests, setMyRequests] = useState<any[]>([]);

  useEffect(() => {
    fetchMentors();
    fetchMyRequests();
  }, [areaFilter]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const data = await api.getMentors(areaFilter, search);
      setMentors(data.mentors || []);
    } catch (err) {
      console.warn('Failed to load mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const data = await api.getMyMentorRequests();
      setMyRequests(data.requests || []);
    } catch (err) {
      console.warn('Failed to load mentor requests:', err);
    }
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !requestMessage.trim()) return;

    setSendingRequest(true);
    try {
      await api.requestMentorship(selectedMentor.id, {
        message: requestMessage,
        goals: requestGoals,
        preferredTime
      });

      setShowRequestModal(false);
      setRequestMessage('');
      setRequestGoals('');
      await fetchMyRequests();
      setTab('my_requests');

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Request failed:', err);
    } finally {
      setSendingRequest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Module 14 — Human Mentorship Hub
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              Demo Profiles Marked
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Connect with Real Practitioners
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            When you need advice from someone who has worked in the field, explore volunteer and alumni mentors across tech, trades, and growth.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setTab('browse')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              tab === 'browse' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Find Mentors
          </button>
          <button
            onClick={() => setTab('my_requests')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              tab === 'my_requests' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Requests ({myRequests.length})
          </button>
        </div>
      </div>

      {tab === 'browse' && (
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
                  if (e.key === 'Enter') fetchMentors();
                }}
                placeholder="Search mentors by name, company, or expertise..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              {['All', 'Software', 'Electrical', 'Digital Marketing', 'Higher Studies'].map((a) => (
                <button
                  key={a}
                  onClick={() => setAreaFilter(a)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    areaFilter === a
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentors.map((m) => (
              <div
                key={m.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col justify-between interactive-card"
              >
                <div>
                  {/* Top row */}
                  <div className="flex items-start gap-4">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{m.name}</h3>
                      </div>
                      <p className="text-xs font-semibold text-indigo-600 truncate">{m.current_title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{m.company_or_field}</p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="w-3 h-3 fill-current" />
                          {m.rating} ({m.reviews_count})
                        </span>
                        <span>•</span>
                        <span>{m.experience_years}+ Years Exp</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                    {m.bio}
                  </p>

                  {/* Skills tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(m.skills || []).slice(0, 4).map((sk: string, sIdx: number) => (
                      <span key={sIdx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {m.availability}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {(m.languages || []).join(', ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
                    {m.participation_type}
                  </span>

                  <button
                    onClick={() => {
                      setSelectedMentor(m);
                      setShowRequestModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <span>Request Mentorship</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Requests Tab */}
      {tab === 'my_requests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft">
              <p className="text-sm font-semibold text-slate-700">You have not submitted any mentorship requests yet.</p>
            </div>
          ) : (
            myRequests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img src={req.mentor_avatar} alt={req.mentor_name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{req.mentor_name}</h4>
                      <p className="text-xs text-slate-500">{req.current_title} • {req.company_or_field}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      req.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'declined'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 text-xs text-slate-700 border border-slate-100">
                  <strong className="block text-slate-900 mb-0.5">Your Message:</strong>
                  <p>{req.message}</p>
                </div>

                {req.response_notes && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                    <strong className="block font-bold text-emerald-900 mb-0.5">Mentor Response:</strong>
                    <p>{req.response_notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Request Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <img src={selectedMentor.avatar} alt={selectedMentor.name} className="w-12 h-12 rounded-2xl object-cover" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Request Mentorship with {selectedMentor.name}</h3>
                <p className="text-xs text-indigo-600">{selectedMentor.current_title}</p>
              </div>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Introduction & What You'd Like Feedback On
                </label>
                <textarea
                  rows={3}
                  required
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="e.g. Hello! I am learning Java backend and have built a REST API. Would appreciate 30 minutes of guidance on my architecture..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Learning Goal / Outcome
                </label>
                <input
                  type="text"
                  value={requestGoals}
                  onChange={(e) => setRequestGoals(e.target.value)}
                  placeholder="e.g. Code review for my project and 1 mock technical question"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Time Window</label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Weekend afternoon">Weekend afternoon</option>
                  <option value="Weekday evening (after 7 PM)">Weekday evening (after 7 PM)</option>
                  <option value="Flexible / Asynchronous review">Flexible / Asynchronous review</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingRequest}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md disabled:opacity-50"
                >
                  {sendingRequest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
