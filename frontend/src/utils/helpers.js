// Format time duration
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Format time taken in seconds to readable format
export const formatTimeTaken = (seconds) => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

// Format date to readable format
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date to relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(date);
};

// Calculate percentage
export const calculatePercentage = (obtained, total) => {
  if (total === 0) return 0;
  return Math.round((obtained / total) * 100);
};

// Get grade based on percentage
export const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
  if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
  if (percentage >= 70) return { grade: 'B+', color: 'text-blue-500' };
  if (percentage >= 60) return { grade: 'B', color: 'text-blue-400' };
  if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-500' };
  if (percentage >= 40) return { grade: 'C', color: 'text-orange-500' };
  return { grade: 'F', color: 'text-red-500' };
};

// Generate random exam key
export const generateExamKey = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Convert seconds to MM:SS format
export const formatTimer = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Shuffle array (for randomizing questions/options)
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Check if exam is active based on current time
export const isExamActive = (exam) => {
  const now = new Date();
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);
  
  return exam.isActive && now >= startTime && now <= endTime;
};

// Get exam status
export const getExamStatus = (exam) => {
  const now = new Date();
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);
  
  if (!exam.isActive) {
    return { status: 'inactive', text: 'Inactive', color: 'text-gray-500' };
  }
  
  if (now < startTime) {
    return { status: 'upcoming', text: 'Upcoming', color: 'text-blue-500' };
  }
  
  if (now > endTime) {
    return { status: 'ended', text: 'Ended', color: 'text-red-500' };
  }
  
  return { status: 'active', text: 'Active', color: 'text-green-500' };
};