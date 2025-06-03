import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import 'animate.css';
import './Signup.css';
import { UserPlus, Eye, EyeOff, Loader2, Github, Mail } from 'lucide-react';
import axiosInstance from '../../utils/axios';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, github: false });
  const navigate = useNavigate();
  const location = useLocation();
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const { handleGoogleCallback } = useAuth();

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

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    return errors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    // Input validation
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      return;
    }

    // Check for spaces in password
    if (password.includes(' ')) {
      setError("Password cannot contain spaces");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(". "));
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/signup', { 
        email: email.trim(), 
        password: password.trim() 
      });
      
      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem('token', response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        
        // Use handleGoogleCallback to handle the token and user data
        await handleGoogleCallback(response.data.data.token);
        
        navigate("/");
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("An account with this email already exists");
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || "Invalid input data");
      } else if (err.response?.status === 429) {
        setError("Too many signup attempts. Please try again later");
      } else {
        setError(err.response?.data?.message || "Signup failed. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (token) => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      
      if (response.data.success) {
        // Update auth context with user data
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  };

  // Handle navigation with animation
  const handleNavigation = (path) => {
    setIsExiting(true);
    const logo = document.querySelectorAll('.signup-logo');
    const form = document.querySelector('.signup-form-section');
    
    // Animate form
    if (form) {
      form.style.transition = 'all 0.3s ease-in-out';
      form.style.transform = 'translateX(50%) scale(0.8)';
      form.style.opacity = '0';
    }

    // Animate logo
    logo.forEach((el) => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'bounceOut 0.3s ease-in-out forwards';
    });

    // Store only serializable Vanta.js options
    if (vantaEffect.current) {
      const options = vantaEffect.current.options;
      const serializableOptions = {
        mouseControls: options.mouseControls,
        touchControls: options.touchControls,
        gyroControls: options.gyroControls,
        minHeight: options.minHeight,
        minWidth: options.minWidth,
        highlightColor: options.highlightColor,
        midtoneColor: options.midtoneColor,
        lowlightColor: options.lowlightColor,
        baseColor: options.baseColor,
        blurFactor: options.blurFactor,
        speed: options.speed,
        zoom: options.zoom,
        noiseAmount: options.noiseAmount,
        noiseSpeed: options.noiseSpeed,
        fogAmount: options.fogAmount,
        fogDistance: options.fogDistance,
        fogColor: options.fogColor,
        fogBlend: options.fogBlend,
        fogOpacity: options.fogOpacity,
        fogFalloff: options.fogFalloff,
        fogDensity: options.fogDensity,
        fogScale: options.fogScale,
        fogSpeed: options.fogSpeed,
        fogDirection: options.fogDirection,
        fogRotation: options.fogRotation,
        fogRotationSpeed: options.fogRotationSpeed,
        fogRotationAmount: options.fogRotationAmount,
        fogRotationFalloff: options.fogRotationFalloff,
        mouseEase: options.mouseEase,
        mouseInfluence: options.mouseInfluence,
        particleCount: options.particleCount,
        particleSize: options.particleSize,
        particleSpeed: options.particleSpeed,
        particleColor: options.particleColor,
        particleOpacity: options.particleOpacity,
        particleBlend: options.particleBlend,
        particleFalloff: options.particleFalloff,
        particleScale: options.particleScale,
        particleRotation: options.particleRotation,
        particleRotationSpeed: options.particleRotationSpeed,
        particleRotationAmount: options.particleRotationAmount,
        particleRotationFalloff: options.particleRotationFalloff
      };
      sessionStorage.setItem('vantaOptions', JSON.stringify(serializableOptions));
    }

    navigate(path, { replace: true });
  };

  const handleGoogleSignup = async (e) => {
    e.preventDefault(); // Prevent form submission
    setError(''); // Clear any existing errors
    try {
      setSocialLoading(prev => ({ ...prev, google: true }));
      window.location.href = `${BACKEND_URL}/api/auth/google`;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate Google signup. Please try again.");
    } finally {
      setSocialLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleGithubSignup = async (e) => {
    e.preventDefault(); // Prevent form submission
    setError(''); // Clear any existing errors
    try {
      setSocialLoading(prev => ({ ...prev, github: true }));
      window.location.href = `${BACKEND_URL}/api/auth/github`;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate GitHub signup. Please try again.");
    } finally {
      setSocialLoading(prev => ({ ...prev, github: false }));
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

  useEffect(() => {
    // Handle page transition
    const handleBeforeUnload = () => {
      setIsExiting(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    // Add bounceIn animation when component mounts
    const logos = document.querySelectorAll('.signup-logo');
    logos.forEach((el) => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'bounceIn 0.8s ease-in-out forwards, logoFloat 6s ease-in-out infinite 0.4s';
    });
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-slate-950">
      {/* Left Section - Signup Form */}
      <motion.div 
        className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center bg-gradient-to-b from-navy-850/95 to-navy-950 relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-purple-500/15 before:via-purple-500/8 before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] after:from-purple-500/8 after:via-transparent after:to-transparent after:pointer-events-none"
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
          <form className="w-full space-y-8" onSubmit={handleSignup}>
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
                <UserPlus className="w-5 h-5 text-purple-400 relative z-10" />
                <span className="text-sm font-medium text-slate-300 relative z-10">Join CodeStream</span>
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
                  Create Your
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
                  Account
                </motion.span>
              </motion.h1>

              <motion.p 
                className="text-lg text-slate-300/90 max-w-xl mx-auto leading-relaxed font-normal tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Join CodeStream and start your algorithm visualization journey.
              </motion.p>

              <motion.div
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="relative flex justify-center">
                  <motion.button
                    type="button"
                    onClick={() => handleNavigation('/')}
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900/50 border border-navy-700/50 hover:border-purple-500/50 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-sm relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <motion.div 
                      className="relative w-4 h-4 transition-transform duration-300 ease-out group-hover:scale-110"
                      whileHover={{ rotate: -180 }}
                      transition={{ duration: 0.5 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </motion.div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-purple-400 transition-colors duration-300">Back to Home</span>
                  </motion.button>
                </div>
              </motion.div>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className={`relative group transition-all duration-300 ease-out ${email ? 'mb-8' : 'mb-6'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3.5 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] autofill:bg-navy-900/50 backdrop-blur-sm"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="email" className="absolute left-4 -top-3.5 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 peer-placeholder-shown:text-slate-500 peer-focus:text-purple-400 transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]">Email</label>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className={`relative group transition-all duration-300 ease-out ${password ? 'mb-8' : 'mb-6'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] autofill:bg-navy-900/50 backdrop-blur-sm"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="password" className="absolute left-4 -top-3.5 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 peer-placeholder-shown:text-slate-500 peer-focus:text-purple-400 transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]">Password</label>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
                className={`relative group transition-all duration-300 ease-out ${confirmPassword.trim() ? 'mt-8' : 'mt-6'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] autofill:bg-navy-900/50 backdrop-blur-sm"
                    placeholder=" "
                    required
                  />
                  <label htmlFor="confirmPassword" className="absolute left-4 -top-3.5 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 peer-placeholder-shown:text-slate-500 peer-focus:text-purple-400 transition-all duration-300 ease-out peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]">Confirm Password</label>
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
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 px-6 rounded-xl text-slate-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm relative overflow-hidden group`}
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
                    <span>Creating Account...</span>
                  </motion.div>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 inline-block mr-2" />
                    Create Account
                  </>
                )}
              </motion.button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-navy-900/50 text-slate-400">Or continue with</span>
                </div>
              </div>

              <motion.div variants={itemVariants} className="space-y-4">
                <motion.button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl text-slate-200 bg-navy-900/50 border border-navy-700/50 hover:border-purple-500/50 hover:bg-navy-800/50 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group backdrop-blur-sm relative overflow-hidden"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
                  <motion.div 
                    className="relative w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-110"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img 
                      src="/google-icon.ico" 
                      alt="Google" 
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                  <span className="font-medium relative z-10">Continue with Google</span>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleGithubSignup}
                  className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl text-slate-200 bg-navy-900/50 border border-navy-700/50 hover:border-purple-500/50 hover:bg-navy-800/50 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group backdrop-blur-sm relative overflow-hidden"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
                  <motion.div 
                    className="relative w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-110"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img 
                      src="/github-mark.svg" 
                      alt="GitHub" 
                      className="w-full h-full object-contain invert"
                    />
                  </motion.div>
                  <span className="font-medium relative z-10">Continue with GitHub</span>
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div className="text-center space-y-4" variants={itemVariants}>
              <motion.p 
                className="text-sm text-slate-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                Already have an account?{" "}
                <motion.button 
                  type="button" 
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
                  onClick={() => handleNavigation('/login')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Sign In
                </motion.button>
              </motion.p>
            </motion.div>
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

export default Signup;