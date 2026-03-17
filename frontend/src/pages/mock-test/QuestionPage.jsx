import { useState } from 'react';
import { useParams } from 'react-router-dom';
import questions from '../../data/questions.json';

const QuestionPage = () => {
  const { category, topic } = useParams();
  const topicQuestions = questions.filter(q => q.category.toLowerCase() === category && q.topic.toLowerCase().replace(/\s+/g, '-') === topic);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuestion = topicQuestions[currentIndex];

  const handleNext = () => {
    setShowAnswer(false);
    if (currentIndex < topicQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Optionally, navigate back to topics or show a completion message
      alert("You have completed all questions in this topic!");
    }
  };

  if (!currentQuestion) {
    return <div className="text-center p-8">No questions found for this topic.</div>;
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">{currentQuestion.topic}</h2>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">Question {currentIndex + 1} of {topicQuestions.length}</p>
          
          <div className="text-lg text-secondary-800 dark:text-secondary-200 mb-6" style={{ whiteSpace: 'pre-wrap' }}>
            {currentQuestion.question}
          </div>

          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input type="radio" name="option" id={`option${index}`} className="hidden" />
                <label htmlFor={`option${index}`} className="flex items-center cursor-pointer text-secondary-700 dark:text-secondary-300">
                  <span className="w-6 h-6 inline-block mr-3 border border-secondary-300 dark:border-secondary-600 rounded-full"></span>
                  {option}
                </label>
              </div>
            ))}
          </div>

          {showAnswer && (
            <div className="bg-secondary-100 dark:bg-secondary-800 p-4 rounded-lg mb-6">
              <p className="font-bold text-secondary-900 dark:text-white">Answer: {currentQuestion.answer}</p>
              <p className="mt-2 text-secondary-700 dark:text-secondary-300">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowAnswer(true)}
              className="bg-primary-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Show Answer
            </button>
            <button 
              onClick={handleNext}
              className="bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200 font-bold py-2 px-6 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-600 transition-colors"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
