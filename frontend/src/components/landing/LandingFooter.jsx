import { Link } from 'react-router-dom';

const LandingFooter = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-[#0f172a]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">QuizMatrix</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">AI-powered interview and learning platform.</p>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm">
          <a href="#features" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300">Features</a>
          <a href="#roles" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300">Student & Teacher</a>
          <a href="#testimonials" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300">Testimonials</a>
          <Link to="/login" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300">Sign In</Link>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} QuizMatrix. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default LandingFooter;
