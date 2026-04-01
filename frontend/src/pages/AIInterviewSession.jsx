import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, Play, Send, SquareTerminal, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import AIInterviewSkeleton from '../components/AIInterviewSkeleton.jsx';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import useSpeechRecognition from '../hooks/useSpeechRecognition.js';
import { formatTimer } from '../utils/helpers';

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

const AIInterviewSession = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.jobRole;
  const selectedDifficulty = location.state?.difficulty || 'medium';
  const interviewMode = location.state?.interviewMode || 'without-resume';
  const interviewType = location.state?.interviewType || 'technical';
  const resumeText = location.state?.resumeText || '';
  const resumeInsights = location.state?.resumeInsights || '';
  const resumeOriginalName = location.state?.resumeOriginalName || '';
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [manualAnswer, setManualAnswer] = useState('');
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const audioRef = useRef(null);
  const autoSubmittedRef = useRef(false);
  const {
    isSupported,
    isListening,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!selectedRole) {
      navigate('/ai-interview', { replace: true });
    }
  }, [navigate, selectedRole]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!selectedRole) {
        return;
      }

      try {
        setLoading(true);
        const createResponse = await api.post('/ai-interviews/sessions', {
          jobRole: selectedRole,
          difficulty: selectedDifficulty,
          interviewMode,
          interviewType,
          resumeText,
          resumeInsights,
          resumeOriginalName,
        });
        const id = createResponse.data.session.id;
        setSessionId(id);

        const questionsResponse = await api.post('/ai-interviews/generate-questions', { sessionId: id });
        setQuestions(questionsResponse.data.questions || []);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to start AI interview session.');
        navigate('/ai-interview', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [
    api,
    interviewType,
    interviewMode,
    navigate,
    resumeInsights,
    resumeOriginalName,
    resumeText,
    selectedDifficulty,
    selectedRole,
  ]);

  useEffect(() => {
    if (loading || !questions.length || submitting) {
      return undefined;
    }

    autoSubmittedRef.current = false;
    setTimer(60);
    resetTranscript();
    setManualAnswer('');

    const interval = setInterval(() => {
      setTimer((current) => {
        if (current <= 1) {
          clearInterval(interval);
          if (!autoSubmittedRef.current) {
            autoSubmittedRef.current = true;
          }
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeIndex, loading, questions.length, resetTranscript, submitting]);

  useEffect(() => {
    if (speechError) {
      toast.error(speechError);
    }
  }, [speechError]);

  const currentQuestion = questions[activeIndex];

  const mergedAnswer = useMemo(() => {
    return transcript || manualAnswer;
  }, [manualAnswer, transcript]);

  const speakQuestion = async () => {
    if (!currentQuestion || isPlayingVoice) {
      return;
    }

    try {
      setIsPlayingVoice(true);
      const response = await api.post(
        '/ai-interviews/text-to-speech',
        { text: currentQuestion.prompt },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(response.data);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsPlayingVoice(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        setIsPlayingVoice(false);
      };
      await audio.play();
    } catch (error) {
      setIsPlayingVoice(false);
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(currentQuestion.prompt);
        utterance.onend = () => setIsPlayingVoice(false);
        window.speechSynthesis.speak(utterance);
      } else {
        toast.error('Question voice playback is unavailable.');
      }
    }
  };

  const handleSkip = () => {
    if (submitting || !currentQuestion) return;
    if (activeIndex < questions.length - 1) {
      resetTranscript();
      setManualAnswer('');
      setActiveIndex((current) => current + 1);
    }
  };

  const handleSubmitAnswer = useCallback(async (timedOut = false) => {
    if (!currentQuestion || submitting) {
      return;
    }

    const answerText = (transcript || manualAnswer).trim();
    if (!answerText) {
      toast.error(timedOut ? 'Time up. Add at least a short answer before continuing.' : 'Please record or type an answer first.');
      return;
    }

    try {
      setSubmitting(true);
      if (isListening) {
        stopListening();
      }

      const response = await api.post('/ai-interviews/analyze-answer', {
        sessionId,
        questionIndex: activeIndex,
        questionType: currentQuestion.type,
        questionText: currentQuestion.prompt,
        answerText,
        transcript: transcript || '',
        timeSpentSeconds: 60 - timer,
      });

      const nextAnswers = [
        ...savedAnswers.filter((item) => item.questionIndex !== activeIndex),
        {
          questionIndex: activeIndex,
          questionType: currentQuestion.type,
          questionText: currentQuestion.prompt,
          answerText,
          transcript,
          timeSpentSeconds: 60 - timer,
          analysis: response.data.analysis,
        },
      ].sort((left, right) => left.questionIndex - right.questionIndex);

      setSavedAnswers(nextAnswers);

      if (activeIndex < questions.length - 1) {
        setActiveIndex((current) => current + 1);
      } else {
        const finalResponse = await api.post('/ai-interviews/final-analysis', { sessionId });
        navigate(`/ai-interview/results/${sessionId}`, {
          replace: true,
          state: {
            session: finalResponse.data.session,
          },
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze answer.');
    } finally {
      setSubmitting(false);
    }
  }, [
    activeIndex,
    api,
    currentQuestion,
    isListening,
    manualAnswer,
    navigate,
    questions.length,
    savedAnswers,
    sessionId,
    stopListening,
    submitting,
    timer,
    transcript,
  ]);

  useEffect(() => {
    if (timer !== 0 || autoSubmittedRef.current === false || submitting) {
      return;
    }

    handleSubmitAnswer(true);
  }, [handleSubmitAnswer, submitting, timer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <AIInterviewSkeleton />
          <AIInterviewSkeleton />
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <Loading text="Preparing your interview..." />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_32%)] bg-gray-50 dark:bg-[#0f172a] dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_36%)]">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-panel backdrop-blur-xl dark:border-slate-700/70 dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-800/85">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-600 dark:text-primary-300">Live interview session</p>
            <h1 className="mt-2 text-2xl font-bold text-gray-950 dark:text-white">{formatRoleLabel(selectedRole)}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-200">
                {difficultyLabels[selectedDifficulty] || 'Medium'} difficulty
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
                {interviewMode === 'with-resume' ? '📄 Resume-based' : 'Role-based'} mode
              </span>
              {interviewType && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  interviewType === 'technical' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300' :
                  interviewType === 'hr' ? 'bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300' :
                  'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
                }`}>
                  {interviewType === 'technical' ? '⚙️ Technical' : interviewType === 'hr' ? '🤝 HR Round' : '🎯 PI Round'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 dark:border-primary-500/20 dark:bg-primary-500/10 dark:text-primary-300">
              Question {activeIndex + 1} / {questions.length}
            </div>
            <div className={`rounded-full px-4 py-2 text-sm font-semibold ${timer <= 10 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200' : 'bg-gray-100 text-gray-700 dark:bg-dark-800/80 dark:text-gray-100'}`}>
              {formatTimer(timer)}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-full bg-gray-200 dark:bg-slate-800/90 border border-gray-100/60 dark:border-slate-700">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-primary-500 via-sky-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${((activeIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.28 }}
            className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-800/90">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-gray-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white dark:bg-white dark:text-gray-950">
                  {currentQuestion.type}
                </span>
                <button
                  onClick={speakQuestion}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-100 dark:hover:border-blue-400"
                >
                  <Volume2 size={16} />
                  {isPlayingVoice ? 'Playing...' : 'Play question'}
                </button>
              </div>

              <h2 className="mt-5 text-2xl font-semibold leading-9 text-gray-950 dark:text-white">
                {currentQuestion.prompt}
              </h2>
              <p className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 text-sm text-primary-800 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-50">
                {currentQuestion.guidance}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/90">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Voice input</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isSupported ? 'Use your microphone to answer naturally.' : 'Speech recognition is not supported in this browser.'}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={!isSupported}
                      className="inline-flex items-center gap-2 rounded-full bg-gray-950 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-950"
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                      {isListening ? 'Stop recording' : 'Start recording'}
                    </button>
                    <button
                      onClick={resetTranscript}
                      className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-slate-600 dark:text-slate-100"
                    >
                      Reset transcript
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/90">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Manual input</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Type your answer if you prefer precise phrasing.</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <SquareTerminal size={16} />
                    Transcript and typed answer are both accepted.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-panel backdrop-blur dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900/90 dark:to-slate-800/90">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Your answer</label>
              <textarea
                value={manualAnswer}
                onChange={(event) => setManualAnswer(event.target.value)}
                placeholder="Answer here or use the microphone. Strong answers usually show context, action, and impact."
                className="mt-3 h-60 w-full rounded-3xl border border-gray-200 bg-gray-50/90 px-4 py-4 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-400/25"
              />

              <div className="mt-4 rounded-3xl border border-dashed border-gray-300 bg-gray-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Live transcript</p>
                  {isListening && <span className="rounded-full bg-red-500 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">Recording</span>}
                </div>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-gray-600 dark:text-slate-100">
                  {transcript || 'Your microphone transcript will appear here in real time.'}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                  {mergedAnswer.trim().split(/\s+/).filter(Boolean).length} words captured
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={speakQuestion}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 dark:border-slate-600 dark:text-slate-100 dark:hover:border-blue-400"
                  >
                    <Play size={16} />
                    Replay
                  </button>
                  {activeIndex < questions.length - 1 && (
                    <button
                      onClick={handleSkip}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-400 px-4 py-2 text-sm font-semibold text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-500/20"
                    >
                      Next &rarr;
                    </button>
                  )}
                  <button
                    onClick={() => handleSubmitAnswer(false)}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={16} />
                    {submitting ? 'Analyzing...' : activeIndex === questions.length - 1 ? 'Finish interview' : 'Submit answer'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIInterviewSession;