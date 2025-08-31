import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const OTPAuth: React.FC = () => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send OTP');
      }

      setMessage(data.message);
      setIsNewUser(data.is_new_user);
      setStep('otp');
      setCountdown(60); // 60 seconds before allowing resend
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to verify OTP');
      }

      // Store auth data
      setAuth(data.user, data.access_token);
      
      // Show success message
      setMessage(isNewUser ? 'Account activated successfully!' : 'Logged in successfully!');
      
      // Navigate to home after a short delay
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to resend OTP');
      }

      setMessage(data.message);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-200">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-indigo-100 mb-4"
            >
              {step === 'email' ? (
                <Sparkles className="w-8 h-8 text-indigo-600" />
              ) : (
                <Mail className="w-8 h-8 text-indigo-600" />
              )}
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {step === 'email' ? 'Welcome Back' : 'Verify Your Email'}
            </h1>
            <p className="text-gray-600">
              {step === 'email' 
                ? 'Sign in or create your account'
                : `We've sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Continue with Email
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors text-center text-2xl font-bold tracking-[0.3em] text-gray-900"
                  placeholder="000000"
                  required
                  autoFocus
                  maxLength={6}
                />
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-green-600 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  {message}
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  isNewUser ? 'Activate Account' : 'Sign In'
                )}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {countdown > 0 
                    ? `Resend code in ${countdown}s` 
                    : 'Resend code'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError('');
                    setMessage('');
                  }}
                  className="block w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Use a different email
                </button>
              </div>
            </form>
          )}

          {/* Development Mode Notice */}
          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg"
            >
              <p className="text-xs text-amber-800 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                <strong>Dev Mode:</strong> Check your backend console for the OTP code
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};