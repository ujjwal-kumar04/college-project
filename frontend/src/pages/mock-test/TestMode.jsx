import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const TestMode = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  // ✅ useMemo to stabilize topicQuestions reference
  const topicQuestions = useMemo(() => {
    return state?.questions || [];
  }, [state?.questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  const handleAnswerSelect = (questionId, option) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  // ✅ useCallback with stable dependency
  const handleSubmit = useCallback(() => {
    navigate(`/mock-test/result`, { state: { questions: topicQuestions, userAnswers } });
  }, [navigate, topicQuestions, userAnswers]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit, timeLeft]);

  const currentQuestion = topicQuestions[currentIndex];

  if (topicQuestions.length === 0) {
    return <div className="text-center p-8">No questions available for this test.</div>;
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-[#0f172a] p-4 sm:p-6 lg:p-8 text-secondary-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-lg p-8 border border-secondary-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white capitalize">
              {topic.replace(/-/g, ' ')} Test
            </h2>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
            </div>
          </div>
          <p className="text-secondary-600 dark:text-slate-300 mb-6">
            Question {currentIndex + 1} of {topicQuestions.length}
          </p>

          {currentQuestion && (
            <div>
              <div
                className="text-lg text-secondary-800 dark:text-slate-100 mb-6"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {currentQuestion.question}
              </div>

              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      id={`option${index}`}
                      className="hidden"
                      checked={userAnswers[currentQuestion.id] === option}
                      onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                    />
                    <label
                      htmlFor={`option${index}`}
                      className="flex items-center cursor-pointer text-secondary-700 dark:text-slate-200"
                    >
                      <span
                        className={`w-6 h-6 inline-block mr-3 border rounded-full transition-all ${
                          userAnswers[currentQuestion.id] === option
                            ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-400'
                            : 'border-secondary-300 dark:border-slate-600'
                        }`}
                      ></span>
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="bg-slate-200 dark:bg-slate-700 text-secondary-800 dark:text-slate-100 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            {currentIndex === topicQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(prev => Math.min(topicQuestions.length - 1, prev + 1))}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMode;