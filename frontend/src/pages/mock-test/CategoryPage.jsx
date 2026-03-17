import { Link, useNavigate, useParams } from 'react-router-dom';
import questions from '../../data/questions.json';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const topics = [...new Set(questions.filter(q => q.category.toLowerCase() === category).map(q => q.topic))];

  const getTopicQuestions = (topic) => {
    return questions.filter(q => q.category.toLowerCase() === category && q.topic === topic);
  };

  const startTest = (topic) => {
    const topicQuestions = getTopicQuestions(topic);
    // Navigate to test mode, passing questions in state
    navigate(`/mock-test/${category}/${topic.toLowerCase().replace(/\s+/g, '-')}/test`, { state: { questions: topicQuestions } });
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white capitalize">{category.replace(/-/g, ' ')} Topics</h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">Select a topic to start a practice session or a timed test.</p>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg">
          <ul className="divide-y divide-secondary-200 dark:divide-secondary-800">
            {topics.map(topic => {
              const topicQuestions = getTopicQuestions(topic);
              const questionCount = topicQuestions.length;
              const topicSlug = topic.toLowerCase().replace(/\s+/g, '-');

              return (
                <li key={topic} className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div className="mb-4 sm:mb-0">
                      <p className="text-lg font-medium text-primary-700 dark:text-primary-400">{topic}</p>
                      <span className="text-sm text-secondary-500 dark:text-secondary-400">{questionCount} Questions</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Link 
                        to={`/mock-test/${category}/${topicSlug}`}
                        className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Practice
                      </Link>
                      <button 
                        onClick={() => startTest(topic)}
                        className="bg-primary-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Start Test
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
