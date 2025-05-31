import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Eye, Brain, Share2, Globe, BookOpen, Zap, ArrowRight, Sparkles } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const Features = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const ctaRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const isInView = useInView(sectionRef, { 
    once: true,
    margin: "0px",
    amount: 0.2
  });

  // Enhanced scroll-based animations with better coordination
  const sectionOpacity = useTransform(scrollYProgress, 
    [0, 0.05, 0.85, 0.95], 
    [0, 1, 1, 0], 
    { clamp: true }
  );
  const sectionY = useTransform(scrollYProgress, 
    [0, 0.05, 0.85, 0.95], 
    [30, 0, 0, -30], 
    { clamp: true }
  );
  const sectionScale = useTransform(scrollYProgress, 
    [0, 0.05, 0.85, 0.95], 
    [0.98, 1, 1, 0.98], 
    { clamp: true }
  );

  // Enhanced header animations with better timing
  const headerOpacity = useTransform(scrollYProgress, 
    [0.05, 0.15, 0.75, 0.85], 
    [0, 1, 1, 0], 
    { clamp: true }
  );
  const headerY = useTransform(scrollYProgress, 
    [0.05, 0.15, 0.75, 0.85], 
    [20, 0, 0, -20], 
    { clamp: true }
  );
  const headerScale = useTransform(scrollYProgress, 
    [0.05, 0.15, 0.75, 0.85], 
    [0.98, 1, 1, 0.98], 
    { clamp: true }
  );

  // Enhanced features grid animations
  const gridOpacity = useTransform(scrollYProgress, 
    [0.15, 0.25, 0.65, 0.75], 
    [0, 1, 1, 0], 
    { clamp: true }
  );
  const gridY = useTransform(scrollYProgress, 
    [0.15, 0.25, 0.65, 0.75], 
    [30, 0, 0, -30], 
    { clamp: true }
  );
  const gridScale = useTransform(scrollYProgress, 
    [0.15, 0.25, 0.65, 0.75], 
    [0.98, 1, 1, 0.98], 
    { clamp: true }
  );

  // Enhanced CTA animations
  const ctaOpacity = useTransform(scrollYProgress, 
    [0.25, 0.35, 0.55, 0.65], 
    [0, 1, 1, 0], 
    { clamp: true }
  );
  const ctaY = useTransform(scrollYProgress, 
    [0.25, 0.35, 0.55, 0.65], 
    [20, 0, 0, -20], 
    { clamp: true }
  );
  const ctaScale = useTransform(scrollYProgress, 
    [0.25, 0.35, 0.55, 0.65], 
    [0.98, 1, 1, 0.98], 
    { clamp: true }
  );

  const features = [
    {
      icon: Eye,
      title: "Visual Debugger",
      description: "Step through your code with real-time visualizations. Watch variables change and understand execution flow intuitively.",
      image: "https://images.pexels.com/photos/16053029/pexels-photo-16053029.jpeg",
      delay: 0.1
    },
    {
      icon: Brain,
      title: "AI Assistant",
      description: "Get instant explanations, code suggestions, and personalized learning paths powered by advanced AI technology.",
      image: "https://images.pexels.com/photos/8728559/pexels-photo-8728559.jpeg",
      delay: 0.2
    },
    {
      icon: Share2,
      title: "Interactive Algorithms",
      description: "Explore sorting, searching, graph algorithms, and data structures through immersive interactive experiences.",
      image: "https://images.unsplash.com/photo-1660165458059-57cfb6cc87e5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxhbGdvcml0aG0lMjB2aXN1YWxpemF0aW9ufGVufDB8fHxibHVlfDE3NDg0OTYxNDB8MA&ixlib=rb-4.1.0&q=85",
      delay: 0.3
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description: "Code in Python, Java, C++, JavaScript, and more. Switch between languages seamlessly while learning core concepts.",
      image: "https://images.unsplash.com/photo-1710244182004-1c708b3f146d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwzfHxhbGdvcml0aG0lMjB2aXN1YWxpemF0aW9ufGVufDB8fHxibHVlfDE3NDg0OTYxNDB8MA&ixlib=rb-4.1.0&q=85",
      delay: 0.4
    },
    {
      icon: BookOpen,
      title: "Structured Learning",
      description: "Follow curated learning paths designed by experts. Progress from basics to advanced topics systematically.",
      image: "https://images.pexels.com/photos/3889053/pexels-photo-3889053.jpeg",
      delay: 0.5
    },
    {
      icon: Zap,
      title: "Performance Analytics",
      description: "Track your progress, identify weak areas, and get personalized recommendations for improvement.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwZWR1Y2F0aW9ufGVufDB8fHxibHVlfDE3NDg0OTYxNTV8MA&ixlib=rb-4.1.0&q=85",
      delay: 0.6
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Enhanced card variants with better timing
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        mass: 1,
        duration: 0.8,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  // Enhanced hover animations with magnetic effect
  const hoverVariants = {
    hover: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 1
      }
    }
  };

  // Enhanced content hover animations
  const contentHoverVariants = {
    hover: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.8
      }
    }
  };

  // Add cursor tracking for interactive borders
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [tagMousePosition, setTagMousePosition] = useState({ x: 0, y: 0 });
  const [tagRotation, setTagRotation] = useState({ x: 0, y: 0 });

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
    sr.reveal(headerRef.current, {
      delay: 200,
      distance: '40px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'top'
    });

    sr.reveal(gridRef.current, {
      delay: 400,
      distance: '60px',
      duration: 1000,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom',
      interval: 100
    });

    sr.reveal(ctaRef.current, {
      delay: 600,
      distance: '40px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom'
    });

    return () => {
      sr.destroy();
    };
  }, []);

  const handleMouseMove = (e, index) => {
    if (!isHovering) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    setActiveCard(index);
  };

  const handleMouseEnter = (index) => {
    setIsHovering(true);
    setActiveCard(index);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setActiveCard(null);
  };

  const handleTagMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    setTagRotation({ x: rotateX, y: rotateY });
  };

  const handleTagMouseLeave = () => {
    setTagRotation({ x: 0, y: 0 });
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative min-h-screen py-24 bg-gradient-to-b from-navy-950 to-navy-900 overflow-hidden"
      style={{ 
        perspective: "1000px",
        opacity: sectionOpacity,
        y: sectionY,
        scale: sectionScale,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Enhanced Background Effects */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(124, 124, 243, 0.15), transparent 70%)",
          opacity: useTransform(scrollYProgress, 
            [0, 0.05, 0.95, 1], 
            [0, 1, 1, 0], 
            { clamp: true }
          ),
          transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Enhanced Grid Pattern */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(124, 124, 243, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 124, 243, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          transform: useTransform(scrollYProgress, 
            [0, 1], 
            ['translateY(0px)', 'translateY(-40px)'],
            { clamp: true }
          ),
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Enhanced Section Header */}
        <motion.div
          ref={headerRef}
          style={{ 
            opacity: headerOpacity,
            y: headerY,
            scale: headerScale,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              ease: [0.4, 0, 0.2, 1]
            }}
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
              scale: 1.02,
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
                  scale: 1.3,
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
                  scale: 1.05,
                  textShadow: "0 0 15px rgba(124, 124, 243, 0.5)",
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    mass: 0.8
                  }
                }}
              >
                Powerful Features
              </motion.span>

              <motion.div
                className="w-2 h-2 bg-emerald-400 rounded-full"
                style={{
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: `translateZ(30px) rotateX(${tagRotation.x * 0.3}deg) rotateY(${tagRotation.y * 0.3}deg)`
                }}
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
                  ease: [0.4, 0, 0.2, 1]
                }}
                whileHover={{
                  scale: 1.5,
                  boxShadow: "0 0 20px rgba(16, 185, 129, 0.8)",
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    mass: 0.8
                  }
                }}
              />
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

          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <motion.span 
              className="text-slate-100"
              style={{
                opacity: useTransform(scrollYProgress, [0, 0.1], [0, 1], {
                  clamp: true
                }),
                y: useTransform(scrollYProgress, [0, 0.1], [20, 0], {
                  clamp: true
                })
              }}
            >
              Everything You Need to
            </motion.span>
            <br />
            <motion.span 
              className="gradient-text"
              style={{
                opacity: useTransform(scrollYProgress, [0.05, 0.15], [0, 1], {
                  clamp: true
                }),
                y: useTransform(scrollYProgress, [0.05, 0.15], [20, 0], {
                  clamp: true
                })
              }}
            >
              Excel in Programming
            </motion.span>
          </h2>

          <motion.p 
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
            style={{
              opacity: useTransform(scrollYProgress, [0.1, 0.2], [0, 1], {
                clamp: true
              }),
              y: useTransform(scrollYProgress, [0.1, 0.2], [20, 0], {
                clamp: true
              })
            }}
          >
            Comprehensive tools and features designed to accelerate your learning journey 
            and help you master complex programming concepts with confidence.
          </motion.p>
        </motion.div>

        {/* Enhanced Features Grid */}
        <motion.div
          ref={gridRef}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          style={{
            opacity: gridOpacity,
            y: gridY,
            scale: gridScale,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="group relative"
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                variants={hoverVariants}
                className="relative h-full p-6 rounded-xl bg-gradient-to-b from-slate-900/50 to-slate-900/30 backdrop-blur-sm overflow-hidden"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform"
                }}
              >
                {/* Interactive Border Container */}
                <div className="absolute inset-0 rounded-xl pointer-events-none">
                  {/* Base Border */}
                  <div className="absolute inset-0 rounded-xl" />
                  
                  {/* Interactive Border Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{
                      border: '1px solid transparent',
                      background: 'transparent',
                      maskImage: activeCard === index && isHovering ? `
                        radial-gradient(
                          200px circle at ${mousePosition.x}px ${mousePosition.y}px,
                          black 20%,
                          transparent 80%
                        )
                      ` : 'none',
                      WebkitMaskImage: activeCard === index && isHovering ? `
                        radial-gradient(
                          200px circle at ${mousePosition.x}px ${mousePosition.y}px,
                          black 20%,
                          transparent 80%
                        )
                      ` : 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-xl border border-blue-400/50"
                      style={{
                        boxShadow: activeCard === index && isHovering ? '0 0 15px rgba(124, 124, 243, 0.3)' : 'none',
                        opacity: activeCard === index && isHovering ? 1 : 0,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </motion.div>
                </div>

                {/* Enhanced Background Effects */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: "radial-gradient(circle at 50% 0%, rgba(124, 124, 243, 0.1), transparent 70%)",
                    transform: "translateZ(-10px)"
                  }}
                  animate={{
                    background: [
                      "radial-gradient(circle at 50% 0%, rgba(124, 124, 243, 0.1), transparent 70%)",
                      "radial-gradient(circle at 50% 0%, rgba(124, 124, 243, 0.15), transparent 70%)",
                      "radial-gradient(circle at 50% 0%, rgba(124, 124, 243, 0.1), transparent 70%)"
                    ]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />

                {/* Enhanced Content Layout */}
                <div 
                  className="relative z-10 space-y-4"
                  style={{
                    transform: "translateZ(20px)"
                  }}
                >
                  {/* Enhanced Icon Container */}
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-2.5"
                    whileHover={{
                      scale: 1.05,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                        mass: 0.8
                      }
                    }}
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, 0]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      whileHover={{
                        scale: 1.1,
                        rotate: 5,
                        transition: {
                          type: "spring",
                          stiffness: 400,
                          damping: 15,
                          mass: 0.8
                        }
                      }}
                  >
                      <feature.icon className="w-full h-full text-blue-400" />
                    </motion.div>
                  </motion.div>

                  {/* Enhanced Title & Description */}
                  <motion.div 
                    variants={contentHoverVariants}
                    className="space-y-2"
                  >
                    <motion.h3 
                      className="text-xl font-semibold text-slate-100"
                      whileHover={{
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          mass: 0.8
                        }
                      }}
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-slate-400 leading-relaxed"
                      whileHover={{
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          mass: 0.8
                        }
                      }}
                    >
                      {feature.description}
                    </motion.p>
                  </motion.div>

                  {/* Enhanced Interactive CTA */}
                  <motion.div
                    className="flex items-center gap-2 text-sm font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-500 cursor-pointer"
                  >
                    <span>
                      Learn More
                    </span>
                  </motion.div>
                </div>

                {/* Enhanced Hover Effects */}
                <motion.div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: "linear-gradient(to bottom right, rgba(124, 124, 243, 0.05), transparent, rgba(16, 185, 129, 0.05))"
                  }}
                  whileHover={{
                    scale: 1.02,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      mass: 1
                    }
                  }}
                  animate={{
                    background: [
                      "linear-gradient(to bottom right, rgba(124, 124, 243, 0.05), transparent, rgba(16, 185, 129, 0.05))",
                      "linear-gradient(to bottom right, rgba(16, 185, 129, 0.05), transparent, rgba(124, 124, 243, 0.05))",
                      "linear-gradient(to bottom right, rgba(124, 124, 243, 0.05), transparent, rgba(16, 185, 129, 0.05))"
                    ]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />

                {/* Enhanced Corner Accents */}
                <motion.div
                  className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(circle at top right, rgba(124, 124, 243, 0.1), transparent 70%)"
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: "radial-gradient(circle at bottom left, rgba(16, 185, 129, 0.1), transparent 70%)"
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.2, 1],
                    delay: 1.5
                  }}
                />

                {/* Enhanced Border Effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl border border-transparent"
                  whileHover={{
                    borderColor: "rgba(124, 124, 243, 0.2)",
                    boxShadow: "0 0 20px rgba(124, 124, 243, 0.1)",
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      mass: 1
                    }
                  }}
                />

                {/* Enhanced Floating Particles */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: `${Math.random() * 2 + 1}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      background: `rgba(124, 124, 243, ${Math.random() * 0.2 + 0.1})`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      willChange: "transform"
                    }}
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.1, 0.2, 0.1],
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
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Bottom CTA Section */}
        <motion.div
          ref={ctaRef}
          style={{
            opacity: ctaOpacity,
            y: ctaY,
            scale: ctaScale,
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="text-center mt-16"
        >
          <motion.button
            className="relative group px-8 py-4 rounded-xl font-medium text-slate-100"
            style={{
              background: "rgba(15, 23, 42, 0.3)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(124, 124, 243, 0.1)",
              transition: "all 0.3s ease"
            }}
            whileHover={{
              scale: 1.02,
              borderColor: "rgba(124, 124, 243, 0.3)",
              boxShadow: "0 0 20px rgba(124, 124, 243, 0.1)",
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-slate-100 group-hover:text-blue-300 transition-colors duration-300">
            Explore All Features
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;