import { motion } from 'framer-motion';
import { ChevronRight, History, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import AIInterviewSkeleton from '../components/AIInterviewSkeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/helpers';

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

const AIInterviewHistory = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await api.get('/ai-interviews/sessions');
        setSessions(response.data.sessions || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load AI interview history.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [api]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <AIInterviewSkeleton compact />
          <AIInterviewSkeleton compact />
          <AIInterviewSkeleton compact />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_35%)] bg-gray-50 dark:bg-dark-950">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-panel backdrop-blur dark:border-white/10 dark:bg-dark-900/80">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300">AI interview history</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">Track your interview improvement</h1>
          </div>
          <button
            onClick={() => navigate('/ai-interview')}
            className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-lg dark:bg-white dark:text-gray-950"
          >
            <Sparkles size={16} />
            Start a new session
          </button>
        </div>

        {!sessions.length ? (
          <div className="rounded-[30px] border border-white/60 bg-white/80 p-10 text-center shadow-panel backdrop-blur dark:border-white/10 dark:bg-dark-900/80">
            <History className="mx-auto h-10 w-10 text-primary-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No interview history yet</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Complete one session and your analytics timeline will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/ai-interview/results/${session.id}`)}
                className="w-full rounded-[28px] border border-white/60 bg-white/80 p-5 text-left shadow-panel backdrop-blur transition hover:-translate-y-0.5 hover:border-primary-300 dark:border-white/10 dark:bg-dark-900/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-600 dark:text-primary-300">
                      {session.status === 'completed' ? 'Completed session' : 'Draft session'}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{formatRoleLabel(session.jobRole)}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formatDate(session.createdAt)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-200">
                        {difficultyLabels[session.difficulty] || 'Medium'}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                        {session.interviewMode === 'with-resume' ? 'Resume' : 'No Resume'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.finalAnalysis ? (
                      <div className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300">
                        Confidence {session.finalAnalysis.confidence}%
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                        In progress
                      </div>
                    )}
                    <ChevronRight className="text-gray-400" size={18} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInterviewHistory;