import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  SlidersHorizontal,
  CheckCircle2,
  ArrowRight,
  GitCompare,
  ShieldCheck,
  Search,
  Filter,
  Info,
  Clock,
  Briefcase,
  Laptop,
  Wrench,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ExplorePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, activeGoal, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [discoveryData, setDiscoveryData] = useState<any>(null);
  const [allCareers, setAllCareers] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'recommendations' | 'catalog'>('recommendations');

  // User-Controlled Priorities (Section 15)
  const [priorities, setPriorities] = useState({
    handsOn: false,
    computerWork: false,
    quickEntry: false,
    highIncome: false
  });

  // Selected careers for comparison
  const [compareTray, setCompareTray] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch initial discovery recommendations & catalog
  useEffect(() => {
    loadDiscovery();
    loadCatalog();
  }, [priorities]);

  const loadDiscovery = async () => {
    setLoading(true);
    try {
      const res = await api.runDiscovery({ priorities });
      setDiscoveryData(res);
    } catch (err) {
      console.error('Failed to run discovery:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const res = await api.getCareers();
      setAllCareers(res.careers || []);
    } catch (err) {
      console.error('Failed to load career catalog:', err);
    }
  };

  const togglePriority = (key: keyof typeof priorities) => {
    setPriorities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCompare = (careerName: string) => {
    setCompareTray(prev => {
      if (prev.includes(careerName)) {
        return prev.filter(c => c !== careerName);
      }
      if (prev.length >= 4) {
        setNotification('You can compare a maximum of 4 pathways at once.');
        setTimeout(() => setNotification(null), 4000);
        return prev;
      }
      return [...prev, careerName];
    });
  };

  const handleLaunchCompare = () => {
    if (compareTray.length < 2) return;
    navigate(`/compare?careers=${encodeURIComponent(compareTray.join(','))}`);
  };

  const handleSelectPathway = async (careerName: string) => {
    setIsSelecting(careerName);
    try {
      await api.selectCareerPathway({ careerName });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      await refreshUser();
      navigate('/roadmap');
    } catch (err) {
      console.error('Failed to select pathway:', err);
      setNotification('Failed to activate pathway. Please try again.');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsSelecting(null);
    }
  };

  const categories = ['All', ...Array.from(new Set(allCareers.map(c => c.category)))];

  const filteredCatalog = allCareers.filter(c => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      c.career_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.common_skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {notification && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-900 shadow-sm flex items-center justify-between animate-fade-in">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Top Banner: Dynamic Career Discovery */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>AI Career Discovery & Intelligence Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            I'm not sure what career to choose.
          </h1>

          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Career Solver does not force you into a pre-selected box. We analyze your real interests, practical skills, work style, and constraints to generate realistic cross-category pathways.
          </p>

          {/* Quick Tabs: Recommendations vs Complete Catalog */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setViewMode('recommendations')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                viewMode === 'recommendations'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Personalized Recommendations</span>
            </button>
            <button
              onClick={() => setViewMode('catalog')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                viewMode === 'catalog'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Browse Career Catalog ({allCareers.length} Careers)</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* VIEW MODE 1: RECOMMENDATIONS */}
      {viewMode === 'recommendations' && (
        <div className="space-y-6">
          {/* Priorities & Profile Snapshot Bar */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span>Adjust Your Priorities (Section 15)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Toggle what matters most to you. The intelligence engine recalculates immediately.
                </p>
              </div>

              {/* Priority Toggle Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => togglePriority('handsOn')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    priorities.handsOn
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Hands-on / Practical</span>
                  {priorities.handsOn && <Check className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => togglePriority('computerWork')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    priorities.computerWork
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Computer-Based</span>
                  {priorities.computerWork && <Check className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => togglePriority('quickEntry')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    priorities.quickEntry
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Quick Entry (3-6 Months)</span>
                  {priorities.quickEntry && <Check className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => togglePriority('highIncome')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    priorities.highIncome
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>High Income Growth</span>
                  {priorities.highIncome && <Check className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Profile Snapshot Strip */}
            {discoveryData?.profileSnapshot && (
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600 pt-1">
                <span className="font-semibold text-slate-800">Factored Profile Context:</span>
                <span>Work Style: <strong className="text-indigo-600 capitalize">{discoveryData.profileSnapshot.workPreference.replace(/_/g, ' ')}</strong></span>
                <span>Interests: <strong className="text-indigo-600">{discoveryData.profileSnapshot.interests.join(', ') || 'Exploring'}</strong></span>
                <span>Daily Time: <strong className="text-indigo-600">{discoveryData.profileSnapshot.dailyHours} hrs/day</strong></span>
                <span>Hardware: <strong className="text-indigo-600">{discoveryData.profileSnapshot.hasComputer ? 'Computer + Smartphone' : 'Smartphone only'}</strong></span>
              </div>
            )}
          </div>

          {/* Results List */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner label="Evaluating multi-category career pathways..." subtext="Matching your profile against 14 distinct career disciplines" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Your Career Exploration Results (Section 12)</h2>
                  <p className="text-xs text-slate-500">
                    Showing {discoveryData?.recommendations?.length || 0} pathways across diverse disciplines. No hardcoded defaults.
                  </p>
                </div>

                {compareTray.length > 0 && (
                  <button
                    onClick={handleLaunchCompare}
                    disabled={compareTray.length < 2}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      compareTray.length >= 2
                        ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>Compare Selected ({compareTray.length}/4)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Career Recommendation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {discoveryData?.recommendations?.map((item: any) => {
                  const isCompared = compareTray.includes(item.careerName);
                  const isCurrentActive = activeGoal?.target_pathway === item.careerName || activeGoal?.title === item.careerName;

                  return (
                    <div
                      key={item.careerId}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200 p-6 flex flex-col justify-between space-y-5"
                    >
                      {/* Top Header */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {item.category}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 pt-1">
                              {item.careerName}
                            </h3>
                          </div>

                          {/* Fit Score Badge */}
                          <div className="text-right shrink-0">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-sm">
                              <span>{item.overallScore}%</span>
                            </div>
                            <p className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                              {item.fitLabel}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Analytical Transparency: Why it appeared (Section 13) */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Info className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Why this pathway appeared:</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed italic">
                          "{item.whyAppeared}"
                        </p>

                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="text-[11px] font-semibold text-emerald-700 shrink-0">Matched Factors:</span>
                            <span className="text-[11px] text-slate-600">{item.matchedFactors?.join(', ') || 'General affinity'}</span>
                          </div>
                          {item.skillGaps?.length > 0 && (
                            <div className="flex items-start gap-2">
                              <span className="text-[11px] font-semibold text-amber-700 shrink-0">Skills to Bridge:</span>
                              <span className="text-[11px] text-slate-600">{item.skillGaps.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dimension Indicators (Section 14) */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50">
                          <span className="text-slate-400 block text-[10px]">Hands-on Level</span>
                          <strong className="text-slate-800 font-bold">{item.handsOnLevel}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50">
                          <span className="text-slate-400 block text-[10px]">Computer Use</span>
                          <strong className="text-slate-800 font-bold">{item.computerUseLevel}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50">
                          <span className="text-slate-400 block text-[10px]">Learning Curve</span>
                          <strong className="text-slate-800 font-bold">{item.learningDuration}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/50">
                          <span className="text-slate-400 block text-[10px]">Income Potential</span>
                          <strong className="text-slate-800 font-bold">{item.incomePotential}</strong>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => toggleCompare(item.careerName)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isCompared
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>{isCompared ? 'Added to Compare' : '+ Compare'}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/reality-check?career=${encodeURIComponent(item.careerName)}`)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            Reality Check
                          </button>

                          <button
                            onClick={() => handleSelectPathway(item.careerName)}
                            disabled={isSelecting === item.careerName || isCurrentActive}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                              isCurrentActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {isSelecting === item.careerName ? (
                              <span>Activating...</span>
                            ) : isCurrentActive ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Active Goal</span>
                              </>
                            ) : (
                              <>
                                <span>Select Pathway</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: BROWSE CATALOG */}
      {viewMode === 'catalog' && (
        <div className="space-y-6">
          {/* Filters & Search */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search careers, skills, or industries (e.g. Electrician, Data, Nursing, Marketing, Design)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalog.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {c.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {c.learning_duration}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 pt-1">
                    {c.career_name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3">
                    {c.description}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-1">
                    {c.common_skills.slice(0, 3).map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleCompare(c.career_name)}
                    className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>{compareTray.includes(c.career_name) ? 'Selected' : 'Compare'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/reality-check?career=${encodeURIComponent(c.career_name)}`)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Reality Check
                    </button>
                    <button
                      onClick={() => handleSelectPathway(c.career_name)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Compare Tray */}
      {compareTray.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700/80 animate-fade-in">
          <div className="flex items-center gap-2 text-xs">
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold">{compareTray.length} Pathways in Comparison:</span>
            <span className="text-slate-300 font-medium truncate max-w-xs">{compareTray.join(', ')}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareTray([])}
              className="text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              Clear
            </button>
            <button
              onClick={handleLaunchCompare}
              disabled={compareTray.length < 2}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                compareTray.length >= 2
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              Compare Now ({compareTray.length}/4)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
