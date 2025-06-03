import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';
import './Login.css';
import { LogIn } from 'lucide-react';
import axiosInstance from '../../utils/axios';

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
  const { token } = useParams();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const formRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const inputsRef = useRef([]);
  const optionsRef = useRef(null);
  const buttonRef = useRef(null);
  const dividerRef = useRef(null);
  const socialRef = useRef(null);
  const newAccountRef = useRef(null);

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

  const dividerVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
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
      await axiosInstance.post(`/api/auth/reset-password/${token}`, {
        password
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
            // Check for stored Vanta.js options
            const storedOptions = sessionStorage.getItem('vantaOptions');
            const options = storedOptions ? JSON.parse(storedOptions) : {
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              highlightColor: 0x2E1065,
              midtoneColor: 0x1E1B4B,
              lowlightColor: 0x0F172A,
              baseColor: 0x000000,
              blurFactor: 0.60,
              speed: 2.00,
              zoom: 0.80,
              noiseAmount: 0.40,
              noiseSpeed: 0.40,
              fogAmount: 0.50,
              fogDistance: 0.40,
              fogColor: 0x2E1065,
              fogBlend: 0.40,
              fogOpacity: 0.50,
              fogFalloff: 0.40,
              fogDensity: 0.40,
              fogScale: 0.90,
              fogSpeed: 0.40,
              fogDirection: 1.00,
              fogRotation: 0.00,
              fogRotationSpeed: 0.20,
              fogRotationAmount: 0.20,
              fogRotationFalloff: 0.20,
              mouseEase: 0.50,
              mouseInfluence: 0.80,
              particleCount: 100,
              particleSize: 1.5,
              particleSpeed: 0.5,
              particleColor: 0x8B5CF6,
              particleOpacity: 0.4,
              particleBlend: 0.4,
              particleFalloff: 0.4,
              particleScale: 0.8,
              particleRotation: 0.2,
              particleRotationSpeed: 0.2,
              particleRotationAmount: 0.2,
              particleRotationFalloff: 0.2
            };

            // Always set the element reference
            options.el = vantaRef.current;
            
            vantaEffect.current = VANTA.FOG(options);
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
    <div className="min-h-screen w-full flex bg-slate-950">
      {/* Left Section - Reset Password Form */}
      <motion.div 
        className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-gradient-to-b from-navy-850/95 via-navy-900/95 to-navy-950 relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-purple-500/15 before:via-purple-500/8 before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] after:from-purple-500/8 after:via-transparent after:to-transparent after:pointer-events-none"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="w-full max-w-md relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <form 
            className="w-full space-y-8" 
            onSubmit={handleResetPassword}
          >
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div 
                  key="reset-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center space-y-6 mb-12"
                  >
                    {/* Tag */}
                    <motion.div 
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-navy-900/50 border border-purple-500/20 mb-8 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 relative"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      exit={{ 
                        opacity: 0, 
                        y: -20,
                        scale: 0.8,
                        transition: { 
                          duration: 0.3,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      <div className="absolute inset-0 bg-purple-500/5 rounded-full blur-xl animate-pulse"></div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse"></div>
                      <LogIn className="w-5 h-5 text-purple-400 relative z-10" />
                      <span className="text-sm font-medium text-slate-300 relative z-10">Reset Password</span>
                    </motion.div>

                    <motion.h1 
                      className="text-4xl lg:text-6xl font-bold tracking-tight leading-[1.2] min-h-[1.2em]"
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1, 
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      <motion.span 
                        className="inline-block align-middle bg-clip-text text-transparent bg-gradient-to-b from-slate-200 to-slate-400"
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { 
                            opacity: 1, 
                            y: 0,
                            transition: {
                              duration: 0.6,
                              ease: [0.22, 1, 0.36, 1]
                            }
                          }
                        }}
                      >
                        Reset Your
                      </motion.span>{" "}
                      <motion.span 
                        className="inline-block align-middle bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent"
                        variants={{
                          hidden: { opacity: 0, y: 20 },
                          visible: { 
                            opacity: 1, 
                            y: 0,
                            transition: {
                              duration: 0.6,
                              ease: [0.22, 1, 0.36, 1]
                            }
                          }
                        }}
                      >
                        Password
                      </motion.span>
                    </motion.h1>

                    <motion.p 
                      className="text-lg text-slate-300/90 max-w-xl mx-auto leading-relaxed font-normal tracking-wide"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      Enter your new password below to reset your account.
                    </motion.p>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm backdrop-blur-sm mb-14"
                        >
                          {error}
                </motion.div>
              )}
            </AnimatePresence>

              <motion.div 
                      className={`relative group transition-all duration-300 ease-out ${password ? 'mb-8' : 'mb-6'}`}
                      variants={itemVariants}
              >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                          autoComplete="new-password"
                          name="password"
                          className="w-full px-4 py-3.5 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] autofill:bg-navy-900/50 backdrop-blur-sm"
                          placeholder=" "
                  />
                        <label htmlFor="password" className={`absolute left-4 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 transition-all duration-300 ease-out backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] ${password ? '-top-3.5 text-sm' : 'top-3.5 text-base text-slate-500'} peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-400 peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]`}>New Password</label>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                          <motion.button 
                    type="button" 
                            className="text-slate-400 hover:text-purple-400 transition-all duration-300 ease-out p-2 rounded-lg hover:bg-purple-500/10 flex items-center justify-center transform transition-transform transition-opacity backdrop-blur-sm"
                    onClick={() => setShowPassword(!showPassword)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                  >
                            <AnimatePresence mode="wait">
                    {showPassword ? (
                                <motion.svg 
                                  key="eye-open"
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="flex-shrink-0"
                                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                  transition={{ duration: 0.2 }}
                                >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
                                </motion.svg>
                    ) : (
                                <motion.svg 
                                  key="eye-closed"
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="flex-shrink-0"
                                  initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                  transition={{ duration: 0.2 }}
                                >
                        <path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/>
                                </motion.svg>
                    )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                </motion.div>

                    <motion.div 
                      className={`relative group transition-all duration-300 ease-out ${confirmPassword ? 'mb-8' : 'mb-6'}`}
                      variants={itemVariants}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                          autoComplete="new-password"
                          name="confirmPassword"
                          className="w-full px-4 py-3.5 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] autofill:bg-navy-900/50 backdrop-blur-sm"
                          placeholder=" "
                  />
                        <label htmlFor="confirmPassword" className={`absolute left-4 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 transition-all duration-300 ease-out backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] ${confirmPassword ? '-top-3.5 text-sm' : 'top-3.5 text-base text-slate-500'} peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-400 peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]`}>Confirm Password</label>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                          <motion.button 
                    type="button" 
                            className="text-slate-400 hover:text-purple-400 transition-all duration-300 ease-out p-2 rounded-lg hover:bg-purple-500/10 flex items-center justify-center transform transition-transform transition-opacity backdrop-blur-sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                  >
                            <AnimatePresence mode="wait">
                    {showConfirmPassword ? (
                                <motion.svg 
                                  key="eye-open"
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="flex-shrink-0"
                                  initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                  transition={{ duration: 0.2 }}
                                >
                        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>
                                </motion.svg>
                    ) : (
                                <motion.svg 
                                  key="eye-closed"
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="20" 
                                  height="20" 
                                  viewBox="0 0 24 24" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className="flex-shrink-0"
                                  initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                                  transition={{ duration: 0.2 }}
                                >
                        <path d="m15 18-.722-3.25"/><path d="M2 8a10.645 10.645 0 0 0 20 0"/><path d="m20 15-1.726-2.05"/><path d="m4 15 1.726-2.05"/><path d="m9 18 .722-3.25"/>
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <motion.button 
                        type="submit" 
                        className={`w-full py-3.5 px-6 rounded-xl text-slate-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm relative overflow-hidden group`}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        {loading ? (
                          <motion.div className="flex items-center justify-center gap-2">
                            <motion.div
                              className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <span>Resetting Password...</span>
                          </motion.div>
                        ) : (
                          <>
                            <LogIn className="w-5 h-5 inline-block mr-2" />
                            Reset Password
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  className="text-center space-y-12"
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    type: "spring",
                    damping: 20,
                    stiffness: 300
                  }}
                >
                  <motion.div 
                    className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-navy-900/50 border border-green-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(34,197,94,0.1)] relative"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-green-500/5 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-24 bg-green-500/10 rounded-full blur-2xl animate-pulse"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400 relative z-10">
                      <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572"/>
                      <path d="M22 4L12 14.01L9 11.01"/>
                      </svg>
                    <span className="text-sm font-medium text-slate-300 relative z-10">Success</span>
                  </motion.div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      type: "spring",
                      damping: 15,
                      stiffness: 300,
                      delay: 0.3
                    }}
                  >
                    <div className="absolute inset-0 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute inset-0 bg-green-500/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    <motion.svg 
                      className="w-24 h-24 text-green-400 mx-auto relative z-10" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        damping: 15,
                        stiffness: 300,
                        delay: 0.4
                      }}
                    >
                      <path d="M22 11.0857V12.0057C21.9988 14.1621 21.3005 16.2604 20.0093 17.9875C18.7182 19.7147 16.9033 20.9782 14.8354 21.5896C12.7674 22.201 10.5573 22.1276 8.53447 21.3803C6.51168 20.633 4.78465 19.2518 3.61096 17.4428C2.43727 15.6338 1.87979 13.4938 2.02168 11.342C2.16356 9.19029 2.99721 7.14205 4.39828 5.5028C5.79935 3.86354 7.69279 2.72111 9.79619 2.24587C11.8996 1.77063 14.1003 1.98806 16.07 2.86572"/>
                      <path d="M22 4L12 14.01L9 11.01"/>
                    </motion.svg>
                </motion.div>

                  <motion.div 
                    className="space-y-5"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-200 to-slate-400">Password Reset Successful!</h3>
                    <p className="text-slate-300/90 font-normal tracking-wide text-base max-w-md mx-auto">Your password has been reset successfully. Redirecting you to login...</p>
                  </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
          </form>
        </motion.div>
      </motion.div>

      {/* Right Section - Vanta.js Background */}
      <div className="hidden lg:block w-1/2 relative" ref={vantaRef}>
        <AnimatePresence mode="wait">
          <motion.div 
            className="absolute inset-0"
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Interactive Mouse Followers */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`mouse-${i}`}
                  className="absolute w-24 h-24 rounded-full bg-purple-500/5 blur-2xl"
                  animate={{
                    x: [null, 'var(--mouse-x)', 'var(--mouse-x)'],
                    y: [null, 'var(--mouse-y)', 'var(--mouse-y)'],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>

            {/* Wave Pattern */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`wave-${i}`}
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(circle at center, transparent 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)`,
                    transform: `scale(${1 + i * 0.2})`
                  }}
                  animate={{
                    scale: [1 + i * 0.2, 1.2 + i * 0.2, 1 + i * 0.2],
                    opacity: [0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                  }}
                />
              ))}
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    scale: Math.random() * 0.5 + 0.5,
                    opacity: Math.random() * 0.3 + 0.1
                  }}
                  animate={{
                    y: [null, Math.random() * 100 + '%'],
                    opacity: [null, Math.random() * 0.3 + 0.1]
                  }}
                  transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>

            {/* Glowing Orbs */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-32 h-32 rounded-full bg-purple-500/5 blur-3xl"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                    scale: Math.random() * 0.5 + 0.5
                  }}
                  animate={{
                    x: [null, Math.random() * 100 + '%'],
                    y: [null, Math.random() * 100 + '%'],
                    scale: [null, Math.random() * 0.5 + 0.5]
                  }}
                  transition={{
                    duration: Math.random() * 20 + 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>

            {/* Interactive Grid Lines */}
            <div className="absolute inset-0 overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-10">
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="w-48 h-48 relative flex items-center justify-center vanta-logo transition-all duration-300 ease-out"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ scale: 1.1 }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="absolute inset-0 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-32 h-32 object-contain relative z-10 opacity-80 hover:opacity-100 transition-all duration-300" 
                />
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Add mouse tracking script */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('mousemove', (e) => {
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            document.documentElement.style.setProperty('--mouse-x', x + 'px');
            document.documentElement.style.setProperty('--mouse-y', y + 'px');
          });
        `
      }} />
    </div>
  );
};

export default ResetPassword; 