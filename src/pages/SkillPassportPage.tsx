import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  User,
  Plus,
  Calendar,
  CheckSquare,
  Mic2,
  Sparkles,
  Download,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';

export const SkillPassportPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [passportData, setPassportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Add skill modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('technical');
  const [skillLevel, setSkillLevel] = useState('Intermediate');

  useEffect(() => {
    fetchPassport();
  }, []);

  const fetchPassport = async () => {
    setLoading(true);
    try {
      const data = await api.getSkillPassport();
      setPassportData(data);
    } catch (err) {
      console.warn('Failed to load skill passport:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    try {
      await api.addSkillToPassport({
        skill_name: skillName,
        category: skillCategory,
        level: skillLevel
      });
      setShowAddModal(false);
      setSkillName('');
      await fetchPassport();
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Profile Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{user?.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Living Growth Record
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              {profile?.occupation || 'Learner'} • {profile?.location || 'India'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-md line-clamp-1">
              Active Goal: {profile?.target_goal || 'Career Advancement'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      {/* Verification Level Explainer Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-soft grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-emerald-950 block text-[11px]">Verified Credentials</span>
            <span className="text-[10px] text-emerald-700">Backed by official exams or certifications</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="font-bold text-indigo-950 block text-[11px]">Completed Activity</span>
            <span className="text-[10px] text-indigo-700">Proven by completed hands-on tasks & sprints</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50/60 border border-amber-100">
          <User className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold text-amber-950 block text-[11px]">User Reported</span>
            <span className="text-[10px] text-amber-700">Self-declared background traits & experience</span>
          </div>
        </div>
      </div>

      {/* Skills Matrix */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Competencies & Validated Skills
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {passportData?.skills?.length || 0} Skills Recorded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {(passportData?.skills || []).map((sk: any) => (
            <div
              key={sk.id}
              className="p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge type={sk.source as any} size="sm" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {sk.level}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900">{sk.skill_name}</h4>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/50 text-[10px] text-slate-400 capitalize flex justify-between">
                <span>{sk.category}</span>
                {sk.verified_at && (
                  <span>Verified: {new Date(sk.verified_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Hands-On Work & Practice Log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed Learn-by-Doing Tasks */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            Verified Completed Tasks
          </h3>

          <div className="space-y-2">
            {(passportData?.completedTasks || []).map((t: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{t.title}</p>
                  <p className="text-[10px] text-slate-500">{t.skill}</p>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-100">
                  Done
                </span>
              </div>
            ))}
            {(passportData?.completedTasks || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No completed tasks yet.</p>
            )}
          </div>
        </div>

        {/* Practice Studio Milestone Ratings */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Mic2 className="w-4 h-4 text-indigo-600" />
            Recent Practice Studio Evaluations
          </h3>

          <div className="space-y-2">
            {(passportData?.practiceSessions || []).map((p: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900 capitalize">{p.practice_type} ({p.mode})</p>
                  <p className="text-[10px] text-slate-500">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-[11px] font-bold text-indigo-700">
                  Rating: {p.scores?.overall || 82}%
                </span>
              </div>
            ))}
            {(passportData?.practiceSessions || []).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No practice evaluations yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-slate-900">Add Skill to Passport</h3>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. Spring Boot, Digital Multimeter, SEO Strategy"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="technical">Technical (Coding, Data, Cloud)</option>
                  <option value="practical">Practical / Trades (Electrical, Tools, Hardware)</option>
                  <option value="soft">Soft (Communication, Presentation, Leadership)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Self-Assessed Level</label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Proficient">Proficient</option>
                  <option value="Master">Master</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
