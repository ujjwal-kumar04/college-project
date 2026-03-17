import { GoogleLogin } from '@react-oauth/google';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation } from 'react-router-dom';
import loginIllustration from '../assets/Wavy_Gen-01_Single-07.jpg';
import Loading from '../components/Loading.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const location = useLocation();

  const { login, googleLogin, resendVerificationEmail } = useAuth();

  useEffect(() => {
    if (location.state?.verificationEmail) {
      setVerificationEmail(location.state.verificationEmail);
    }

    if (location.state?.verificationMessage) {
      setErrors((prev) => ({
        ...prev,
        verification: location.state.verificationMessage,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setErrors({ submit: result.message });
      if (result.requiresEmailVerification) {
        setVerificationEmail(result.email || formData.email);
      }
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) {
      setErrors({ submit: 'Enter your email first to resend verification.' });
      return;
    }

    setResendingVerification(true);
    await resendVerificationEmail(verificationEmail);
    setResendingVerification(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const result = await googleLogin(credentialResponse.credential);
    
    if (!result.success) {
      setErrors({ submit: result.message });
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
    setErrors({ submit: 'Google login failed. Please try again.' });
  };

  

  if (loading) {
    return <Loading fullScreen text="Signing you in..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-purple-400 via-purple-300 to-blue-200 py-4 sm:py-8 px-2 sm:px-4">
      <div className="w-full max-w-4xl bg-white/80 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left: Illustration and Welcome */}
        <div className="md:w-1/2 flex flex-col justify-between items-center bg-gradient-to-br from-purple-500 via-purple-400 to-purple-300 p-8 md:p-10 text-white relative">
          <img src={loginIllustration} alt="Login Illustration" className="w-48 h-48 object-contain mx-auto mb-6 drop-shadow-xl" />
          <div className="flex-1 flex flex-col justify-center items-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Hello Friends!</h2>
            <p className="text-base sm:text-lg mb-6 text-center">Come on, register yourself and start connecting with us</p>
            <div className="flex flex-col items-center mt-4">
              <span className="text-2xl animate-bounce">⬇️</span>
              <Link to="/register" className="mt-2 text-white font-semibold underline text-lg hover:text-purple-200 transition">Sign Up</Link>
            </div>
          </div>
        </div>
        {/* Right: Login Form */}
        <div className="md:w-1/2 flex flex-col justify-center p-6 sm:p-10 bg-white">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Login</h1>
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="100%"
              />
              <div className="flex items-center my-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="mx-2 text-gray-400 text-sm">or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              {errors.verification && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-700 dark:text-blue-300">{errors.verification}</p>
              </div>
            )}
              {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
              </div>
            )}

              {verificationEmail && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  This account needs email verification before sign in.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className="mt-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 disabled:opacity-60"
                >
                  {resendingVerification ? 'Sending verification...' : `Resend verification to ${verificationEmail}`}
                </button>
              </div>
            )}

              {/* Email Field */}
              <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg text-sm sm:text-base bg-gray-50 dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-dark-700'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

              {/* Password Field */}
              <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border rounded-lg text-sm sm:text-base bg-gray-50 dark:bg-dark-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-300 dark:border-dark-700'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

              {/* Submit Button */}
              <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 px-4 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-full font-semibold text-sm sm:text-base transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

              {/* Divider */}
              <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-dark-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white dark:bg-dark-900 text-gray-500 dark:text-gray-400">
                  Or
                </span>
              </div>
            </div>

            </form>
          </div>
        </div>
      </div>
      </div>
    );
  };

  export default React.memo(Login);

