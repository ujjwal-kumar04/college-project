import { motion } from 'framer-motion';
import {
    Brain,
    BriefcaseBusiness,
    ChartNoAxesCombined,
    CheckCircle2,
    Clock3,
    FileStack,
    GraduationCap,
    MessagesSquare,
    Mic,
    ShieldCheck,
    Trophy,
    UserRoundCheck,
    Users
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CTASection from '../components/landing/CTASection.jsx';
import FeatureCard from '../components/landing/FeatureCard.jsx';
import HeroSection from '../components/landing/HeroSection.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';
import LandingNavbar from '../components/landing/LandingNavbar.jsx';
import SectionWrapper from '../components/landing/SectionWrapper.jsx';

const features = [
  {
    icon: Brain,
    title: 'AI Mock Interviews',
    description: 'Role-specific interview sessions with dynamic AI questions and structured scoring rubrics.',
  },
  {
    icon: Mic,
    title: 'Voice + Text Answers',
    description: 'Respond naturally with microphone input or type confidently, then review instant feedback.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Performance Analytics',
    description: 'Track communication, relevance, technical depth, and behavioral fit with visual insights.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Role & Difficulty Modes',
    description: 'Practice frontend, backend, HR rounds, and more across easy, medium, and hard challenges.',
  },
  {
    icon: FileStack,
    title: 'Mock Tests & Exam Engine',
    description: 'Generate exam-ready practice with timed tests and teacher-created assessments.',
  },
  {
    icon: MessagesSquare,
    title: 'Community Learning',
    description: 'Use forums, study groups, and doubt discussion spaces to accelerate preparation together.',
  },
];

const steps = [
  {
    title: 'Select role and interview mode',
    description: 'Pick role, interview type, and difficulty. Optional resume mode personalizes the session.',
  },
  {
    title: 'Take AI-guided practice',
    description: 'Answer timed questions through voice or text while the system tracks context and confidence.',
  },
  {
    title: 'Review actionable feedback',
    description: 'Get scorecards, strengths, gaps, and concrete improvement suggestions instantly.',
  },
  {
    title: 'Improve with dashboard loops',
    description: 'Use history, mock tests, and study material workflows to continuously raise performance.',
  },
];

const testimonials = [
  {
    name: 'Aman Verma',
    role: 'Final-year CSE student',
    quote:
      'The AI interview feedback felt like a real mentor. My confidence in technical rounds improved within two weeks.',
  },
  {
    name: 'Priya Singh',
    role: 'Training coordinator',
    quote:
      'Teacher dashboards and exam workflows helped us evaluate students faster with much better clarity.',
  },
  {
    name: 'Rohan Das',
    role: 'Backend developer intern',
    quote:
      'The combination of mock tests and AI interview analytics made preparation structured and measurable.',
  },
];

const typingLines = [
  'Great structure. You explained trade-offs clearly.',
  'Improve by quantifying impact with a metric.',
  'Next attempt target: reduce filler words by 15%.',
];

const LandingPage = () => {
  const [typedText, setTypedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const activeLine = useMemo(() => typingLines[lineIndex], [lineIndex]);

  useEffect(() => {
    const isLineComplete = charIndex >= activeLine.length;
    const timer = setTimeout(
      () => {
        if (isLineComplete) {
          setCharIndex(0);
          setLineIndex((prev) => (prev + 1) % typingLines.length);
          setTypedText('');
          return;
        }

        const next = activeLine.slice(0, charIndex + 1);
        setTypedText(next);
        setCharIndex((prev) => prev + 1);
      },
      isLineComplete ? 1200 : 45
    );

    return () => clearTimeout(timer);
  }, [activeLine, charIndex, lineIndex]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-900 transition-colors duration-300 dark:bg-[#0f172a] dark:text-white">
      <LandingNavbar />
      <HeroSection />

      <SectionWrapper
        id="problem"
        eyebrow="The Challenge"
        title="Preparation is fragmented and feedback is too late"
        description="Most learners switch between random question banks, one-off mock tests, and generic advice. There is no real interview simulation loop."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock3, text: 'Late feedback after interviews' },
            { icon: Users, text: 'No personalized role guidance' },
            { icon: Trophy, text: 'Hard to track actual growth' },
            { icon: ShieldCheck, text: 'Inconsistent quality across tools' },
          ].map((item) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-[#1e293b]"
            >
              <item.icon className="text-blue-600 dark:text-blue-300" size={20} />
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="solution"
        eyebrow="The Solution"
        title="One intelligent workspace from practice to performance"
        description="QuizMatrix unifies interview simulation, exams, mock tests, discussion forums, and analytics into one smooth SaaS experience."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#1e293b]"
          >
            <h3 className="text-xl font-semibold">Why teams choose QuizMatrix</h3>
            <ul className="mt-5 space-y-4">
              {[
                'AI interviews aligned to actual hiring rounds',
                'Teacher & student workflows in one product',
                'Continuous analytics instead of one-time scores',
                'Real-time feedback for faster learning loops',
              ].map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={18} className="mt-0.5 text-blue-600 dark:text-blue-300" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-700 dark:bg-[#1e293b]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">AI feedback stream</p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="min-h-[56px] text-sm text-slate-700 dark:text-slate-200">
                {typedText}
                <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-blue-500" />
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-500/15">
                <p className="text-xs text-slate-500 dark:text-slate-300">Communication</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">84</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/15">
                <p className="text-xs text-slate-500 dark:text-slate-300">Technical</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">79</p>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="features"
        eyebrow="Feature Suite"
        title="Everything you need for interview success"
        description="Built for modern learners and institutions with role-based intelligence and fast execution."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: idx * 0.04 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="how-it-works"
        eyebrow="How It Works"
        title="A practical 4-step preparation loop"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#1e293b]"
            >
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {idx + 1}
              </div>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="roles"
        eyebrow="Role-based Product"
        title="Built for both learners and educators"
        description="Two experiences, one platform, shared outcomes."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-slate-700 dark:bg-[#1e293b]"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
              <GraduationCap size={20} />
            </div>
            <h3 className="mt-4 text-xl font-semibold">For Students</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-blue-500" />AI mock interviews with voice and text</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-blue-500" />Mock tests and previous papers</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-blue-500" />History and growth dashboard</li>
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-slate-700 dark:bg-[#1e293b]"
          >
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <UserRoundCheck size={20} />
            </div>
            <h3 className="mt-4 text-xl font-semibold">For Teachers</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" />Create and manage exams by key</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" />Track submissions and analytics</li>
              <li className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 text-emerald-500" />Upload materials and past papers</li>
            </ul>
          </motion.div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="dashboard-preview"
        eyebrow="Dashboard Preview"
        title="Clarity-first analytics at a glance"
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#1e293b]"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Interviews Completed', value: '42' },
              { label: 'Average Confidence', value: '81%' },
              { label: 'Skill Growth', value: '+26%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex items-end justify-between">
              {[44, 58, 51, 62, 77, 81, 86].map((v, i) => (
                <motion.div
                  key={`bar-${i}`}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${v}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="w-8 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400"
                  style={{ maxHeight: '130px' }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </SectionWrapper>

      <SectionWrapper
        id="ai-preview"
        eyebrow="AI Interview Experience"
        title="Interactive interview UX with real-time guidance"
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#1e293b]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Question Card</p>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-300">00:34</span>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                Explain how you would improve API latency while ensuring data consistency.
              </p>
            </div>
            <div className="mt-4 h-28 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xs text-slate-500 dark:text-slate-400">Answer draft...</p>
              <div className="mt-3 flex gap-2">
                <div className="h-2 w-24 animate-pulse rounded bg-slate-300 dark:bg-slate-600" />
                <div className="h-2 w-16 animate-pulse rounded bg-slate-300 dark:bg-slate-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#1e293b]"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Instant AI Coaching</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="rounded-xl bg-blue-50 p-3 dark:bg-blue-500/15">Good structure: context → action → outcome.</li>
              <li className="rounded-xl bg-amber-50 p-3 dark:bg-amber-500/15">Add one metric to strengthen impact.</li>
              <li className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-500/15">Excellent technical clarity.</li>
            </ul>
            <Link
              to="/login"
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Live Interview
            </Link>
          </motion.div>
        </div>
      </SectionWrapper>

      <SectionWrapper
        id="testimonials"
        eyebrow="Loved by Learners"
        title="What users say"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((item, idx) => (
            <motion.blockquote
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.06 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-[#1e293b]"
            >
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">“{item.quote}”</p>
              <footer className="mt-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </SectionWrapper>

      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
