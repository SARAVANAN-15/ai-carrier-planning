import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  UserCheck,
  ArrowRight,
  BookOpen,
  Briefcase,
  Code,
  Lightbulb,
  MessageSquare,
  ShieldCheck,
  User
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const MentorPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, activeGoal } = useAuth();

  const [activeMode, setActiveMode] = useState<string>('career');
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mentorModes = [
    { id: 'career', label: 'Career Mentor', icon: CompassIcon, desc: 'Long-term pathways & realistic transitions' },
    { id: 'study', label: 'Study Mentor', icon: BookOpen, desc: 'Core concepts & study routines' },
    { id: 'job', label: 'Job Mentor', icon: Briefcase, desc: 'Placement prep, STAR resume & interviews' },
    { id: 'skill', label: 'Skill Mentor', icon: Code, desc: 'Hands-on code & trade diagnostics' },
    { id: 'business', label: 'Business Mentor', icon: Lightbulb, desc: 'Customer validation & lean MVPs' },
    { id: 'communication', label: 'Communication Mentor', icon: MessageSquare, desc: 'Crisp articulation & confidence' },
  ];

  function CompassIcon(props: any) {
    return <Bot {...props} />;
  }

  useEffect(() => {
    loadConversation(activeMode);
  }, [activeMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (mode: string) => {
    setLoading(true);
    try {
      const data = await api.getMentorMessages(mode);
      setMessages(data.messages || []);
    } catch (err) {
      console.warn('Failed to load mentor messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.sendMentorMessage(activeMode, text);
      setMessages((prev) => [...prev, res.reply]);
    } catch (err) {
      console.error('Mentor chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-soft">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              AI Mentor • <span className="text-indigo-600 font-semibold">{user?.name}'s Assistant</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Clear AI identity. Never guarantees jobs or salaries. Seamless handoff to human mentors available.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/mentors')}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all self-end sm:self-auto"
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Browse Human Mentors</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {mentorModes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = activeMode === mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
              <h4 className="text-xs font-bold truncate">{mode.label}</h4>
              <p className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                {mode.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';

            if (isUser) {
              return (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-md sm:max-w-lg bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-sm text-xs sm:text-sm font-medium shadow-sm">
                    {m.text}
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className="flex items-start gap-3 max-w-2xl animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>

                <div className="space-y-3 flex-1 min-w-0">
                  <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl rounded-tl-sm text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {m.text}
                  </div>

                  {/* AI-to-Human Mentor Handoff Card (Module 8) */}
                  {m.suggestHumanHandoff && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <UserCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-indigo-950">
                            Connect with a Human Industry Mentor
                          </p>
                          <p className="text-[11px] text-indigo-700">
                            Verified senior professionals and trade contractors can review your code or practical setup directly.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate('/mentors')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 shrink-0 flex items-center gap-1.5 transition-all"
                      >
                        <span>Explore Mentors</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Suggested Quick Actions */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedActions.map((action: string, aIdx: number) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSendMessage(action)}
                          className="px-3 py-1 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>AI Mentor is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={`Ask your ${activeMode} mentor a question...`}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
