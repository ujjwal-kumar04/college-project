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
    <div className="min-h-screen bg-secondary-50 dark:bg-[#0f172a] p-4 sm:p-6 lg:p-8 text-secondary-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-lg p-8 mb-8 border border-secondary-200 dark:border-slate-700">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white mb-4">Test Result</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
              <p className="text-lg font-bold text-blue-700 dark:text-blue-200">Score</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{score} / {totalQuestions}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-lg font-bold text-green-700 dark:text-green-300">Correct</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{correctAnswers}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-lg font-bold text-red-700 dark:text-red-300">Incorrect</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-white">{incorrectAnswers}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white dark:bg-[#1e293b] rounded-xl shadow-lg p-6 border border-secondary-200 dark:border-slate-700">
              <p className="font-bold text-lg mb-4 text-secondary-900 dark:text-white">Question {index + 1}: {q.question}</p>
              <div className="space-y-2">
                {q.options.map(option => {
                  const isCorrect = option === q.answer;
                  const isUserChoice = userAnswers[q.id] === option;
                  let optionClass = 'border-secondary-300 dark:border-slate-700';
                  if (isCorrect) {
                    optionClass = 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300';
                  } else if (isUserChoice) {
                    optionClass = 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300';
                  }
                  return (
                    <div key={option} className={`p-3 border rounded-lg ${optionClass}`}>
                      {option}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-secondary-100 dark:bg-slate-800/80 rounded-lg">
                <p className="font-bold text-secondary-800 dark:text-slate-200">Explanation:</p>
                <p className="text-secondary-700 dark:text-slate-300">{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestResult;
