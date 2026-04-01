import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="relative overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-600 to-cyan-500 p-8 text-white shadow-2xl shadow-blue-600/30 sm:p-12"
        >
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-black/15 blur-2xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Ready to launch</p>
              <h3 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                Build Interview Confidence with AI-Powered Learning
              </h3>
              <p className="mt-4 text-base text-blue-50/95 sm:text-lg">
                Join thousands of students and teachers using QuizMatrix to practice smarter, assess faster, and improve outcomes.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-blue-50"
              >
                Create Free Account
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
