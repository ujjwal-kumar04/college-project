import { useState } from 'react';
import { Link } from 'react-router-dom';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const helpSections = [
    {
      title: "Getting Started",
      items: [
        "How to register as a student/teacher",
        "How to login to your account",
        "How to reset your password",
        "How to update your profile"
      ]
    },
    {
      title: "For Teachers",
      items: [
        "How to create an exam",
        "How to add questions",
        "How to set exam duration",
        "How to view student results",
        "How to share exam keys"
      ]
    },
    {
      title: "For Students", 
      items: [
        "How to join an exam",
        "How to submit answers",
        "How to view exam results",
        "How to check exam history"
      ]
    },
    {
      title: "Technical Issues",
      items: [
        "Browser compatibility",
        "Internet connection problems",
        "File upload issues",
        "Dark mode not working"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find answers to frequently asked questions
          </p>
        </div>

        {/* Search Box */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Help Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {helpSections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <button className="text-left w-full text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      • {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Still need help?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/contact"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center"
              >
               Email Support
              </Link>
              <a 
                href="https://wa.me/917257981450?text=Hello%20I%20am%20interested"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-center"
              >
               Live Chat
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Help;