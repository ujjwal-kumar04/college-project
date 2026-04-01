import { Link } from 'react-router-dom';
import questions from '../../data/questions.json';

const MockTestHome = () => {
  const categories = [...new Set(questions.map(q => q.category))];

  const categoryDetails = {
    "Aptitude": "Sharpen your quantitative and problem-solving skills.",
    "Reasoning": "Test your logical and analytical thinking abilities.",
    "Verbal Ability": "Improve your vocabulary, grammar, and comprehension.",
    "Programming": "Assess your knowledge of coding concepts and data structures.",
    "General Knowledge": "Stay updated with current affairs and general awareness."
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-[#0f172a] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_36%)] p-4 sm:p-6 lg:p-8 text-secondary-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Mock Test Series</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">Choose a category to start your practice.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <Link to={`/mock-test/${category.toLowerCase()}`} key={category} className="bg-white dark:bg-[#1e293b] rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden block border border-secondary-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-blue-400/40">
              <div className="p-6">
                <h3 className="text-xl font-bold text-primary-700 dark:text-blue-200 mb-2">{category}</h3>
                <p className="text-secondary-600 dark:text-slate-200">{categoryDetails[category]}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MockTestHome;
