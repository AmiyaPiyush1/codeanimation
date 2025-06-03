import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axios';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
  const [state, setState] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUserProfile } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          setErrorMessage('Verification token is missing');
          setState('error');
          return;
        }

        const response = await axiosInstance.get(`/api/auth/verify-email?token=${token}`);
        
        if (response.data.success) {
          // Update user profile to reflect verified status
          const userResponse = await axiosInstance.get('/api/auth/me');
          if (userResponse.data.success) {
            // Update the user state with the new data
            await updateUserProfile(userResponse.data.data.user);
          }
          setState('success');
          // Redirect to profile page after 3 seconds
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        setErrorMessage(error.response?.data?.message || 'Failed to verify email');
        setState('error');
      }
    };

    verifyEmail();
  }, [location, navigate, updateUserProfile]);

  const renderContent = () => {
    switch (state) {
      case 'verifying':
        return (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="w-16 h-16 text-purple-400" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-slate-200">Verifying your email...</h2>
            <p className="text-slate-400">Please wait while we verify your email address.</p>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <XCircle className="w-16 h-16 text-red-400" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-slate-200">Verification Failed</h2>
            <p className="text-slate-400">{errorMessage}</p>
            <motion.button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 transition-colors flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Return to Profile
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="space-y-6"
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
              >
                <CheckCircle className="w-16 h-16 text-emerald-400" />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold text-slate-200">Email Verified!</h2>
            <p className="text-slate-400">Your email has been successfully verified.</p>
            <div className="flex items-center justify-center gap-2 text-emerald-400">
              <Mail className="w-5 h-5" />
              <span className="text-sm">Redirecting to profile...</span>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-navy-900/50 border border-slate-800 rounded-xl p-8 backdrop-blur-sm relative overflow-hidden"
      >
        {/* Background gradient animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />

        <div className="relative z-10 text-center space-y-6">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail; 