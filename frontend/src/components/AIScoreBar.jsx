
const AIScoreBar = ({ label, score }) => {
  const percentage = Math.max(0, Math.min(100, score * 10));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-white">{score}/10</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-dark-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 via-cyan-400 to-emerald-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default AIScoreBar;