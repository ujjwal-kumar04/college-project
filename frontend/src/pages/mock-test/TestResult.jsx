import { useLocation } from 'react-router-dom';

const TestResult = () => {
  const location = useLocation();
  const { questions = [], userAnswers = {} } = location.state || {};

  let score = 0;
  questions.forEach(q => {
    if (userAnswers[q.id] === q.answer) {
      score++;
    }
  });

  const totalQuestions = questions.length;
  const correctAnswers = score;
  const incorrectAnswers = totalQuestions - score;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">Test Result</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-lg">
              <p className="text-lg font-bold text-primary-600 dark:text-primary-300">Score</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{score} / {totalQuestions}</p>
            </div>
            <div className="bg-success-100 dark:bg-success-500/20 p-4 rounded-lg">
              <p className="text-lg font-bold text-success-600 dark:text-success-400">Correct</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{correctAnswers}</p>
            </div>
            <div className="bg-danger-100 dark:bg-danger-500/20 p-4 rounded-lg">
              <p className="text-lg font-bold text-danger-600 dark:text-danger-400">Incorrect</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{incorrectAnswers}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white dark:bg-secondary-900 rounded-xl shadow-lg p-6">
              <p className="font-bold text-lg mb-4 text-secondary-900 dark:text-white">Question {index + 1}: {q.question}</p>
              <div className="space-y-2">
                {q.options.map(option => {
                  const isCorrect = option === q.answer;
                  const isUserChoice = userAnswers[q.id] === option;
                  let optionClass = 'border-secondary-300 dark:border-secondary-700';
                  if (isCorrect) {
                    optionClass = 'bg-success-50 dark:bg-success-500/20 border-success-500 text-success-800 dark:text-success-300';
                  } else if (isUserChoice) {
                    optionClass = 'bg-danger-50 dark:bg-danger-500/20 border-danger-500 text-danger-800 dark:text-danger-300';
                  }
                  return (
                    <div key={option} className={`p-3 border rounded-lg ${optionClass}`}>
                      {option}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                <p className="font-bold text-secondary-800 dark:text-secondary-200">Explanation:</p>
                <p className="text-secondary-700 dark:text-secondary-300">{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestResult;
