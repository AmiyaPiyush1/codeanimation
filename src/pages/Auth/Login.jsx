import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'animate.css';
import './Login.css';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';
import axiosInstance from '../../utils/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, github: false });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
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
  const { handleGoogleCallback, setUser } = useAuth();

  // Dynamically get backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://code-backend-xruc.onrender.com";

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

  const handleLogin = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    setError('');
    setTwoFactorError('');
    setLoading(true);

    // Input validation
    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    // Check for spaces in password
    if (password.includes(' ')) {
      setError("Password cannot contain spaces");
      setLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email: email.trim(),
        password: password.trim(),
        twoFactorCode: twoFactorCode
      });

      if (response.data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setLoading(false);
        return;
      }

      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem('token', response.data.data.accessToken);
        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        
        // Update auth context with user data directly from login response
        setUser(response.data.data.user);
        
        // Check 2FA status after login
        try {
          const twoFactorResponse = await axiosInstance.get('/api/auth/2fa/status');
          if (twoFactorResponse.data.success) {
            // Update user data with 2FA status
            setUser(prev => ({
              ...prev,
              twoFactorEnabled: twoFactorResponse.data.data.isEnabled
            }));
          }
        } catch (error) {
          console.error('Failed to check 2FA status after login:', error);
        }
        
        // Show success animation
        setLoginSuccess(true);
        
        // Add a small delay before navigation to allow success animation to play
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle rate limiting error
      if (err.response?.status === 429) {
        const retryAfter = parseInt(err.response.headers['retry-after']) || 60;
        setError(`Too many login attempts. Please try again in ${retryAfter} seconds.`);
        setLoading(false);
        
        // Disable form during retry period
        const form = document.querySelector('form');
        if (form) {
          form.style.pointerEvents = 'none';
          setTimeout(() => {
            form.style.pointerEvents = 'auto';
            setError('');
          }, retryAfter * 1000);
        }
      } else if (err.response?.status === 401) {
        if (requiresTwoFactor) {
          setTwoFactorError("Invalid 2FA code");
        } else {
          setError("Invalid email or password");
        }
        setLoading(false);
      } else if (err.response?.status === 400) {
        setError(err.response.data.error || "Invalid input data");
        setLoading(false);
      } else if (err.code === 'ECONNREFUSED') {
        setError("Unable to connect to the server. Please check your internet connection.");
        setLoading(false);
      } else {
        // For any other error, show a generic error message
        setError("Invalid email or password");
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    setError(''); // Clear any existing errors
    try {
      setSocialLoading(prev => ({ ...prev, google: true }));
      window.location.href = `${BACKEND_URL}/api/auth/google`;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate Google login. Please try again.");
    } finally {
      setSocialLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleGithubLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    setError(''); // Clear any existing errors
    try {
      setSocialLoading(prev => ({ ...prev, github: true }));
      window.location.href = `${BACKEND_URL}/api/auth/github`;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate GitHub login. Please try again.");
    } finally {
      setSocialLoading(prev => ({ ...prev, github: false }));
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);

    if (!resetEmail.trim()) {
      setResetError('Please enter your email address');
      setResetLoading(false);
      return;
    }

    if (!isValidEmail(resetEmail)) {
      setResetError('Please enter a valid email address');
      setResetLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
        email: resetEmail.trim()
      });

      setResetSuccess(true);
      setResetEmail('');
      
      // Auto close the modal after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetError('');
      }, 3000);
    } catch (err) {
      if (err.response?.status === 404) {
        setResetError("No account found with this email address");
      } else if (err.response?.status === 429) {
        setResetError("Too many attempts. Please try again later");
      } else {
        setResetError("Failed to send reset link. Please try again later");
      }
    } finally {
      setResetLoading(false);
    }
  };

  useEffect(() => {
    // Add bounceIn animation when component mounts
    const logos = document.querySelectorAll('.login-logo');
    logos.forEach((el) => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = 'bounceIn 0.8s ease-in-out forwards, logoFloat 6s ease-in-out infinite 0.4s';
    });
  }, []);

  const handleNavigation = (path) => {
    setIsExiting(true);
    const logo = document.querySelectorAll('.login-logo');
    const form = document.querySelector('.login-form-section');
    
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
      {/* Left Section - Login Form */}
      <motion.div 
        className="w-full lg:w-1/2 p-8 lg:p-12 flex items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-850/95 to-navy-950">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy-850/95 to-navy-950" />
          
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/15 via-purple-500/8 to-transparent opacity-50 animate-gradient-shift" />
          
          {/* Radial gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/8 via-transparent to-transparent opacity-70" />
          
          {/* Animated mesh gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent opacity-30 animate-pulse" />
          
          {/* Glowing orbs */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`orb-${i}`}
                className="absolute w-96 h-96 rounded-full bg-purple-500/5 blur-3xl"
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  x: [
                    `${Math.random() * 100}%`,
                    `${Math.random() * 100}%`,
                    `${Math.random() * 100}%`,
                    `${Math.random() * 100}%`
                  ],
                  y: [
                    `${Math.random() * 100}%`,
                    `${Math.random() * 100}%`,
                    `${Math.random() * 100}%`,
                    `${Math.random() * 100}%`
                  ],
                  scale: [
                    Math.random() * 0.5 + 0.5,
                    Math.random() * 0.5 + 0.5,
                    Math.random() * 0.5 + 0.5,
                    Math.random() * 0.5 + 0.5
                  ]
                }}
                transition={{
                  duration: Math.random() * 20 + 30,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.33, 0.66, 1]
                }}
              />
            ))}
          </div>

          {/* Animated grid lines */}
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Animated noise texture */}
          <div className="absolute inset-0 opacity-5 mix-blend-overlay">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-50 animate-noise" />
          </div>

          {/* Animated border glow */}
          <div className="absolute inset-0 border border-purple-500/10 rounded-lg animate-border-glow" />
        </div>

        {/* Content */}
        <motion.div 
          className="w-full max-w-md relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <form 
            className="w-full space-y-8" 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleLogin(e);
              return false;
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }}
          >
            <AnimatePresence mode="wait">
              {!loginSuccess ? (
                <motion.div 
                  key="login-form"
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
                      <span className="text-sm font-medium text-slate-300 relative z-10">Welcome Back</span>
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
                        Welcome
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
                        Back
                      </motion.span>
                    </motion.h1>

                    <motion.p 
                      className="text-lg text-slate-300/90 max-w-xl mx-auto leading-relaxed font-normal tracking-wide"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      Sign in to continue your learning journey with CodeStream.
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
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-sm mb-6 relative overflow-hidden group"
                        >
                          {/* Error background effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          
                          {/* Error icon and message container */}
                          <div className="flex items-center gap-3 relative z-10">
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ 
                                type: "spring",
                                damping: 15,
                                stiffness: 300,
                                delay: 0.1
                              }}
                              className="flex-shrink-0"
                            >
                              <svg 
                                className="w-5 h-5 text-red-400" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path 
                                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                                <path 
                                  d="M12 8V12" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                                <path 
                                  d="M12 16H12.01" 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </motion.div>
                            
                            <div className="flex-1">
                              <motion.p 
                                className="text-sm text-red-400 font-medium"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                              >
                                {error}
                              </motion.p>
                              {error === "Invalid email or password" && (
                                <motion.p 
                                  className="text-xs text-red-400/70 mt-1"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                >
                                  Please check your credentials and try again
                                </motion.p>
                              )}
                            </div>
                            
                            <motion.button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setError('');
                              }}
                              className="text-red-400/70 hover:text-red-400 transition-colors duration-200 p-1 rounded-lg hover:bg-red-500/10"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                            >
                              <svg 
                                className="w-4 h-4" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
            
                    <motion.div 
                      className={`relative group transition-all duration-300 ease-out ${email ? 'mb-8' : 'mb-6'}`}
                      variants={itemVariants}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative">
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }}
                required 
                autoComplete="email"
                name="email"
                className="w-full px-4 py-3.5 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] autofill:bg-navy-900/50 backdrop-blur-sm [&:not(:placeholder-shown)]:border-purple-500/50 [&:not(:placeholder-shown)]:shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
                placeholder=" "
              />
                        <label htmlFor="email" className={`absolute left-4 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 transition-all duration-300 ease-out backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] ${email ? '-top-3.5 text-sm' : 'top-3.5 text-base text-slate-500'} peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-400 peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]`}>Email</label>
                      </div>
            </motion.div>

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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }}
                required 
                autoComplete="current-password"
                name="password"
                className="w-full px-4 py-3.5 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] autofill:bg-navy-900/50 backdrop-blur-sm [&:not(:placeholder-shown)]:border-purple-500/50 [&:not(:placeholder-shown)]:shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
                placeholder=" "
              />
                        <label htmlFor="password" className={`absolute left-4 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 transition-all duration-300 ease-out backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] ${password ? '-top-3.5 text-sm' : 'top-3.5 text-base text-slate-500'} peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-400 peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]`}>Password</label>
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

                    <motion.div className="flex items-center justify-between" variants={itemVariants}>
                      <motion.label 
                        className="flex items-center gap-2.5 cursor-pointer group select-none" 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                          className="hidden" 
                        />
                        <motion.div 
                          className={`relative w-5 h-5 border-2 ${rememberMe ? 'border-purple-500 bg-purple-500/20' : 'border-slate-700/50 bg-navy-900/50'} rounded-md cursor-pointer transition-all duration-300 ease-out group-hover:border-purple-500/50 group-hover:bg-purple-500/10 backdrop-blur-sm flex items-center justify-center overflow-hidden`}
                          animate={rememberMe ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0"
                            animate={{
                              x: rememberMe ? ['-100%', '100%'] : '-100%',
                            }}
                            transition={{
                              duration: 0.5,
                              ease: "easeInOut",
                            }}
                          />
                          {rememberMe && (
                            <motion.svg 
                              className="w-3.5 h-3.5 text-purple-400 relative z-10" 
                              viewBox="0 0 24 24" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeWidth="3" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                              animate={{ opacity: 1, scale: 1, rotate: 0 }}
                              transition={{ 
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1]
                              }}
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </motion.svg>
                          )}
                        </motion.div>
                        <span className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors duration-300 ease-out">Remember me</span>
                      </motion.label>
                      <motion.button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setResetEmail(email);
                  setShowForgotPassword(true);
                }} 
                        className="text-sm text-purple-400 hover:text-purple-300 transition-all duration-300 ease-out hover:underline font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
              >
                Forgot password?
                      </motion.button>
            </motion.div>

                    {requiresTwoFactor ? (
                      <motion.div 
                        className={`relative group transition-all duration-300 ease-out ${twoFactorCode ? 'mb-8' : 'mb-6'}`}
                        variants={itemVariants}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                        <div className="relative">
                          <input 
                            type="text" 
                            id="twoFactorCode" 
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                              }
                            }}
                            required 
                            autoComplete="one-time-code"
                            name="twoFactorCode"
                            className="w-full px-4 py-3.5 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] autofill:bg-navy-900/50 backdrop-blur-sm"
                            placeholder=" "
                          />
                          <label htmlFor="twoFactorCode" className={`absolute left-4 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 transition-all duration-300 ease-out backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] ${twoFactorCode ? '-top-3.5 text-sm' : 'top-3.5 text-base text-slate-500'} peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-400 peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]`}>2FA Code</label>
                        </div>
                      </motion.div>
                    ) : null}

                    {twoFactorError && (
                      <motion.div 
                        className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p className="text-sm">{twoFactorError}</p>
                      </motion.div>
                    )}

                    <motion.div variants={itemVariants}>
                      <motion.button 
                type="submit" 
                        className={`w-full py-3.5 px-6 rounded-xl text-slate-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm relative overflow-hidden group`}
                disabled={loading}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLogin(e);
                          return false;
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Enhanced gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        {/* Glowing orb effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-violet-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                        </div>

                        {/* Ripple effect container */}
                        <div className="absolute inset-0 overflow-hidden rounded-xl">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-y-[100%] group-hover:translate-y-[-100%] transition-transform duration-1000"></div>
                        </div>

                        {/* Button content */}
                        <div className="relative flex items-center justify-center gap-2">
                          {loading ? (
                            <motion.div 
                              className="flex items-center justify-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div
                                className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <span>Signing In...</span>
                            </motion.div>
                          ) : (
                            <motion.div
                              className="flex items-center justify-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <motion.div
                                className="relative"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                <LogIn className="w-5 h-5" />
                                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-md animate-pulse"></div>
                              </motion.div>
                              <span className="relative">
                                Sign In
                                <motion.span
                                  className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-purple-400/50"
                                  whileHover={{ width: "100%" }}
                                  transition={{ duration: 0.3 }}
                                />
                              </span>
                            </motion.div>
                          )}
                        </div>

                        {/* Success checkmark animation */}
                        <AnimatePresence>
                          {loginSuccess && (
                            <motion.div
                              className="absolute inset-0 flex items-center justify-center bg-green-500/20"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.3 }}
                            >
                              <motion.svg
                                className="w-6 h-6 text-green-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                              >
                                <motion.path
                                  d="M20 6L9 17L4 12"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </motion.svg>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
            </motion.div>

                    <motion.div className="relative flex items-center justify-center" variants={dividerVariants}>
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700/50 backdrop-blur-sm"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 text-slate-400 bg-navy-900/50 backdrop-blur-sm rounded-full">or</span>
                      </div>
            </motion.div>

                    <motion.div className="space-y-4" variants={itemVariants}>
                      <motion.button 
                        className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl text-slate-200 bg-navy-900/50 border border-navy-700/50 hover:border-purple-500/50 hover:bg-navy-800/50 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group backdrop-blur-sm relative overflow-hidden ${socialLoading.google ? 'loading' : ''}`}
                        onClick={handleGoogleLogin}
                        disabled={socialLoading.google}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
                        {socialLoading.google ? (
                          <div className="loading-spinner" />
                        ) : (
                          <>
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
                          </>
                        )}
                      </motion.button>
                      <motion.button 
                        className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl text-slate-200 bg-navy-900/50 border border-navy-700/50 hover:border-purple-500/50 hover:bg-navy-800/50 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] group backdrop-blur-sm relative overflow-hidden ${socialLoading.github ? 'loading' : ''}`}
                        onClick={handleGithubLogin}
                        disabled={socialLoading.github}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000"></div>
                        {socialLoading.github ? (
                          <div className="loading-spinner" />
                        ) : (
                          <>
                            <motion.div 
                              className="relative w-5 h-5 transition-transform duration-300 ease-out group-hover:scale-110"
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="text-slate-200"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                            </motion.div>
                            <span className="font-medium relative z-10">Continue with GitHub</span>
                          </>
                        )}
                      </motion.button>
            </motion.div>

                    <motion.div className="text-center space-y-4" variants={itemVariants}>
                      <motion.p 
                        className="text-sm text-slate-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        Don't have an account?{" "}
                        <motion.button 
                  type="button" 
                          className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigation('/signup');
                  }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                >
                  Sign Up
                        </motion.button>
                      </motion.p>
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
                    <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-200 to-slate-400">Welcome Back!</h3>
                    <p className="text-slate-300/90 font-normal tracking-wide text-base max-w-md mx-auto">You've successfully signed in. Redirecting you to your dashboard...</p>
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
                    scale: [
                      1 + i * 0.2,
                      1.2 + i * 0.2,
                      1 + i * 0.2,
                      1.2 + i * 0.2,
                      1 + i * 0.2
                    ],
                    opacity: [0.1, 0.2, 0.1, 0.2, 0.1]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.25, 0.5, 0.75, 1]
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
                    x: [
                      `${Math.random() * 100}%`,
                      `${Math.random() * 100}%`,
                      `${Math.random() * 100}%`
                    ],
                    y: [
                      `${Math.random() * 100}%`,
                      `${Math.random() * 100}%`,
                      `${Math.random() * 100}%`
                    ],
                    opacity: [
                      Math.random() * 0.3 + 0.1,
                      Math.random() * 0.3 + 0.1,
                      Math.random() * 0.3 + 0.1
                    ]
                  }}
                  transition={{
                    duration: Math.random() * 15 + 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.5, 1]
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

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              setShowForgotPassword(false);
              setResetEmail('');
              setResetError('');
              setResetSuccess(false);
            }}
          >
            <motion.div 
              className="w-full max-w-lg p-12 rounded-2xl bg-gradient-to-b from-navy-900/95 via-navy-900/98 to-navy-950 border border-navy-700/50 shadow-2xl relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-purple-500/5 before:via-transparent before:to-transparent before:pointer-events-none after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] after:from-purple-500/5 after:via-transparent after:to-transparent after:pointer-events-none"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              onClick={e => e.stopPropagation()}
            >
              <motion.button 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-300 transition-all duration-300 ease-out p-1.5 rounded-lg hover:bg-slate-700/50 backdrop-blur-sm"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail('');
                  setResetError('');
                  setResetSuccess(false);
                }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </motion.button>

              <AnimatePresence mode="wait">
                {!resetSuccess ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-12"
                  >
                    <div className="space-y-8">
                      <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-navy-900/50 border border-purple-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                        </svg>
                        <span className="text-sm font-medium text-slate-300">Reset Password</span>
                      </div>
                      <div className="space-y-5">
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-200 to-slate-400">Reset Your Password</h2>
                        <p className="text-slate-300/90 font-normal tracking-wide text-base">Enter your email address and we'll send you a secure link to reset your password.</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleForgotPassword} className="space-y-10">
                      <AnimatePresence mode="wait">
                        {resetError && (
                          <motion.div 
                            className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-sm shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <p className="text-sm">{resetError}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div 
                        className="relative group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <input 
                          type="email" 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          autoComplete="email"
                          name="reset-email"
                          id="reset-email"
                          className="w-full px-4 py-3 bg-navy-900/50 border border-navy-700/50 rounded-xl text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 ease-out peer placeholder-transparent shadow-[0_0_0_1px_rgba(255,255,255,0.05)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.1)] focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)] backdrop-blur-sm"
                        />
                        <label htmlFor="reset-email" className={`absolute left-4 px-1.5 text-sm font-medium bg-navy-900/50 text-slate-300/90 transition-all duration-300 ease-out backdrop-blur-sm rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.05)] ${resetEmail ? '-top-3.5 text-sm' : 'top-3.5 text-base text-slate-500'} peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-purple-400 peer-focus:shadow-[0_0_0_1px_rgba(139,92,246,0.2)]`}>Reset Email</label>
                      </motion.div>

                      <motion.div 
                        className="flex gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <motion.button 
                          type="button"
                          className="flex-1 py-2.5 px-5 rounded-xl text-slate-400 hover:text-slate-300 bg-navy-900/50 border border-navy-700/50 hover:border-purple-500/50 transition-all duration-300 ease-out font-medium backdrop-blur-sm relative overflow-hidden group"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setResetEmail('');
                            setResetError('');
                            setResetSuccess(false);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          Cancel
                        </motion.button>
                        <motion.button 
                          type="submit" 
                          className={`flex-1 py-2.5 px-5 rounded-xl text-slate-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/20 hover:border-purple-500/30 transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm relative overflow-hidden group`}
                          disabled={resetLoading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                          {resetLoading ? (
                            <motion.div className="flex items-center justify-center gap-2">
                              <motion.div
                                className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <span>Sending...</span>
                            </motion.div>
                          ) : (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              Send Link
                            </motion.span>
                          )}
                        </motion.button>
                      </motion.div>
                    </form>
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
                      <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-slate-200 to-slate-400">Check Your Email</h3>
                      <p className="text-slate-300/90 font-normal tracking-wide text-base max-w-md mx-auto">We've sent a secure password reset link to your email address. Please check your inbox.</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.button 
                        type="button"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-slate-300 hover:text-slate-200 bg-navy-900/50 border border-navy-700/50 hover:border-green-500/50 transition-all duration-300 ease-out font-medium backdrop-blur-sm relative overflow-hidden group"
                        onClick={() => {
                          setShowForgotPassword(false);
                          setResetEmail('');
                          setResetError('');
                          setResetSuccess(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Back to Login
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login; 