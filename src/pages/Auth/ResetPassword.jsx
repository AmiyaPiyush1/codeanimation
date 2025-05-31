import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';
import './Login.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  // Get token from URL
  const token = new URLSearchParams(location.search).get('token');

  // Dynamically get backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Password validation function
  const isStrongPassword = (password) => 
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or expired reset link');
      return;
    }

    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters long, include uppercase, lowercase, number, and special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
        token,
        newPassword: password
      });

      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initVanta = () => {
      if (!vantaEffect.current && vantaRef.current) {
        try {
          const VANTA = window.VANTA;
          if (VANTA) {
            vantaEffect.current = VANTA.FOG({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              highlightColor: 0x3F79DA,
              midtoneColor: 0x2c5aa0,
              lowlightColor: 0x1a1a1a,
              baseColor: 0xffffff,
              blurFactor: 0.60,
              speed: 3,
              zoom: 0.80,
              noiseAmount: 0.30,
              noiseSpeed: 0.30,
              fogAmount: 0.40,
              fogDistance: 0.30,
              fogColor: 0xffffff,
              fogBlend: 0.30,
              fogOpacity: 0.40,
              fogFalloff: 0.30,
              fogDensity: 0.30,
              fogScale: 0.80,
              fogSpeed: 0.30,
              fogDirection: 1.00
            });
          }
        } catch (error) {
          console.error('Error initializing Vanta.js:', error);
        }
      }
    };

    const timer = setTimeout(initVanta, 100);

    return () => {
      clearTimeout(timer);
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (error) {
          console.error('Error destroying Vanta.js effect:', error);
        }
      }
    };
  }, []);

  return (
    <div className="login-container">
      {/* Left Section - Reset Password Form */}
      <motion.div 
        className="login-form-section"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="login-form-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <form className="login-form" onSubmit={handleResetPassword}>
            <motion.div variants={logoVariants}>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="login-logo-left" 
              />
            </motion.div>
            <motion.h2 variants={itemVariants}>Reset Password</motion.h2>
            <motion.p className="subtitle" variants={itemVariants}>Enter your new password below</motion.p>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  className="error-container"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <svg className="error-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="error-message">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {success ? (
              <motion.div 
                className="success-container"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <svg className="success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Password Reset Successful</h3>
                <p>Your password has been reset successfully. Redirecting to login...</p>
              </motion.div>
            ) : (
              <>
                <motion.div className="input-container" variants={itemVariants}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <label htmlFor="password" className="label">New Password</label>
                  <div className="underline"></div>
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/>
                      </svg>
                    )}
                  </button>
                </motion.div>

                <motion.div className="input-container" variants={itemVariants}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                  <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                  <div className="underline"></div>
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/>
                      </svg>
                    )}
                  </button>
                </motion.div>

                <motion.div className="login-button-container" variants={itemVariants}>
                  <button 
                    type="submit" 
                    className={`login-button ${loading ? 'disabled' : ''}`}
                    disabled={loading}
                  >
                    {loading ? "Resetting Password..." : "Reset Password"}
                  </button>
                </motion.div>
              </>
            )}
          </form>
        </motion.div>
      </motion.div>

      {/* Right Section - Vanta.js Background */}
      <div className="vanta-section" ref={vantaRef}>
        <AnimatePresence mode="wait">
          <motion.div 
            className="logo-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src="/logo.png" alt="Logo" className="login-logo duplicate" />
            <img src="/logo.png" alt="Logo" className="login-logo duplicate" />
            <img src="/logo.png" alt="Logo" className="login-logo duplicate" />
            <img src="/logo.png" alt="Logo" className="login-logo" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResetPassword; 