
const AIInterviewSkeleton = ({ compact = false }) => {
  return (
    <div className="card overflow-hidden">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-28 rounded-full bg-gray-200 dark:bg-dark-700" />
        <div className={`rounded-2xl bg-gray-200 dark:bg-dark-700 ${compact ? 'h-24' : 'h-40'}`} />
        <div className="space-y-2">
          <div className="h-3 w-full rounded-full bg-gray-200 dark:bg-dark-700" />
          <div className="h-3 w-5/6 rounded-full bg-gray-200 dark:bg-dark-700" />
          <div className="h-3 w-2/3 rounded-full bg-gray-200 dark:bg-dark-700" />
        </div>
      </div>
    </div>
  );
};

export default AIInterviewSkeleton;