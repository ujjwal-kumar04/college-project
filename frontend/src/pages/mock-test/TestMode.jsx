import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const TestMode = () => {
  const { topic } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const topicQuestions = state?.questions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  const handleAnswerSelect = (questionId, option) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = useCallback(() => {
    navigate(`/mock-test/result`, { state: { questions: topicQuestions, userAnswers } });
  }, [navigate, topicQuestions, userAnswers]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmit, timeLeft]);

  const currentQuestion = topicQuestions[currentIndex];

  if (topicQuestions.length === 0) {
    return <div className="text-center p-8">No questions available for this test.</div>;
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-secondary-900 dark:text-white capitalize">{topic.replace(/-/g, ' ')} Test</h2>
            <div className="text-lg font-bold text-primary-500">
              {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
            </div>
          </div>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">Question {currentIndex + 1} of {topicQuestions.length}</p>

          {currentQuestion && (
            <div>
              <div className="text-lg text-secondary-800 dark:text-secondary-200 mb-6" style={{ whiteSpace: 'pre-wrap' }}>
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
                    <label htmlFor={`option${index}`} className="flex items-center cursor-pointer text-secondary-700 dark:text-secondary-300">
                      <span className={`w-6 h-6 inline-block mr-3 border rounded-full transition-all ${userAnswers[currentQuestion.id] === option ? 'bg-primary-500 border-primary-500' : 'border-secondary-300 dark:border-secondary-600'}`}></span>
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
              className="bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 font-bold py-2 px-6 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            {currentIndex === topicQuestions.length - 1 ? (
              <button 
                onClick={handleSubmit}
                className="bg-success-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-success-600 transition-colors"
              >
                Submit Test
              </button>
            ) : (
              <button 
                onClick={() => setCurrentIndex(prev => Math.min(topicQuestions.length - 1, prev + 1))}
                className="bg-primary-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors"
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
