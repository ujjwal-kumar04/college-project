import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-lg dark:border-slate-700 dark:bg-[#1e293b]/80"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/15 dark:text-blue-300">
        <Icon size={22} />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{description}</p>
    </motion.article>
  );
};

export default FeatureCard;
