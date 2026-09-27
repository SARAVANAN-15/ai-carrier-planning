import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Globe,
  Users,
  Cpu,
  Save
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const SettingsPage: React.FC = () => {
  const { user, switchDemoPersona } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [settings, setSettings] = useState<any | null>(null);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
      if (data.activeModel) setSelectedModel(data.activeModel);
    } catch (err) {
      console.warn('Failed to load settings:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await api.saveSettings({
        model: selectedModel
      });
      setMessage('AI model settings updated successfully!');
      await fetchSettings();
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    try {
      await api.resetDemoData();
      setMessage('Demo data has been successfully reset to default state.');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error('Reset error:', err);
      setMessage(err.message || 'Failed to reset demo data.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Platform Settings & AI Configuration</h1>
            <p className="text-xs text-slate-500">
              Manage your Google Gemini AI engine model, language preferences, and interactive demo personas.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* AI Key & Model Configuration */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Google Gemini AI Engine</h2>
              <p className="text-[11px] text-slate-500">Full-stack server-side integration via @google/genai</p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Google Gemini Connected
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Active Model Selection
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {selectedModel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="model"
                    value="gemini-3.8-flash"
                    checked={selectedModel === 'gemini-3.8-flash'}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <strong className="text-xs text-slate-900">gemini-3.8-flash</strong>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">Recommended</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  Ultra-fast, optimized for real-time guidance, chat mentorship, and task evaluations.
                </p>
              </label>

              <label
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="model"
                    value="gemini-3.1-pro-preview"
                    checked={selectedModel === 'gemini-3.1-pro-preview'}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <strong className="text-xs text-slate-900">gemini-3.1-pro-preview</strong>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-bold">Pro Reasoning</span>
                </div>
                <p className="text-[11px] text-slate-500 pl-5">
                  Advanced reasoning for complex multi-year pathway synthesis and in-depth business plans.
                </p>
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-900">High-Fidelity Deterministic Fallback Engine</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Career Solver includes a full offline deterministic career intelligence engine. If network latency or API quotas occur, the platform seamlessly synthesizes verified roadmap milestones, practice rubrics, and mentor guidance without interruption.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save AI Configuration'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Language Preference */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Language Foundation (Module 24)</h2>
        </div>
        <p className="text-xs text-slate-500">
          Career Solver supports bilingual interface navigation and Tamil-first guidance for accessibility.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setLanguage('English')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              language === 'English'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            English (Default)
          </button>
          <button
            onClick={() => setLanguage('Tamil')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              language === 'Tamil'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            தமிழ் (Tamil Guidance)
          </button>
        </div>
      </div>

      {/* Demo Persona Switching & Reset */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <Users className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Demo Persona Switcher</h2>
        </div>
        <p className="text-xs text-slate-500">
          Instant 1-click test personas to demonstrate diverse pathways during live presentations:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => switchDemoPersona('arun')}
            className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 text-left transition-all"
          >
            <strong className="text-xs text-slate-900 block">Arun Kumar</strong>
            <span className="text-[11px] text-slate-500">College Student • Java Placement</span>
          </button>

          <button
            onClick={() => switchDemoPersona('muthu')}
            className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 text-left transition-all"
          >
            <strong className="text-xs text-slate-900 block">Muthu Vel</strong>
            <span className="text-[11px] text-slate-500">Vocational Trades • Electrical Service</span>
          </button>

          <button
            onClick={() => switchDemoPersona('priya')}
            className="p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 text-left transition-all"
          >
            <strong className="text-xs text-slate-900 block">Priya Sharma</strong>
            <span className="text-[11px] text-slate-500">Career Switcher • Digital Marketing</span>
          </button>
        </div>

        {user?.role === 'admin' && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-600">Admin Reset Control</p>
              <p className="text-[11px] text-slate-400">Re-seed all tables to initial demo dataset</p>
            </div>
            <button
              onClick={handleResetDemoData}
              className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold"
            >
              Reset Demo Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
