import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ChevronRight, Play, Code2, Brain, Sparkles, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from 'scrollreveal';

const Hero = () => {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const codeEditorRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const badgeRef = useRef(null);
  const headlinesRef = useRef(null);
  const descriptionRef = useRef(null);
  const visualizationRef = useRef(null);
  const isInView = useInView(sectionRef, { 
    once: true,
    margin: "0px",
    amount: 0.2
  });

  const [typedText, setTypedText] = useState('');
  const [currentLine, setCurrentLine] = useState(0);
  const [bars, setBars] = useState([64, 34, 25, 12, 22]);
  const [isSorting, setIsSorting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [swapCount, setSwapCount] = useState(0);

  // Add state for tag rotation and mouse position
  const [tagRotation, setTagRotation] = useState({ x: 0, y: 0 });
  const [tagMousePosition, setTagMousePosition] = useState({ x: 0, y: 0 });

  // Add mouse event handlers
  const handleTagMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTagMousePosition({ x, y });
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setTagRotation({ x: rotateX, y: rotateY });
  };

  const handleTagMouseLeave = () => {
    setTagRotation({ x: 0, y: 0 });
    setTagMousePosition({ x: 0, y: 0 });
  };

  const codeLines = [
    'function visualizeAlgorithm(data) {',
    '  const sorted = bubbleSort(data);',
    '  return renderVisualization(sorted);',
    '}'
  ];

  // Reset the array to initial state
  const resetArray = () => {
    setBars([64, 34, 25, 12, 22]);
    setCurrentStep(0);
    setComparisonCount(0);
    setSwapCount(0);
  };

  // Optimize bubble sort visualization
  const bubbleSort = async () => {
    if (isSorting) return;
    
    resetArray();
    setIsSorting(true);
    
    let arr = [...bars];
    let n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setCurrentStep(j);
        setComparisonCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 300));

        if (arr[j] > arr[j + 1]) {
          setSwapCount(prev => prev + 1);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setBars([...arr]);
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }
    }
    setCurrentStep(-1);
    setIsSorting(false);
  };

  // Optimize typewriter effect
  useEffect(() => {
    let timeouts = [];
    let currentTimeout = null;
    
    const typeWriter = async () => {
      timeouts.forEach(clearTimeout);
      timeouts = [];
      
      for (let i = 0; i < codeLines.length; i++) {
        setCurrentLine(i);
        for (let j = 0; j <= codeLines[i].length; j++) {
          const timeout = setTimeout(() => {
            setTypedText(codeLines[i].substring(0, j));
          }, (i * 800) + (j * 15));
          timeouts.push(timeout);
        }
      }
      
      const pauseTimeout = setTimeout(() => {
        setTypedText('');
        setCurrentLine(0);
        currentTimeout = setTimeout(typeWriter, 600);
      }, 4000);
      timeouts.push(pauseTimeout);
    };

    typeWriter();
    
    return () => {
      timeouts.forEach(clearTimeout);
      if (currentTimeout) clearTimeout(currentTimeout);
    };
  }, []);

  // Auto-start sorting when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      bubbleSort();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Configure ScrollReveal animations
  useEffect(() => {
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '60px',
      duration: 1200,
      delay: 0,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reset: true,
      mobile: true,
      viewFactor: 0.2,
      beforeReveal: (el) => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
      },
      beforeReset: (el) => {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.transform = 'translateY(60px) scale(0.95) rotate(2deg)';
      }
    });

    // Enhanced Header section animations with ultra-smooth effects
    sr.reveal(badgeRef.current, {
      delay: 0,
      distance: '30px',
      duration: 1000,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.95,
      opacity: 0,
      rotate: { x: 5, z: 1 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    sr.reveal(headlinesRef.current, {
      delay: 100,
      distance: '40px',
      duration: 1200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.95,
      opacity: 0,
      rotate: { x: 3, y: 1 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    sr.reveal(descriptionRef.current, {
      delay: 200,
      distance: '35px',
      duration: 1000,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.95,
      opacity: 0,
      rotate: { x: 2 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    // Enhanced CTA section animation with ultra-smooth effect
    sr.reveal(ctaRef.current, {
      delay: 300,
      distance: '40px',
      duration: 1200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.95,
      opacity: 0,
      rotate: { y: 3, z: 1 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    // Enhanced Image animation with ultra-smooth effect
    sr.reveal(visualizationRef.current, {
      delay: 150,
      distance: '50px',
      duration: 1500,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'right',
      scale: 0.95,
      opacity: 0,
      rotate: { y: 5, z: 2 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateX(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    // Enhanced Stats animation with staggered effect
    sr.reveal(statsRef.current, {
      delay: 400,
      distance: '40px',
      duration: 1000,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      interval: 100,
      scale: 0.95,
      opacity: 0,
      rotate: { y: 3, z: 1 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    return () => {
      sr.destroy();
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex items-center justify-center py-16 overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Floating Code Snippets */}
        {['const', 'function', 'return', 'async', 'await', 'class'].map((code, i) => (
          <motion.div
            key={code}
            className="absolute text-slate-700/20 font-code text-sm select-none"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 2) * 40}%`,
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              y: [0, -10, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            {code}
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        ref={contentRef}
        className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10"
      >
        {/* Left Content */}
        <motion.div className="space-y-8 z-10">
          {/* Ultra-Modern Badge */}
          <motion.div
            ref={badgeRef}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-blue-500/20 mb-8 interactive-element group relative overflow-hidden"
            style={{
              background: "rgba(15, 23, 42, 0.3)",
              backdropFilter: "blur(10px)",
              transform: `perspective(1000px) rotateX(${tagRotation.x}deg) rotateY(${tagRotation.y}deg)`,
              transformStyle: "preserve-3d"
            }}
            onMouseMove={handleTagMouseMove}
            onMouseLeave={handleTagMouseLeave}
            whileHover={{
              borderColor: "rgba(124, 124, 243, 0.4)",
              boxShadow: "0 0 30px rgba(124, 124, 243, 0.2)",
              background: "rgba(15, 23, 42, 0.4)",
              transition: { 
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 1
              }
            }}
          >
            {/* Interactive Border Container */}
            <div className="absolute inset-0 rounded-full pointer-events-none">
              {/* Base Border */}
              <div className="absolute inset-0 rounded-full" />
              
              {/* Interactive Border Glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid transparent',
                  background: 'transparent',
                  maskImage: `
                    radial-gradient(
                      200px circle at ${tagMousePosition.x}px ${tagMousePosition.y}px,
                      black 20%,
                      transparent 80%
                    )
                  `,
                  WebkitMaskImage: `
                    radial-gradient(
                      200px circle at ${tagMousePosition.x}px ${tagMousePosition.y}px,
                      black 20%,
                      transparent 80%
                    )
                  `,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div 
                  className="absolute inset-0 rounded-full border border-blue-400/50"
                  style={{
                    boxShadow: '0 0 15px rgba(124, 124, 243, 0.3)',
                    opacity: 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </motion.div>
            </div>

            {/* Enhanced Background Effects */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at ${tagMousePosition.x}px ${tagMousePosition.y}px, rgba(124, 124, 243, 0.15), transparent 70%)`,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              animate={{
                background: [
                  `radial-gradient(circle at ${tagMousePosition.x}px ${tagMousePosition.y}px, rgba(124, 124, 243, 0.15), transparent 70%)`,
                  `radial-gradient(circle at ${tagMousePosition.x}px ${tagMousePosition.y}px, rgba(124, 124, 243, 0.2), transparent 70%)`,
                  `radial-gradient(circle at ${tagMousePosition.x}px ${tagMousePosition.y}px, rgba(124, 124, 243, 0.15), transparent 70%)`
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Enhanced Neural Network Pattern */}
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-[0.05]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(124, 124, 243, 0.4) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(124, 124, 243, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                transform: `translateZ(-1px) rotateX(${tagRotation.x * 0.5}deg) rotateY(${tagRotation.y * 0.5}deg)`,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              animate={{
                backgroundPosition: [
                  "0px 0px",
                  "10px 10px",
                  "0px 0px"
                ]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Enhanced Floating Particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-0 group-hover:opacity-100"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  background: `rgba(124, 124, 243, ${Math.random() * 0.2 + 0.1})`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  willChange: "transform",
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: `translateZ(${Math.random() * 20}px) rotateX(${tagRotation.x * 0.3}deg) rotateY(${tagRotation.y * 0.3}deg)`
                }}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1],
                  delay: i * 0.4,
                }}
              />
            ))}

            {/* Enhanced Content */}
            <div 
              className="relative flex items-center gap-3"
              style={{
                transform: `translateZ(20px) rotateX(${tagRotation.x * 0.2}deg) rotateY(${tagRotation.y * 0.2}deg)`,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }
                }}
                whileHover={{
                  rotate: 180,
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    mass: 0.8
                  }
                }}
                style={{
                  transform: `translateZ(30px) rotateX(${tagRotation.x * 0.3}deg) rotateY(${tagRotation.y * 0.3}deg)`,
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                <Sparkles className="w-5 h-5 text-blue-400" />
              </motion.div>

              <motion.span 
                className="text-sm font-medium text-slate-300 group-hover:text-blue-300"
                style={{
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: `translateZ(25px) rotateX(${tagRotation.x * 0.2}deg) rotateY(${tagRotation.y * 0.2}deg)`
                }}
                animate={{
                  textShadow: [
                    "0 0 0px rgba(124, 124, 243, 0)",
                    "0 0 10px rgba(124, 124, 243, 0.3)",
                    "0 0 0px rgba(124, 124, 243, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1]
                }}
                whileHover={{
                  textShadow: "0 0 15px rgba(124, 124, 243, 0.5)",
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    mass: 0.8
                  }
                }}
              >
                AI-Powered Learning Platform
              </motion.span>
            </div>

            {/* Enhanced Hover Effect Border */}
            <motion.div
              className="absolute inset-0 rounded-full border border-blue-400/0"
              style={{
                backgroundColor: "rgba(124, 124, 243, 0)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translateZ(10px) rotateX(${tagRotation.x * 0.1}deg) rotateY(${tagRotation.y * 0.1}deg)`
              }}
              whileHover={{
                backgroundColor: "rgba(124, 124, 243, 0.1)",
                borderColor: "rgba(124, 124, 243, 0.3)",
                boxShadow: "0 0 30px rgba(124, 124, 243, 0.3)",
                scale: 1.05,
                transition: { 
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 1
                }
              }}
            />

            {/* Enhanced Hover Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0"
              style={{
                backgroundColor: "rgba(124, 124, 243, 0)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translateZ(5px) rotateX(${tagRotation.x * 0.05}deg) rotateY(${tagRotation.y * 0.05}deg)`
              }}
              whileHover={{
                opacity: 0.1,
                backgroundColor: "rgba(124, 124, 243, 0.5)",
                transition: { 
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 1
                }
              }}
            />
          </motion.div>

          {/* Headlines */}
          <div ref={headlinesRef} className="space-y-8">
            <motion.h1
              className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <motion.span 
                className="relative inline-block text-slate-100"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                style={{ 
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)'
                }}
              >
                <span className="relative z-10">Master</span>
              </motion.span>

              <br />

              <motion.span 
                className="relative inline-block"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                style={{ 
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)'
                }}
              >
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-navy-400 via-navy-300 to-navy-400">
                  Data Structures
                </span>
              </motion.span>

              <br />

              <motion.span 
                className="relative inline-block text-slate-100"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                style={{ 
                  willChange: 'transform, opacity',
                  transform: 'translateZ(0)'
                }}
              >
                <span className="relative z-10">& Algorithms</span>
              </motion.span>
            </motion.h1>
          </div>

          {/* Description */}
          <motion.div
            ref={descriptionRef}
            className="text-lg text-slate-400 max-w-2xl leading-relaxed"
            style={{ willChange: 'transform, opacity' }}
          >
            Transform complex algorithms into intuitive visualizations. Get AI-powered explanations 
            and master programming concepts through{" "}
            <motion.span 
              className="relative inline-block text-navy-300 font-semibold"
              whileHover={{ scale: 1.05 }}
              style={{ 
                willChange: 'transform',
                transform: 'translateZ(0)'
              }}
            >
              <span className="relative z-10">immersive learning</span>
            </motion.span>.
          </motion.div>

          {/* CTAs */}
          <motion.div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link to="/debugger" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ 
                  scale: 1.03, 
                  y: -2,
                  boxShadow: "0 8px 32px rgba(79, 70, 229, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)"
                }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="group relative px-8 py-4 rounded-xl font-semibold flex items-center gap-3 overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                  color: "#FFFAFA",
                  boxShadow: "0 4px 20px rgba(79, 70, 229, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  letterSpacing: "0.02em",
                  minWidth: "280px",
                  position: "relative",
                  isolation: "isolate"
                }}
              >
                <div className="relative flex items-center justify-between w-full gap-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="relative"
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Code2 className="w-5 h-5 text-white" />
                    </motion.div>
                    <span className="text-base font-medium relative text-white">
                      Start Learning Now
                    </span>
                  </div>
                  <motion.div
                    className="relative"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </motion.div>
                </div>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ 
                scale: 1.03, 
                y: -2,
                boxShadow: "0 8px 32px rgba(79, 70, 229, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)"
              }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="group relative px-8 py-4 rounded-xl font-semibold flex items-center gap-3 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                color: "#FFFAFA",
                boxShadow: "0 4px 20px rgba(79, 70, 229, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                letterSpacing: "0.02em",
                minWidth: "200px",
                position: "relative",
                isolation: "isolate"
              }}
            >
              <div className="relative flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="relative"
                    animate={{ 
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Play className="w-5 h-5 text-white" />
                  </motion.div>
                  <span className="text-base font-medium relative text-white">
                    Watch Demo
                  </span>
                </div>
                <motion.div
                  className="relative flex items-center gap-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className="px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{
                      background: "rgba(124, 124, 243, 0.1)",
                      border: "1px solid rgba(124, 124, 243, 0.2)"
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    2:30
                  </motion.div>
                </motion.div>
              </div>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            ref={statsRef}
            className="grid grid-cols-3 gap-8 pt-12"
          >
            {[
              { number: '50K+', label: 'Students Taught' },
              { number: '15+', label: 'Languages Supported' },
              { number: '98%', label: 'Success Rate' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="text-center interactive-element group"
              >
                <motion.div 
                  className="text-3xl font-bold text-navy-400 group-hover:text-navy-300 transition-colors duration-300"
                  animate={{ 
                    textShadow: [
                      "0 0 0px rgba(124, 124, 243, 0)",
                      "0 0 10px rgba(124, 124, 243, 0.3)",
                      "0 0 0px rgba(124, 124, 243, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors duration-300 mt-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Content - Code Editor */}
        <motion.div
          ref={codeEditorRef}
          className="relative z-10"
        >
          {/* Code Editor Window */}
          <motion.div
            className="relative code-block p-6 interactive-card shadow-floating"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)"
            }}
            whileHover={{ 
              rotateY: 2,
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.5))",
              borderColor: "rgba(255, 255, 255, 0.1)",
              boxShadow: "0 0 30px rgba(59, 130, 246, 0.1), inset 0 0 15px rgba(255, 255, 255, 0.08)",
              transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-red-500/80"
                    whileHover={{ scale: 1.2, boxShadow: "0 0 10px rgba(239, 68, 68, 0.5)" }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-yellow-500/80"
                    whileHover={{ scale: 1.2, boxShadow: "0 0 10px rgba(234, 179, 8, 0.5)" }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-emerald-500/80"
                    whileHover={{ scale: 1.2, boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }}
                  />
                </div>
                <span className="text-sm text-slate-400 ml-2 font-mono">algorithm-visualizer.js</span>
              </div>
              <motion.div 
                className="flex items-center gap-2 text-xs text-slate-500"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft" />
                TypeScript
              </motion.div>
            </div>

            {/* Code Content */}
            <div className="font-code text-sm space-y-2 relative">
              {/* Code Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(124,124,243,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,124,243,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
              
              {/* Line Numbers Background */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-900/30 border-r border-slate-700/20" />

              {codeLines.map((line, index) => (
                <motion.div 
                  key={index} 
                  className="flex group relative"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    backgroundColor: index === currentLine ? "rgba(124, 124, 243, 0.05)" : "transparent"
                  }}
                  transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {/* Line Number */}
                  <span className="text-slate-500 w-8 text-right mr-4 select-none group-hover:text-slate-400 transition-colors duration-200 font-mono">
                    {index + 1}
                  </span>

                  {/* Code Content */}
                  <span className={`transition-all duration-300 font-mono ${
                    index === currentLine ? 'text-navy-300 drop-shadow-sm' : 'text-slate-300'
                  }`}>
                    {index === currentLine ? (
                      <>
                        {typedText}
                        <motion.span 
                          className="text-navy-400"
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ 
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          |
                        </motion.span>
                      </>
                    ) : (
                      index < currentLine ? line : ''
                    )}
                  </span>
                </motion.div>
              ))}

              {/* Code Editor Footer */}
              <div className="mt-4 pt-4 border-t border-slate-700/30 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span>TypeScript</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-2 h-2 bg-navy-400 rounded-full" />
                    <span>ES6</span>
                  </motion.div>
                </div>
                <motion.div 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="font-mono">Ln {currentLine + 1}, Col {typedText.length + 1}</span>
                </motion.div>
              </div>
            </div>

            {/* Interactive Visualization */}
            <motion.div
              ref={visualizationRef}
              className="mt-6 p-6 backdrop-modern rounded-xl border border-navy-400/10 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)"
              }}
            >
              <div className="relative z-10">
                <div className="text-xs text-navy-400 mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div 
                      className="w-2 h-2 bg-emerald-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    Live Visualization
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Comparisons:</span>
                      <motion.span
                        key={comparisonCount}
                        initial={{ scale: 1.2, color: "#22D3EE" }}
                        animate={{ scale: 1, color: "#7C7CF3" }}
                        transition={{ duration: 0.3 }}
                        className="font-mono"
                      >
                        {comparisonCount}
                      </motion.span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Swaps:</span>
                      <motion.span
                        key={swapCount}
                        initial={{ scale: 1.2, color: "#22D3EE" }}
                        animate={{ scale: 1, color: "#7C7CF3" }}
                        transition={{ duration: 0.3 }}
                        className="font-mono"
                      >
                        {swapCount}
                      </motion.span>
                    </div>
                    <motion.button
                      onClick={bubbleSort}
                      disabled={isSorting}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        isSorting 
                          ? 'border-slate-600 text-slate-500 cursor-not-allowed' 
                          : 'border-navy-400/30 hover:border-navy-400/50'
                      }`}
                      whileHover={!isSorting ? { scale: 1.05 } : {}}
                      whileTap={!isSorting ? { scale: 0.95 } : {}}
                    >
                      {isSorting ? 'Sorting...' : 'Sort Again'}
                    </motion.button>
                  </div>
                </div>
                
                <div className="flex gap-6 justify-center items-end h-32 relative">
                  {/* Background grid for better visual reference */}
                  <div className="absolute inset-0 grid grid-cols-5 gap-6 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-l border-navy-400/10" />
                    ))}
                  </div>
                  
                  {bars.map((value, index) => (
                    <motion.div
                      key={`${index}-${value}`}
                      className="relative rounded-t"
                      style={{ width: '16px' }}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: `${value}px`,
                        opacity: 1,
                        backgroundColor: currentStep === index || currentStep === index + 1 
                          ? 'rgba(124, 124, 243, 0.8)' 
                          : 'rgba(124, 124, 243, 0.4)',
                        y: 0
                      }}
                      transition={{ 
                        type: "spring",
                        stiffness: 170,
                        damping: 26,
                        mass: 1.2,
                        duration: 0.8
                      }}
                      whileHover={{ 
                        scale: 1.1,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <motion.div
                        className="bg-gradient-to-t from-navy-500 to-navy-400 rounded-t w-full"
                        style={{ height: '100%' }}
                        animate={{ 
                          background: [
                            "linear-gradient(to top, #7C7CF3, #A5BCFC)",
                            "linear-gradient(to top, #22D3EE, #67E8F9)", 
                            "linear-gradient(to top, #7C7CF3, #A5BCFC)"
                          ]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-slate-400 font-code"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          color: currentStep === index || currentStep === index + 1 
                            ? '#22D3EE' 
                            : '#94A3B8'
                        }}
                        transition={{ 
                          type: "spring",
                          stiffness: 170,
                          damping: 26,
                          mass: 1.2,
                          duration: 0.8
                        }}
                      >
                        {value}
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                {/* Algorithm Progress Indicator */}
                <motion.div 
                  className="mt-4 h-1 bg-navy-400/10 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-navy-400 to-navy-300"
                    initial={{ width: "0%" }}
                    animate={{ 
                      width: isSorting ? "100%" : "0%"
                    }}
                    transition={{ 
                      duration: 8,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        ref={scrollIndicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="flex flex-col items-center gap-6 text-slate-400">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span 
              className="text-sm font-medium hover:text-slate-300 transition-colors duration-300 relative z-10"
            >
              Scroll to explore
            </motion.span>
          </motion.div>

          <motion.div
            className="relative w-12 h-20"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: "radial-gradient(circle at center, rgba(124, 124, 243, 0.2) 0%, transparent 70%)",
                filter: "blur(8px)"
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Animated Rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute inset-0 rounded-full border border-navy-400/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
              />
            ))}

            {/* Center Line with Dots */}
            <motion.div
              className="absolute inset-x-0 top-0 bottom-0 w-0.5 bg-navy-400/20 rounded-full mx-auto"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`dot-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-navy-400"
                  style={{
                    boxShadow: "0 0 10px rgba(124, 124, 243, 0.3)",
                    transform: "translateX(-50%)",
                    left: "-50%"
                  }}
                  animate={{
                    y: [0, 30, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                    times: [0, 0.5, 1]
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-navy-400/30"
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;