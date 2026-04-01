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
    <div className="min-h-screen bg-secondary-50 dark:bg-[#0f172a] p-4 sm:p-6 lg:p-8 text-secondary-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-lg p-8 border border-secondary-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">{currentQuestion.topic}</h2>
          <p className="text-secondary-600 dark:text-slate-300 mb-6">Question {currentIndex + 1} of {topicQuestions.length}</p>
          
          <div className="text-lg text-secondary-800 dark:text-slate-100 mb-6" style={{ whiteSpace: 'pre-wrap' }}>
            {currentQuestion.question}
          </div>

          <div className="space-y-4 mb-8">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input type="radio" name="option" id={`option${index}`} className="hidden" />
                <label htmlFor={`option${index}`} className="flex items-center cursor-pointer text-secondary-700 dark:text-slate-200">
                  <span className="w-6 h-6 inline-block mr-3 border border-secondary-300 dark:border-slate-600 rounded-full"></span>
                  {option}
                </label>
              </div>
            ))}
          </div>

          {showAnswer && (
            <div className="bg-secondary-100 dark:bg-slate-800/80 p-4 rounded-lg mb-6 border border-secondary-200 dark:border-slate-700">
              <p className="font-bold text-secondary-900 dark:text-white">Answer: {currentQuestion.answer}</p>
              <p className="mt-2 text-secondary-700 dark:text-slate-300">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowAnswer(true)}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
            >
              Show Answer
            </button>
            <button 
              onClick={handleNext}
              className="bg-slate-200 dark:bg-slate-700 text-secondary-800 dark:text-slate-100 font-bold py-2 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
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
