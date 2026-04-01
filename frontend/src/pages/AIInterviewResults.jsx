import { motion } from 'framer-motion';
import { ArrowLeft, BriefcaseBusiness, Mail, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import AIAnalyticsRadar from '../components/AIAnalyticsRadar.jsx';
import AIInterviewSkeleton from '../components/AIInterviewSkeleton.jsx';
import AIScoreBar from '../components/AIScoreBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, formatTimeTaken } from '../utils/helpers';

const roleLabels = {
  'software-engineer': 'Software Engineer',
  'product-manager': 'Product Manager',
  'data-scientist': 'Data Scientist',
  'ui-ux-designer': 'UI/UX Designer',
};

const formatRoleLabel = (role) => {
  if (!role) {
    return 'Interview';
  }

  return roleLabels[role] || role.split(/[-_\s]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
};

const difficultyLabels = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

const AIInterviewResults = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useParams();
  const [session, setSession] = useState(location.state?.session || null);
  const [loading, setLoading] = useState(!location.state?.session);

  useEffect(() => {
    if (session) {
      return;
    }

    const fetchSession = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/ai-interviews/sessions/${sessionId}`);
        setSession(response.data.session);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load interview result.');
        navigate('/ai-interview/history', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [api, navigate, session, sessionId]);

  const analysis = useMemo(() => session?.finalAnalysis || null, [session]);

  if (loading || !analysis || !session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <AIInterviewSkeleton />
          <AIInterviewSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.15),_transparent_30%)] bg-slate-50 dark:bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate('/ai-interview/history')}
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white/70 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-[#1e293b]/80 dark:text-slate-100"
          >
            <ArrowLeft size={16} />
            Interview history
          </button>
          <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm backdrop-blur dark:bg-[#1e293b]/80 dark:text-gray-300">
            Completed on {formatDate(session.completedAt || session.createdAt)}
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-[#1e293b]/90"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300">AI interview dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">{formatRoleLabel(session.jobRole)}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-200">
                  {difficultyLabels[session.difficulty] || 'Medium'} difficulty
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {session.interviewMode === 'with-resume' ? 'Resume-based' : 'Role-based'} mode
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-200">
                Confidence {analysis.confidence}%
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200">
                {session.answers.length} answers reviewed
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-gray-200 bg-white/85 p-5 dark:border-slate-700 dark:bg-slate-800/90">
              <AIAnalyticsRadar analysis={analysis} />
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-white/85 p-5 dark:border-slate-700 dark:bg-slate-800/90 space-y-5">
              <AIScoreBar label="Communication" score={analysis.communication_score} />
              <AIScoreBar label="Relevance" score={analysis.relevance_score} />
              <AIScoreBar label="Technical Depth" score={analysis.technical_depth} />
              <AIScoreBar label="Behavioral Fit" score={analysis.behavioral_fit} />
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-[#1e293b]/90">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp size={18} />
              <h2 className="text-lg font-semibold">Strengths</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {analysis.strengths.map((item) => (
                <li key={item} className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/10 dark:bg-emerald-500/10 dark:text-emerald-200">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-[#1e293b]/90">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <BriefcaseBusiness size={18} />
              <h2 className="text-lg font-semibold">Improvement focus</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {analysis.improvements.map((item) => (
                <li key={item} className="rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/10 dark:bg-amber-500/10 dark:text-amber-200">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-[#1e293b]/90">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Mail size={18} />
            <h2 className="text-lg font-semibold">Mock HR email</h2>
          </div>
          <div className="mt-4 rounded-3xl border border-gray-200 bg-gray-50/80 p-5 leading-7 text-gray-700 dark:border-slate-700 dark:bg-slate-800/90 dark:text-gray-200">
            {analysis.hr_email_response}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-[#1e293b]/90">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Question-by-question review</h2>
          <div className="mt-5 space-y-4">
            {session.answers.map((answer, index) => (
              <div key={`${answer.questionIndex}-${index}`} className="rounded-3xl border border-gray-200 bg-white/85 p-5 dark:border-slate-700 dark:bg-slate-800/90">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-600 dark:text-primary-300">Question {answer.questionIndex + 1}</p>
                    <h3 className="mt-1 text-base font-semibold text-gray-900 dark:text-white">{answer.questionText}</h3>
                  </div>
                  <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-slate-700 dark:text-gray-200">
                    {formatTimeTaken(answer.timeSpentSeconds)}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">{answer.answerText}</p>
                <p className="mt-3 rounded-2xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm text-primary-800 dark:border-primary-500/10 dark:bg-primary-500/10 dark:text-primary-200">
                  {answer.analysis.short_feedback}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AIInterviewResults;