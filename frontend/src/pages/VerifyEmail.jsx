import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const VerifyEmail = () => {
  const { api } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing.');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification link is invalid or expired.');
      }
    };

    verify();
  }, [api, searchParams]);

  if (status === 'loading') {
    return <Loading fullScreen text={message} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-gray-200 dark:border-dark-800 p-6 text-center">
        <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${status === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-300'}`}>
          <span className="text-2xl">{status === 'success' ? '✓' : '!'}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {status === 'success' ? 'Email Verified' : 'Verification Failed'}
        </h1>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-full bg-primary-500 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;