import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Target, Eye, MessageSquare, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);

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

    sr.reveal(titleRef.current, {
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

    // Enhanced Steps animation with staggered effect
    sr.reveal(stepsRef.current, {
      delay: 150,
      distance: '50px',
      duration: 1200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      interval: 100,
      scale: 0.95,
      opacity: 0,
      rotate: { y: 5, z: 2 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
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

    return () => {
      sr.destroy();
    };
  }, []);

  const steps = [
    {
      icon: Edit3,
      title: "Write Your Code",
      description: "Start with any algorithm or data structure. Our intelligent editor supports multiple programming languages with syntax highlighting.",
      code: "function bubbleSort(arr) {\n  for(let i = 0; i < arr.length; i++) {\n    // Implementation here\n  }\n}",
      delay: 0.1
    },
    {
      icon: Target,
      title: "Automatic Algorithm Selection",
      description: "Let our AI intelligently detect the type of algorithm you're implementing—whether it's sorting, searching, recursion or graph-based—so you can focus on writing logic, not labels.",
      code: "Algorithm: Bubble Sort\nComplexity: O(n²)\nType: Sorting\nOptimal for: Small datasets",
      delay: 0.2
    },
    {
      icon: Eye,
      title: "Watch It Visualize",
      description: "See your algorithm come to life with step-by-step visualizations. Track variables, function calls, and data flow.",
      code: "Step 1: Compare arr[0] with arr[1]\nStep 2: Swap if needed\nStep 3: Move to next pair\n✓ Visualization active",
      delay: 0.3
    },
    {
      icon: MessageSquare,
      title: "Get AI Insights",
      description: "Receive detailed explanations, optimization suggestions, and learn why each step happens the way it does.",
      code: "💡 Optimization tip:\nQuickSort would be O(n log n)\n\n🎯 Learning insight:\nBubble sort demonstrates comparison sorting",
      delay: 0.4
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-20 bg-gradient-to-b from-navy-900 to-navy-950">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
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
                <Lightbulb className="w-5 h-5 text-blue-400" />
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
                How It Works
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

          <h2 ref={titleRef} className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <motion.span 
              className="relative inline-block text-slate-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              style={{ 
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            >
              <span className="relative z-10">Learn Through</span>
            </motion.span>

            <br />

            <motion.span 
              className="relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              style={{ 
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            >
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-navy-400 via-navy-300 to-navy-400">
                Interactive Experience
              </span>
            </motion.span>
          </h2>

          <motion.p 
            ref={descriptionRef} 
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{ willChange: 'transform, opacity' }}
          >
            Follow our step-by-step learning process designed to help you master programming concepts 
            through hands-on practice and real-time feedback.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div ref={stepsRef} className="grid lg:grid-cols-2 gap-8 items-start">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="group"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Card */}
              <motion.div
                className="relative p-6 glass-pro rounded-xl border border-slate-700/50 hover:border-blue-500/30 interactive-card transition-all duration-300 ease-in-out opacity-0 bg-transparent"
                initial={{ opacity: 0, backgroundColor: 'transparent' }}
                animate={{ opacity: 1, backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                whileHover={{
                  boxShadow: "0 0 30px rgba(124, 124, 243, 0.1)",
                  borderColor: "rgba(124, 124, 243, 0.3)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="flex items-start gap-4">
                  
                  {/* Step Icon & Number */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.03, rotate: 3 }}
                      transition={{ duration: 0.3 }}
                      className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-blue-glow"
                    >
                      <step.icon className="w-full h-full text-white" />
                    </motion.div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-emerald-glow">
                      {index + 1}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold text-slate-100 group-hover:text-blue-300 transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-slate-400 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Interactive Demo Button */}
                    <motion.button
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.3 }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300 interactive-element"
                      style={{
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid rgba(59, 130, 246, 0.2)",
                        boxShadow: "0 0 15px rgba(59, 130, 246, 0.05)",
                        transition: "all 0.3s ease-in-out",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem"
                      }}
                    >
                      <span>Try This Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Code Preview */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 code-block p-3"
                >
                  <pre className="text-sm text-slate-300 font-mono">
                    <code>{step.code}</code>
                  </pre>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div ref={ctaRef} className="text-center mt-16">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="btn-primary px-8 py-4 rounded-xl font-semibold interactive-element"
          >
            Start Your Learning Journey
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;