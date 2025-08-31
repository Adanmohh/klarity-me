import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { Button } from '../ui/Button';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="basecamp-card bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-gold/20 to-yellow-200/20 mb-4 shadow-lg"
            >
              {step === 'email' ? (
                <Sparkles className="w-10 h-10 text-primary-gold" />
              ) : (
                <Mail className="w-10 h-10 text-primary-gold" />
              )}
            </motion.div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-black to-gray-700 bg-clip-text text-transparent mb-2">
              {step === 'email' ? 'Welcome to Focus Cards' : 'Verify Your Email'}
            </h1>
            <p className="text-gray-600 text-sm">
              {step === 'email' 
                ? 'Sign in or create your account with email'
                : `We've sent a 6-digit code to ${email}`}
            </p>
          </div>

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-gold focus:outline-none transition-all duration-200 bg-white"
                  placeholder="your@email.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-gold focus:outline-none transition-all duration-200 bg-white"
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

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || !email}
                icon={loading ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                iconPosition="right"
              >
                {loading ? 'Sending...' : 'Continue with Email'}
              </Button>
            </form>
          )}

          {/* OTP Step */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-primary-gold focus:outline-none transition-all duration-200 bg-white text-center text-3xl font-bold tracking-[0.5em] text-primary-black"
                  placeholder="······"
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

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || otp.length !== 6}
                icon={loading ? <Loader2 className="animate-spin" /> : null}
              >
                {loading ? 'Verifying...' : isNewUser ? 'Activate Account' : 'Sign In'}
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  className="text-sm text-primary-gold hover:text-yellow-600 disabled:text-gray-400 disabled:cursor-not-allowed"
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
                  className="block w-full text-sm text-gray-600 hover:text-gray-800"
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
              className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl"
            >
              <p className="text-xs text-yellow-800 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <strong>Dev Mode:</strong> Check your backend console for the OTP code
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};