import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Bot,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Globe,
  Users,
  AlertTriangle,
  Save
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const SettingsPage: React.FC = () => {
  const { user, switchDemoPersona } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [settings, setSettings] = useState<any | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
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
        apiKey: apiKeyInput ? apiKeyInput.trim() : undefined,
        model: selectedModel
      });
      setMessage('Settings saved successfully!');
      setApiKeyInput('');
      await fetchSettings();
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (!confirm('Are you sure you want to reset all demo roadmaps, tasks, and community posts to initial seed state?')) return;
    try {
      await api.resetDemoData();
      alert('Demo data has been successfully reset.');
      window.location.reload();
    } catch (err) {
      console.error('Reset error:', err);
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
              Manage your Google Gemini API key, AI model selection, language preferences, and demo environments.
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
            <h2 className="text-base font-bold text-slate-900">Google Gemini AI Engine</h2>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              settings?.hasApiKey
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-indigo-50 text-indigo-700'
            }`}
          >
            {settings?.hasApiKey ? 'Live Gemini Connected' : 'Heuristic Engine (Offline Active)'}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Gemini API Key
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={settings?.hasApiKey ? `Key configured (${settings.maskedApiKey})` : 'Paste your Gemini API key (optional)...'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Stored securely server-side. If left blank or without key, Career Solver runs its built-in high-fidelity domain heuristic engine.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">AI Model Selection</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="gemini-1.5-flash">gemini-1.5-flash (Fast, recommended)</option>
              <option value="gemini-1.5-pro">gemini-1.5-pro (Deep reasoning)</option>
              <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp (Experimental)</option>
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
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
