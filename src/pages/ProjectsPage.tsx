import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  Code2,
  FileCheck,
  ShieldCheck,
  Award,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { JourneyStepper } from '../components/layout/JourneyStepper';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeGoal, setActiveGoal] = useState<string | null>(null);

  // Active submission modal state
  const [submittingProject, setSubmittingProject] = useState<any | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects();
      if (res?.projects) {
        setProjects(res.projects);
        setActiveGoal(res.activeGoal || null);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmit = (proj: any) => {
    setSubmittingProject(proj);
    setDeliverableUrl(proj.userSubmission?.deliverable_url || '');
    setDeliverableNotes(proj.userSubmission?.deliverable_notes || '');
    setSubmissionSuccess(null);
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableUrl.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.submitProject({
        projectId: submittingProject.id,
        projectTitle: submittingProject.title,
        category: submittingProject.category,
        deliverableUrl,
        deliverableNotes
      });

      if (res.success) {
        setSubmissionSuccess('Deliverable submitted and verified. +20 Points added to your Career Readiness Score!');
        loadProjects();
        setTimeout(() => {
          setSubmittingProject(null);
        }, 1800);
      }
    } catch (err) {
      console.error('Error submitting project deliverable:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner label="Loading Project-Based Learning Studio..." subtext="Retrieving career-specific briefs and evaluation rubrics" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <JourneyStepper />

      {/* Hero Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                Stage 9 Execution
              </span>
              <span className="text-xs text-slate-500">
                Applied Proof of Work
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Project-Based Learning (PBL) Studio
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Real-world industry briefs designed to build demonstrable proof of work for your portfolio, interviews, and freelancing proposals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/readiness')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <span>View Career Readiness Score</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlight target role */}
        {activeGoal && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-indigo-900 font-medium">
              Curated for your target pathway: <strong className="text-indigo-700 font-bold">{activeGoal}</strong>
            </span>
            <span className="text-indigo-600 font-semibold text-[11px]">
              Submission verifies 4 key competencies
            </span>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {projects.map((proj) => {
          const isSubmitted = proj.userStatus === 'submitted';
          return (
            <div
              key={proj.id}
              className={`bg-white rounded-2xl border transition-all p-6 sm:p-7 shadow-sm ${
                isSubmitted ? 'border-emerald-300 ring-1 ring-emerald-400/30' : 'border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {proj.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {proj.durationWeeks} Weeks
                    </span>
                    <span className="text-xs text-indigo-600 font-semibold">
                      • {proj.difficulty}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{proj.title}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Target Role: <strong className="text-slate-800">{proj.targetCareer}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isSubmitted ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Submission ({proj.userScore || 88}/100)</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenSubmit(proj)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/20 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Deliverable</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Problem Statement */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 mb-5">
                <h4 className="text-xs font-bold text-slate-800 mb-1">Problem Statement</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {proj.problemStatement}
                </p>
              </div>

              {/* Grid of Details: Requirements, Skills, Deliverables, Rubric */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                {/* Requirements */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-indigo-600" />
                    <span>Core Functional Requirements</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {proj.requirements.map((req: string, i: number) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                {/* Expected Deliverables */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FolderGit2 className="w-4 h-4 text-emerald-600" />
                    <span>Expected Deliverables</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {proj.expectedDeliverables.map((del: string, i: number) => (
                      <li key={i}>{del}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills Involved Badges */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Skills Involved:</span>
                  {proj.skillsInvolved.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {isSubmitted && (
                  <button
                    onClick={() => handleOpenSubmit(proj)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    Update Submission Link
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {submittingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900">
              Submit Project Deliverable
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Project: <strong className="text-slate-800">{submittingProject.title}</strong>
            </p>

            {submissionSuccess ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium">
                {submissionSuccess}
              </div>
            ) : (
              <form onSubmit={handleSubmitDeliverable} className="space-y-4 my-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Deliverable URL (GitHub, Figma, Google Drive, Live Demo) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/your-username/project-repo"
                    value={deliverableUrl}
                    onChange={(e) => setDeliverableUrl(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Technical Notes / Methodology Highlights
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Briefly describe your approach, tools used, and any challenges you resolved..."
                    value={deliverableNotes}
                    onChange={(e) => setDeliverableNotes(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setSubmittingProject(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitting ? 'Verifying...' : 'Submit Proof of Work'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
