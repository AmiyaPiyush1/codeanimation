import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
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
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  const isInView = useInView(sectionRef, { 
    once: true,
    margin: "0px",
    amount: 0.2
  });

  // Ultra-precise scroll-based animations with better ranges
  const mainOpacity = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [1, 1, 1, 0], 
    { clamp: true }
  );
  const mainScale = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [1, 1, 1, 0.98], 
    { clamp: true }
  );
  const mainY = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [0, 0, 0, -30], 
    { clamp: true }
  );
  const mainRotateX = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [0, 0, 0, -2], 
    { clamp: true }
  );
  const mainBlur = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [0, 0, 0, 3], 
    { clamp: true }
  );

  // Precise content animations with better timing
  const contentOpacity = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [1, 1, 1, 0], 
    { clamp: true }
  );
  const contentY = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [0, 0, 0, -20], 
    { clamp: true }
  );
  const contentScale = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [1, 1, 1, 0.98], 
    { clamp: true }
  );

  // Precise scroll indicator animations
  const indicatorOpacity = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [1, 1, 1, 0], 
    { clamp: true }
  );
  const indicatorY = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [0, 0, 0, -10], 
    { clamp: true }
  );
  const indicatorScale = useTransform(scrollYProgress, 
    [0, 0.05, 0.95, 1], 
    [1, 1, 1, 0.98], 
    { clamp: true }
  );

  const [typedText, setTypedText] = useState('');
  const [currentLine, setCurrentLine] = useState(0);
  const [bars, setBars] = useState([64, 34, 25, 12, 22]);
  const [isSorting, setIsSorting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [swapCount, setSwapCount] = useState(0);

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

  // Bubble sort visualization with enhanced animations
  const bubbleSort = async () => {
    if (isSorting) return;
    
    // Reset state before starting new sort
    resetArray();
    setIsSorting(true);
    
    let arr = [...bars];
    let n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setCurrentStep(j);
        setComparisonCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (arr[j] > arr[j + 1]) {
          setSwapCount(prev => prev + 1);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setBars([...arr]);
          await new Promise(resolve => setTimeout(resolve, 700));
        }
      }
    }
    setCurrentStep(-1);
    setIsSorting(false);
  };

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
          }, (i * 1200) + (j * 20));
          timeouts.push(timeout);
        }
      }
      
      const pauseTimeout = setTimeout(() => {
        setTypedText('');
        setCurrentLine(0);
        currentTimeout = setTimeout(typeWriter, 800);
      }, 5000);
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

  useEffect(() => {
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '60px',
      duration: 1000,
      delay: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reset: false
    });

    // Configure different animations for different elements
    sr.reveal(contentRef.current, {
      delay: 200,
      distance: '40px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'left'
    });

    sr.reveal(codeEditorRef.current, {
      delay: 400,
      distance: '60px',
      duration: 1000,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'right'
    });

    sr.reveal(ctaRef.current, {
      delay: 600,
      distance: '40px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom'
    });

    sr.reveal(statsRef.current, {
      delay: 800,
      distance: '40px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom',
      interval: 100
    });

    sr.reveal(scrollIndicatorRef.current, {
      delay: 1000,
      distance: '20px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom'
    });

    return () => {
      sr.destroy();
    };
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen flex items-center justify-center py-20 overflow-hidden"
      style={{
        perspective: "1000px",
        position: "relative",
        opacity: mainOpacity,
        scale: mainScale,
        y: mainY,
        rotateX: mainRotateX,
        filter: `blur(${mainBlur}px)`,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Enhanced Background Elements with Better Parallax */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          opacity: useTransform(scrollYProgress, 
            [0, 0.05, 0.95, 1], 
            [1, 1, 1, 0], 
            { clamp: true }
          ),
          scale: useTransform(scrollYProgress, 
            [0, 0.05, 0.95, 1], 
            [1, 1, 1, 0.98], 
            { clamp: true }
          ),
          y: useTransform(scrollYProgress, 
            [0, 0.05, 0.95, 1], 
            [0, 0, 0, -15], 
            { clamp: true }
          ),
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Floating Code Snippets with Enhanced Parallax */}
        {['const', 'function', 'return', 'async', 'await', 'class'].map((code, i) => (
          <motion.div
            key={code}
            className="absolute text-slate-700/20 font-code text-sm select-none"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 2) * 40}%`,
              y: useTransform(scrollYProgress, 
                [0, 0.05, 0.95, 1], 
                [0, 0, 0, i * -5], 
                { clamp: true }
              ),
              rotate: useTransform(scrollYProgress, 
                [0, 0.05, 0.95, 1], 
                [0, 0, 0, i * -1], 
                { clamp: true }
              ),
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              delay: i * 0.5,
            }}
          >
            {code}
          </motion.div>
        ))}
      </motion.div>

      {/* Enhanced Smooth Transition Element */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(15, 23, 42, 0.8), rgb(15, 23, 42))",
          opacity: useTransform(scrollYProgress, 
            [0.05, 0.1, 0.95, 1], 
            [0, 0.5, 0.5, 1], 
            { clamp: true }
          ),
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      <motion.div 
        ref={contentRef}
        className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10"
        style={{
          opacity: contentOpacity,
          scale: contentScale,
          y: contentY,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Left Content with Enhanced Scroll Animations */}
        <motion.div
          className="space-y-8 z-10"
          style={{
            x: useTransform(scrollYProgress, 
              [0, 0.05, 0.95, 1], 
              [0, 0, 0, -20], 
              { clamp: true }
            ),
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Ultra-Modern Badge with Scroll-based Effects */}
          <motion.div
            className="relative inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-modern border border-navy-400/20 interactive-element group overflow-hidden"
            style={{
              scale: useTransform(scrollYProgress, [0, 0.05, 0.1], [1, 0.95, 0.9], {
                clamp: true
              }),
              rotate: useTransform(scrollYProgress, [0, 0.05, 0.1], [0, -2.5, -5], {
                clamp: true
              })
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 30px rgba(124, 124, 243, 0.2)",
              borderColor: "rgba(124, 124, 243, 0.3)",
              transition: { 
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
          >
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 opacity-20"
              animate={{
                background: [
                  'radial-gradient(circle at 0% 0%, rgba(124, 124, 243, 0.3) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(34, 211, 238, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 100% 0%, rgba(124, 124, 243, 0.3) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(34, 211, 238, 0.3) 0%, transparent 50%)',
                  'radial-gradient(circle at 0% 0%, rgba(124, 124, 243, 0.3) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(34, 211, 238, 0.3) 0%, transparent 50%)'
                ]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              whileHover={{
                opacity: 0.3,
                scale: 1.1,
                transition: { duration: 0.2 }
              }}
            />

            {/* Neural Network Pattern */}
            <motion.div 
              className="absolute inset-0 opacity-[0.03]" 
              style={{
                backgroundImage: `
                  linear-gradient(rgba(124, 124, 243, 0.4) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(124, 124, 243, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
              whileHover={{
                opacity: 0.05,
                scale: 1.05,
                rotate: 5,
                transition: { duration: 0.2 }
              }}
            />

            {/* Floating Particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 3 + 1}px`,
                  height: `${Math.random() * 3 + 1}px`,
                  background: `rgba(124, 124, 243, ${Math.random() * 0.3 + 0.1})`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
                whileHover={{
                  scale: 1.5,
                  opacity: 0.5,
                  transition: { duration: 0.2 }
                }}
              />
            ))}

            {/* Content */}
            <div className="relative flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
                whileHover={{
                  scale: 1.3,
                  rotate: 180,
                  transition: { duration: 0.2 }
                }}
              >
                <Sparkles className="w-5 h-5 text-navy-400" />
              </motion.div>

              <motion.span 
                className="text-sm font-medium text-slate-300 group-hover:text-navy-300 transition-colors duration-300"
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
                  ease: "easeInOut"
                }}
                whileHover={{
                  scale: 1.05,
                  textShadow: "0 0 15px rgba(124, 124, 243, 0.5)",
                  transition: { duration: 0.2 }
                }}
              >
                AI-Powered Learning Platform
              </motion.span>

              <motion.div
                className="w-2 h-2 bg-emerald-400 rounded-full"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [1, 0.6, 1],
                  boxShadow: [
                    "0 0 0px rgba(16, 185, 129, 0)",
                    "0 0 10px rgba(16, 185, 129, 0.5)",
                    "0 0 0px rgba(16, 185, 129, 0)"
                  ]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileHover={{
                  scale: 1.5,
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.8)",
                  transition: { duration: 0.2 }
                }}
              />
            </div>

            {/* Hover Effect Border */}
            <motion.div
              className="absolute inset-0 rounded-full border border-navy-400/0"
              style={{
                backgroundColor: "rgba(124, 124, 243, 0)"
              }}
              whileHover={{
                backgroundColor: "rgba(124, 124, 243, 0.3)",
                boxShadow: "0 0 30px rgba(124, 124, 243, 0.3)",
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            />

            {/* Hover Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0"
              style={{
                backgroundColor: "rgba(124, 124, 243, 0)"
              }}
              whileHover={{
                opacity: 0.1,
                backgroundColor: "rgba(124, 124, 243, 0.5)",
                transition: { duration: 0.2 }
              }}
            />
          </motion.div>

          {/* Enhanced Headlines */}
          <div className="space-y-6">
            <motion.h1
              className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
              style={{
                opacity: useTransform(scrollYProgress, [0, 0.05, 0.1], [1, 0.5, 0], {
                  clamp: true
                }),
                y: useTransform(scrollYProgress, [0, 0.05, 0.1], [0, 25, 50], {
                  clamp: true
                })
              }}
            >
              <motion.span 
                className="text-slate-100"
                style={{
                  opacity: useTransform(scrollYProgress, [0, 0.03, 0.05], [1, 0.5, 0], {
                    clamp: true
                  }),
                  y: useTransform(scrollYProgress, [0, 0.03, 0.05], [0, 15, 25], {
                    clamp: true
                  })
                }}
              >
                Master
              </motion.span>
              <br />
              <motion.span 
                className="gradient-text"
                style={{
                  opacity: useTransform(scrollYProgress, [0, 0.07, 0.1], [1, 0.5, 0], {
                    clamp: true
                  }),
                  y: useTransform(scrollYProgress, [0, 0.07, 0.1], [0, 20, 40], {
                    clamp: true
                  })
                }}
              >
                Data Structures
              </motion.span>
              <br />
              <motion.span 
                className="text-slate-100"
                style={{
                  opacity: useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 0.5, 0], {
                    clamp: true
                  }),
                  y: useTransform(scrollYProgress, [0, 0.1, 0.15], [0, 30, 60], {
                    clamp: true
                  })
                }}
              >
                & Algorithms
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-lg text-slate-400 max-w-2xl leading-relaxed"
              style={{
                opacity: useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 0.5, 0], {
                  clamp: true
                }),
                y: useTransform(scrollYProgress, [0, 0.1, 0.15], [0, 30, 60], {
                  clamp: true
                })
              }}
            >
              Transform complex algorithms into intuitive visualizations. Get AI-powered explanations 
              and master programming concepts through{" "}
              <motion.span 
                className="text-navy-300 font-semibold"
                style={{
                  opacity: useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 0.5, 0], {
                    clamp: true
                  }),
                  scale: useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 0.9, 0.8], {
                    clamp: true
                  })
                }}
              >
                immersive learning
              </motion.span>.
            </motion.p>
          </div>

          {/* Enhanced CTAs */}
          <motion.div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 0.5, 0], {
                clamp: true
              }),
              y: useTransform(scrollYProgress, [0, 0.15, 0.25], [0, 35, 70], {
                clamp: true
              })
            }}
          >
            <Link to="/debugger" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
                className="group btn-primary px-8 py-4 rounded-xl font-semibold flex items-center gap-2 interactive-element magnetic shadow-blue-glow-lg"
              >
                <Code2 className="w-5 h-5" />
                Start Learning Now
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </motion.button>
            </Link>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="group btn-secondary px-8 py-4 rounded-xl font-semibold flex items-center gap-2 interactive-element magnetic"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Play className="w-5 h-5" />
              </motion.div>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Enhanced Stats */}
          <motion.div
            ref={statsRef}
            className="flex gap-8 pt-8"
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 0.5, 0], {
                clamp: true
              }),
              y: useTransform(scrollYProgress, [0, 0.15, 0.25], [0, 40, 80], {
                clamp: true
              })
            }}
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
                  className="text-2xl font-bold text-navy-400 group-hover:text-navy-300 transition-colors duration-300"
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
                <div className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors duration-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Right Content - Code Editor */}
        <motion.div
          ref={codeEditorRef}
          className="relative z-10"
          style={{
            x: useTransform(scrollYProgress, 
              [0, 0.05, 0.95, 1], 
              [0, 0, 0, 20], 
              { clamp: true }
            ),
            opacity: useTransform(scrollYProgress,
              [0, 0.05, 0.95, 1],
              [1, 1, 1, 0],
              { clamp: true }
            ),
            scale: useTransform(scrollYProgress,
              [0, 0.05, 0.95, 1],
              [1, 1, 1, 0.98],
              { clamp: true }
            ),
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Enhanced Code Editor Window */}
          <motion.div
            className="relative code-block p-6 interactive-card shadow-floating"
            style={{ 
              perspective: "1000px",
              rotateX: useTransform(scrollYProgress,
                [0, 0.05, 0.95, 1],
                [0, 0, 0, -2],
                { clamp: true }
              ),
              rotateY: useTransform(scrollYProgress,
                [0, 0.05, 0.95, 1],
                [0, 0, 0, 2],
                { clamp: true }
              ),
              y: useTransform(scrollYProgress,
                [0, 0.05, 0.95, 1],
                [0, 0, 0, -10],
                { clamp: true }
              ),
              transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            whileHover={{ 
              y: -6, 
              rotateY: 2,
              transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
            }}
          >
            {/* Enhanced Editor Header */}
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

            {/* Enhanced Code Content */}
            <div className="font-code text-sm space-y-2 relative">
              {/* Code Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(124,124,243,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(124,124,243,0.03)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_70%)]" />
              
              {/* Line Numbers Background */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-slate-900/50 border-r border-slate-700/30" />

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

                  {/* Line Highlight Effect */}
                  <motion.div 
                    className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      backgroundColor: "rgba(124, 124, 243, 0)"
                    }}
                    initial={false}
                    animate={{ 
                      opacity: index === currentLine ? 1 : 0,
                      backgroundColor: index === currentLine ? "rgba(124, 124, 243, 0.1)" : "rgba(124, 124, 243, 0)"
                    }}
                  />
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

            {/* Enhanced Interactive Visualization */}
            <motion.div
              className="mt-6 p-6 backdrop-modern rounded-xl border border-navy-400/10 relative overflow-hidden"
              style={{
                opacity: useTransform(scrollYProgress,
                  [0, 0.05, 0.95, 1],
                  [1, 1, 1, 0.5],
                  { clamp: true }
                ),
                y: useTransform(scrollYProgress,
                  [0, 0.05, 0.95, 1],
                  [0, 0, 0, -10],
                  { clamp: true }
                ),
                scale: useTransform(scrollYProgress,
                  [0, 0.05, 0.95, 1],
                  [1, 1, 1, 0.98],
                  { clamp: true }
                ),
                transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {/* Enhanced Background Effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Animated Mesh Gradient */}
                <motion.div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0%, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.2) 0%, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.2) 0%, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.3) 0%, transparent 50%)',
                    opacity: useTransform(scrollYProgress,
                      [0, 0.05, 0.95, 1],
                      [0.2, 0.2, 0.2, 0.1],
                      { clamp: true }
                    )
                  }}
                  animate={{
                    background: [
                      'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0%, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.2) 0%, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.2) 0%, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.3) 0%, transparent 50%)',
                      'radial-gradient(at 97% 21%, hsla(215, 98%, 61%, 0.3) 0%, transparent 50%), radial-gradient(at 27% 37%, hsla(125, 98%, 72%, 0.2) 0%, transparent 50%), radial-gradient(at 10% 29%, hsla(354, 98%, 61%, 0.2) 0%, transparent 50%), radial-gradient(at 52% 99%, hsla(256, 96%, 67%, 0.3) 0%, transparent 50%)',
                      'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0%, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.2) 0%, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.2) 0%, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.3) 0%, transparent 50%)'
                    ]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Neural Grid Pattern */}
                <motion.div 
                  className="absolute inset-0 opacity-[0.03]" 
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(124, 124, 243, 0.4) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(124, 124, 243, 0.4) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    opacity: useTransform(scrollYProgress,
                      [0, 0.05, 0.95, 1],
                      [0.03, 0.03, 0.03, 0.01],
                      { clamp: true }
                    )
                  }}
                />

                {/* Floating Particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${Math.random() * 4 + 2}px`,
                      height: `${Math.random() * 4 + 2}px`,
                      background: `rgba(124, 124, 243, ${Math.random() * 0.3 + 0.1})`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: useTransform(scrollYProgress,
                        [0, 0.05, 0.95, 1],
                        [0.3, 0.3, 0.3, 0.1],
                        { clamp: true }
                      )
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.1, 0.3, 0.1],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>

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

      {/* Enhanced Scroll Indicator with Dynamic Effects */}
      <motion.div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
        style={{
          opacity: indicatorOpacity,
          y: indicatorY,
          scale: indicatorScale,
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <motion.div
          className="flex flex-col items-center gap-6 text-slate-400 interactive-element group"
        >
          <motion.span 
            className="text-sm font-medium group-hover:text-slate-300 transition-colors duration-300"
            style={{
              textShadow: useTransform(
                scrollYProgress,
                [0, 0.4],
                ["0 0 15px rgba(124, 124, 243, 0.4)", "0 0 0px rgba(124, 124, 243, 0)"]
              )
            }}
          >
            Scroll to explore
          </motion.span>

          {/* New Sophisticated Scroll Indicator */}
          <motion.div
            className="relative w-8 h-16"
            style={{
              scale: useTransform(scrollYProgress, [0, 0.4], [1, 0.8], {
                clamp: true
              })
            }}
          >
            {/* Outer Ring */}
            <motion.div
              className="absolute inset-0 rounded-full border border-navy-400/20"
              animate={{
                borderColor: [
                  "rgba(124, 124, 243, 0.2)",
                  "rgba(124, 124, 243, 0.4)",
                  "rgba(124, 124, 243, 0.2)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Inner Ring */}
            <motion.div
              className="absolute inset-2 rounded-full border border-navy-400/30"
              animate={{
                borderColor: [
                  "rgba(124, 124, 243, 0.3)",
                  "rgba(124, 124, 243, 0.5)",
                  "rgba(124, 124, 243, 0.3)"
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />

            {/* Center Line */}
            <motion.div
              className="absolute inset-x-0 top-0 bottom-0 w-0.5 bg-navy-400/20 rounded-full mx-auto"
              style={{
                opacity: useTransform(scrollYProgress, [0, 0.4], [1, 0], {
                  clamp: true
                })
              }}
            >
              {/* Animated Dots */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full bg-navy-400"
                  style={{
                    boxShadow: "0 0 10px rgba(124, 124, 243, 0.3)",
                    transform: "translateX(-50%)",
                    left: "50%"
                  }}
                  animate={{
                    y: [0, 40, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                    times: [0, 0.5, 1]
                  }}
                />
              ))}

              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-navy-400/10 rounded-full blur-sm"
                animate={{
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Pulse Rings */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={`ring-${i}`}
                className="absolute inset-0 rounded-full border border-navy-400/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;