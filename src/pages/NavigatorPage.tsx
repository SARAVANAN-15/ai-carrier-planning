import React, { useState } from 'react';
import { Compass, Send, Sparkles, Globe, User, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const NavigatorPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'assistant',
      answer: `Hello ${user?.name?.split(' ')[0] || 'there'}! I am your **AI Career Navigator**. 

Ask me anything about career pathways, transferable skills, realistic expectations, or what to learn next. You can also switch between **English** and **தமிழ் (Tamil)** at any time.`,
      suggestedFollowUps: [
        'What career options fit my current skills and background?',
        'How can I switch from my current role to a tech or trade pathway?',
        'What practical skills have immediate apprenticeship demand?',
        'What can I realistically achieve with 2 hours of daily study?'
      ],
      sourcesAndNotes: {
        userProvided: `Profile: ${profile?.occupation || 'Learner'}, Goal: ${profile?.target_goal || 'Growth'}`,
        generalGuidance: 'Synthesized from verified industry competency matrices',
        externalVerificationNeeded: 'Local district training center schedules'
      }
    }
  ]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || loading) return;

    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const historyToSend = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text || m.answer || ''
      }));

      const res = await api.chatNavigator(text, historyToSend, language);
      setMessages((prev) => [...prev, { sender: 'assistant', ...res.result }]);
    } catch (err) {
      console.error('Navigator chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          answer: 'AI guidance is temporarily busy. Your profile context is saved—please try asking again in a moment.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Career Navigator</h1>
            <p className="text-xs text-slate-500">
              Conversational career exploration with transparent source distinction
            </p>
          </div>
        </div>

        {/* Language selector pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          <button
            onClick={() => setLanguage('English')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'English' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('Tamil')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              language === 'Tamil' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            தமிழ் (Tamil)
          </button>
        </div>
      </div>

      {/* Messages stream */}
      <div className="space-y-4">
        {messages.map((msg, idx) => {
          if (msg.sender === 'user') {
            return (
              <div key={idx} className="flex justify-end">
                <div className="max-w-xl bg-indigo-600 text-white p-4 rounded-3xl rounded-tr-md text-sm font-medium shadow-md shadow-indigo-600/10">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4 animate-fade-in">
              {/* Answer content */}
              <div className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {msg.answer}
              </div>

              {/* Source attribution badges */}
              {msg.sourcesAndNotes && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-1.5 text-slate-600">
                    <User className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span><strong>User Context:</strong> {msg.sourcesAndNotes.userProvided}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-1.5 text-slate-600">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Industry Knowledge:</strong> {msg.sourcesAndNotes.generalGuidance}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-1.5 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Verify Locally:</strong> {msg.sourcesAndNotes.externalVerificationNeeded}</span>
                  </div>
                </div>
              )}

              {/* Follow-up suggestions */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Suggested Follow-Ups:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestedFollowUps.map((fu: string, fIdx: number) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(fu)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <span>{fu}</span>
                        <ArrowRight className="w-3 h-3 text-indigo-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>AI Navigator is researching your query...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-lg flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Ask anything about career pathways, transferable skills, requirements..."
          className="flex-1 px-4 py-2.5 text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
