import { AnimatePresence, motion } from 'framer-motion';
import {
    BrainCircuit,
    ChevronRight,
    Code2, Cpu,
    Edit3,
    History, Loader2,
    Microchip, Network,
    ShieldCheck,
    Sparkles,
    Terminal,
    UploadCloud,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// 1. Data Structure with Branches and Roles
const branchData = [
  { 
    id: 'cse', 
    label: 'CSE', 
    icon: <Code2 size={18} />, 
    roles: [
      { value: 'software-engineer', label: 'Software Engineer', icon: <Terminal size={14}/>, desc: 'Full-stack & App development' },
      { value: 'backend-developer', label: 'Backend Developer', icon: <Terminal size={14}/>, desc: 'System architecture & APIs' },
      { value: 'cybersecurity', label: 'Security Analyst', icon: <Terminal size={14}/>, desc: 'Network & Info security' },
    ]
  },
  { 
    id: 'aiml', 
    label: 'AI-ML', 
    icon: <BrainCircuit size={18} />, 
    roles: [
      { value: 'ml-engineer', label: 'ML Engineer', icon: <BrainCircuit size={14}/>, desc: 'Model training & Deployment' },
      { value: 'data-scientist', label: 'Data Scientist', icon: <BrainCircuit size={14}/>, desc: 'Statistical analysis & Insights' },
      { value: 'ai-researcher', label: 'AI Researcher', icon: <BrainCircuit size={14}/>, desc: 'Deep Learning & Neural Nets' },
    ]
  },
  { 
    id: 'ece', 
    label: 'ECE', 
    icon: <Cpu size={18} />, 
    roles: [
      { value: 'embedded-engineer', label: 'Embedded Engineer', icon: <Microchip size={14}/>, desc: 'Hardware-Software systems' },
      { value: 'vlsi-design', label: 'VLSI Designer', icon: <Microchip size={14}/>, desc: 'Chip design & Fabrication' },
      { value: 'network-engineer', label: 'Network Engineer', icon: <Network size={14}/>, desc: 'Telecom & Wireless systems' },
    ]
  },
];

const difficulties = [
  { value: 'easy', label: 'Easy', color: 'text-green-400', bg: 'bg-green-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { value: 'hard', label: 'Hard', color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const interviewTypes = [
  {
    value: 'technical',
    label: 'Technical',
    desc: 'DSA, system design & core concepts',
    badge: '7T · 2B · 1H',
    color: 'cyan',
    activeClass: 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500',
    badgeClass: 'bg-cyan-500/20 text-cyan-400',
    iconClass: 'bg-cyan-500 text-black',
  },
  {
    value: 'hr',
    label: 'HR Round',
    desc: 'Soft skills, culture fit & motivation',
    badge: '1T · 4B · 5H',
    color: 'purple',
    activeClass: 'border-purple-500 bg-purple-500/10 ring-1 ring-purple-500',
    badgeClass: 'bg-purple-500/20 text-purple-400',
    iconClass: 'bg-purple-500 text-white',
  },
  {
    value: 'pi',
    label: 'PI Round',
    desc: 'Personal interview, mix of all types',
    badge: '3T · 5B · 2H',
    color: 'amber',
    activeClass: 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500',
    badgeClass: 'bg-amber-500/20 text-amber-400',
    iconClass: 'bg-amber-500 text-black',
  },
];

const AIInterviewPractice = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [activeBranch, setActiveBranch] = useState(branchData[0]);
  const [selectedRole, setSelectedRole] = useState(branchData[0].roles[0].value);
  const [customRole, setCustomRole] = useState('');
  const [interviewType, setInterviewType] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');
  const [interviewMode, setInterviewMode] = useState('without-resume');
  const [resumeFile, setResumeFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const requiresResume = interviewMode === 'with-resume';
  const isOtherSelected = selectedRole === 'other';

  const handleBranchChange = (branch) => {
    setActiveBranch(branch);
    setSelectedRole(branch.roles[0].value);
    setCustomRole('');
  };

  const handleStartInterview = async () => {
    const roleToSubmit = isOtherSelected ? customRole : selectedRole;
    
    if (isOtherSelected && !customRole.trim()) {
      return toast.error('Please enter your custom job role');
    }
    if (requiresResume && !resumeFile) {
      return toast.error('Please upload a resume first');
    }

    try {
      setIsStarting(true);
      let resumePayload = { resumeInsights: '', resumeText: '', resumeOriginalName: '' };

      if (requiresResume) {
        setIsScanning(true);
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('jobRole', roleToSubmit);
        formData.append('difficulty', difficulty);

        const { data } = await api.post('/ai-interviews/resume-scan', formData);
        resumePayload = {
          resumeInsights: data.resumeInsights,
          resumeText: data.resumeText,
          resumeOriginalName: data.fileName || resumeFile.name,
        };
      }

      navigate('/ai-interview/session', {
        state: { jobRole: roleToSubmit, difficulty, interviewMode, interviewType, ...resumePayload },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Preparation failed');
    } finally {
      setIsScanning(false);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-[#0f172a] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.14),_transparent_38%)] text-secondary-900 dark:text-slate-100 selection:bg-primary-500/30">
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-500/30 bg-primary-500/5 text-primary-500 text-xs font-bold uppercase tracking-widest">
              <Sparkles size={14} /> AI Interview Lab
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl lg:text-6xl font-bold leading-[1.1] text-secondary-900 dark:text-white">
              Master your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-blue-500">Dream Role.</span>
            </motion.h1>

            <div className="space-y-4 pt-4">
              {[{ icon: BrainCircuit, text: "Branch-specific questions" }, { icon: ShieldCheck, text: "Industry rubric scoring" }, { icon: Zap, text: "Real-time AI feedback" }].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-secondary-700 dark:text-secondary-300">
                  <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700/50"><item.icon size={18} className="text-primary-500" /></div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate('/ai-interview/history')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-secondary-800/40 border border-secondary-200 dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all text-sm font-semibold text-secondary-900 dark:text-white">
              <History size={18} /> View Past Sessions
            </button>
          </div>

          {/* Right Column */}
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-7">
  <div className="p-[1px] rounded-[2.5rem] bg-gradient-to-b from-secondary-200 dark:from-slate-700/30 to-transparent backdrop-blur-2xl">
    
    <div className="bg-white dark:bg-[#1e293b] rounded-[2.3rem] p-8 lg:p-10 border border-secondary-200 dark:border-slate-700 shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.55)]">

      {/* 1. Branch Selector */}
      <section className="mb-8">
        <h3 className="text-secondary-900 dark:text-white font-bold mb-4 flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-[10px] text-white font-black">01</span>
          Select Your Branch
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {branchData.map((branch) => (
            <button
              key={branch.id}
              onClick={() => handleBranchChange(branch)}
              className={`py-3 px-2 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                activeBranch.id === branch.id
                  ? 'border-primary-500 bg-primary-500/10 text-secondary-900 dark:text-white shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  : 'border-secondary-200 dark:border-slate-700 bg-white dark:bg-[#24324a] text-secondary-600 dark:text-slate-300 hover:border-primary-500/50'
              }`}
            >
              {branch.icon}
              <span className="text-[11px] font-bold uppercase tracking-wider">{branch.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Role Selector */}
      <section className="mb-10">
        <h3 className="text-secondary-900 dark:text-white font-bold mb-4 flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-[10px] text-white font-black">02</span>
          Target Post
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <AnimatePresence mode="wait">
            {activeBranch.roles.map((role) => (
              <motion.button
                key={role.value}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedRole(role.value)}
                className={`relative p-4 rounded-2xl border transition-all text-left ${
                  selectedRole === role.value
                    ? 'border-primary-500 bg-secondary-100 dark:bg-[#24324a] ring-1 ring-primary-500'
                    : 'border-secondary-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] hover:border-primary-500/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedRole === role.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                  }`}>
                    {role.icon}
                  </div>

                  <div>
                    <p className="font-bold text-secondary-900 dark:text-white text-sm leading-tight">
                      {role.label}
                    </p>
                    <p className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1">
                      {role.desc}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Other Option */}
          <button
            onClick={() => setSelectedRole('other')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${
              selectedRole === 'other'
                ? 'border-accent-yellow bg-accent-yellow/10 ring-1 ring-accent-yellow'
                : 'border-secondary-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] hover:border-accent-yellow/40'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              selectedRole === 'other'
                ? 'bg-accent-yellow text-white'
                : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
            }`}>
              <Edit3 size={14}/>
            </div>

            <span className="font-bold text-sm text-secondary-900 dark:text-white">
              Other / Custom
            </span>
          </button>
        </div>

        {/* Custom Role Input */}
        <AnimatePresence>
          {isOtherSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Ex: Cloud Architect, Product Designer..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full bg-white dark:bg-[#1e293b] border border-secondary-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-secondary-900 dark:text-white outline-none focus:border-accent-yellow transition-all"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. Interview Type */}
      <section className="mb-8">
        <h3 className="text-secondary-900 dark:text-white font-bold mb-4 flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-[10px] text-white font-black">03</span>
          Interview Type
        </h3>

        <div className="grid grid-cols-3 gap-3">
          {interviewTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setInterviewType(type.value)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                interviewType === type.value
                  ? `border-primary-500 bg-primary-500/10 ring-1 ring-primary-500`
                  : 'border-secondary-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] hover:border-primary-500/40'
              }`}
            >
              <p className="font-bold text-secondary-900 dark:text-white text-sm">{type.label}</p>
              <p className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1">{type.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Difficulty */}
      <section className="mb-8">
        <h3 className="text-secondary-900 dark:text-white font-bold mb-4 flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-[10px] text-white font-black">04</span>
          Difficulty Level
        </h3>
        <div className="flex items-center gap-3 bg-secondary-100 dark:bg-[#1f2b3d] p-1.5 rounded-full">
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className={`w-full text-center py-2.5 rounded-full text-sm font-bold transition-all ${
                difficulty === d.value
                  ? `bg-white dark:bg-[#0f172a] shadow-sm text-primary-500`
                  : 'text-secondary-500 hover:bg-white/50 dark:hover:bg-slate-800/60'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </section>

      {/* 5. Resume Mode */}
      <section className="mb-10">
        <h3 className="text-secondary-900 dark:text-white font-bold mb-4 flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-[10px] text-white font-black">05</span>
          Interview Mode
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setInterviewMode('without-resume')}
            className={`p-4 rounded-2xl border transition-all text-left ${
              interviewMode === 'without-resume'
                ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500'
                : 'border-secondary-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] hover:border-primary-500/40'
            }`}
          >
            <p className="font-bold text-secondary-900 dark:text-white text-sm">Standard Mode</p>
            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1">General questions based on role.</p>
          </button>
          <button
            onClick={() => setInterviewMode('with-resume')}
            className={`p-4 rounded-2xl border transition-all text-left ${
              interviewMode === 'with-resume'
                ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500'
                : 'border-secondary-200 dark:border-slate-700 bg-white dark:bg-[#1e293b] hover:border-primary-500/40'
            }`}
          >
            <p className="font-bold text-secondary-900 dark:text-white text-sm">Resume-Based</p>
            <p className="text-[10px] text-secondary-500 dark:text-secondary-400 mt-1">Questions tailored to your resume.</p>
          </button>
        </div>
      </section>

      {/* Resume Upload */}
      <AnimatePresence>
        {requiresResume && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-10"
          >
            <div className="border-2 border-dashed border-secondary-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-white dark:bg-[#1e293b]">
              <label htmlFor="resume-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center mb-3">
                    <UploadCloud className="text-primary-500" />
                  </div>
                  {resumeFile ? (
                    <>
                      <p className="font-bold text-primary-600 dark:text-primary-400">{resumeFile.name}</p>
                      <p className="text-xs text-secondary-500">({(resumeFile.size / 1024).toFixed(1)} KB) - Click to change</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-secondary-900 dark:text-white">Upload Your Resume</p>
                      <p className="text-xs text-secondary-500">PDF, DOCX up to 5MB</p>
                    </>
                  )}
                </div>
                <input
                  id="resume-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </label>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Start Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleStartInterview}
        disabled={isStarting}
        className="w-full group bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(99,102,241,0.3)] disabled:opacity-60"
      >
        {isStarting ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>{isScanning ? 'Scanning Resume...' : 'Preparing Session...'}</span>
          </>
        ) : (
          <>
            <span>Start Your Interview</span>
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </motion.button>
    </div>
  </div>
</motion.div>
        </div>
      </main>
    </div>
  );
};

export default AIInterviewPractice;
