import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, BrainCircuit, MessageSquareText, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const floatingTransition = {
  duration: 3.5,
  repeat: Infinity,
  repeatType: 'mirror',
  ease: 'easeInOut',
};

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pt-20">
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -20, 10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
          className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -25, 10, 0], y: [0, 20, -15, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl"
        />
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:border-blue-400/25 dark:bg-blue-500/15 dark:text-blue-200">
            AI-powered interview platform
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Crack Interviews Faster with
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> Real AI Coaching</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-gray-600 dark:text-gray-300 sm:text-lg">
            QuizMatrix combines AI mock interviews, smart mock tests, analytics dashboards, and collaborative learning tools in one premium workspace for students and educators.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-700">
                Start Interview Now
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.a
              whileHover={{ scale: 1.02 }}
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-[#1e293b] dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
            >
              <PlayCircle size={16} />
              See How It Works
            </motion.a>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: 'AI Sessions', value: '120K+' },
              { label: 'Avg. Boost', value: '+34%' },
              { label: 'Institutes', value: '300+' },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-700 dark:bg-[#1e293b]/80">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [-4, 8, -4] }}
            transition={floatingTransition}
            className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-[#1e293b]/85"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Live Interview Preview</p>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">Question 2/5</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm text-slate-900 dark:text-slate-100">How would you optimize a slow API endpoint serving 50k requests/min?</p>
            </div>
            <div className="mt-4 space-y-3">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-blue-50 px-2 py-3 dark:bg-blue-500/10">
                  <BrainCircuit className="mx-auto text-blue-600 dark:text-blue-300" size={18} />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">AI Scoring</p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-2 py-3 dark:bg-emerald-500/10">
                  <MessageSquareText className="mx-auto text-emerald-600 dark:text-emerald-300" size={18} />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Feedback</p>
                </div>
                <div className="rounded-xl bg-purple-50 px-2 py-3 dark:bg-purple-500/10">
                  <BarChart3 className="mx-auto text-purple-600 dark:text-purple-300" size={18} />
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Analytics</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
