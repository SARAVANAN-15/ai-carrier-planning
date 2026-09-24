import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Filter,
  Check,
  RotateCcw,
  SkipForward
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'in_progress' | 'completed'>('all');
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasks();
      setTasks(data.tasks || []);
      if (data.tasks && data.tasks.length > 0) {
        setExpandedTaskId(data.tasks[0].id);
      }
    } catch (err) {
      console.warn('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await api.updateTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.task : t)));

      if (newStatus === 'completed') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleSubmitNotes = async (task: any) => {
    const userNotes = notesMap[task.id] || task.user_notes;
    if (!userNotes || !userNotes.trim()) return;

    setSubmittingTaskId(task.id);
    try {
      const res = await api.submitTaskNotes(task.id, userNotes);
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: 'completed', user_notes: userNotes, ai_feedback: res.feedback }
            : t
        )
      );

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Task submission error:', err);
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'today') return t.is_daily_task === 1 || t.due_day === 'Today';
    if (filter === 'in_progress') return t.status === 'in_progress';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Module 6 — Learn-by-Doing
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Practical Action Tasks
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            No passive lectures. Every task requires hands-on execution, code, schematics, or structured articulation.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: 'Today' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === f.id
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Stream */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading practical tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-soft">
          <p className="text-sm font-semibold text-slate-700">No tasks found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : isInProgress
                    ? 'border-indigo-400 shadow-card ring-2 ring-indigo-500/5'
                    : 'border-slate-200/80 shadow-soft'
                }`}
              >
                {/* Header bar */}
                <div
                  className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50"
                  onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task.id, isCompleted ? 'in_progress' : 'completed');
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-0.5 sm:mt-0 ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-600 bg-white'
                      }`}
                    >
                      {isCompleted && <Check className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isInProgress
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {task.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {task.skill} • {task.difficulty}
                        </span>
                      </div>
                      <h3
                        className={`text-sm sm:text-base font-bold mt-1 ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {task.estimated_minutes} min
                    </span>
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">
                      {isExpanded ? 'Collapse' : 'View Instructions'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 text-xs animate-fade-in">
                    {/* Why it matters */}
                    {task.why_it_matters && (
                      <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/70 text-indigo-900">
                        <strong className="block text-[10px] uppercase font-bold tracking-wider text-indigo-700 mb-0.5">
                          Why This Matters for Placement & Real Work
                        </strong>
                        <p className="leading-relaxed">{task.why_it_matters}</p>
                      </div>
                    )}

                    {/* Step-by-Step Instructions */}
                    <div>
                      <strong className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-2">
                        Step-by-Step Instructions
                      </strong>
                      <ol className="space-y-1.5 list-decimal list-inside text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {(task.instructions || []).map((step: string, idx: number) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Expected Outcome */}
                    {task.expected_outcome && (
                      <div>
                        <strong className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-1">
                          Expected Outcome
                        </strong>
                        <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {task.expected_outcome}
                        </p>
                      </div>
                    )}

                    {/* Submission / Notes Field */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Your Work / Submission Notes
                      </label>
                      <textarea
                        rows={3}
                        value={notesMap[task.id] !== undefined ? notesMap[task.id] : (task.user_notes || '')}
                        onChange={(e) => setNotesMap({ ...notesMap, [task.id]: e.target.value })}
                        placeholder="Type your code snippet, multimeter readings, or notes here for instant AI feedback..."
                        className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(task.id, 'in_progress')}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Mark In Progress
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(task.id, 'skipped')}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-400 hover:bg-slate-50"
                          >
                            Skip
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={submittingTaskId === task.id}
                          onClick={() => handleSubmitNotes(task)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{submittingTaskId === task.id ? 'Evaluating...' : 'Submit & Get AI Feedback'}</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Feedback Banner */}
                    {task.ai_feedback && (
                      <div className="mt-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fade-in">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>AI Mentor Evaluation & Coaching Feedback</span>
                        </div>
                        <p className="text-xs leading-relaxed text-emerald-950 font-medium">
                          {task.ai_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
