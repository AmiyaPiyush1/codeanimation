import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Brain, Share2, Globe, BookOpen, Zap, ArrowRight, Sparkles } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const Features = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const ctaRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  // Add cursor tracking for interactive borders
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeCard, setActiveCard] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [tagMousePosition, setTagMousePosition] = useState({ x: 0, y: 0 });
  const [tagRotation, setTagRotation] = useState({ x: 0, y: 0 });

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

    // Enhanced Features grid animations with staggered effect
    sr.reveal(gridRef.current, {
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
      className="relative min-h-screen py-20 bg-gradient-to-b from-navy-950 to-navy-900 overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(circle at 50% 0%, rgba(124, 124, 243, 0.1), transparent 70%)"
        }} />
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `
            linear-gradient(rgba(124, 124, 243, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 124, 243, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
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
                Powerful Features
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
              <span className="relative z-10">Powerful</span>
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
                Features
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
            Discover the tools and features that make learning algorithms and data structures engaging and effective.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div ref={gridRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              style={{
                transformStyle: "preserve-3d",
                perspective: "1000px",
                willChange: 'transform'
              }}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                className="relative h-full p-6 rounded-xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                  transformStyle: "preserve-3d",
                  willChange: "transform"
                }}
                whileHover={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.25), rgba(30, 41, 59, 0.25))",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.05), inset 0 0 15px rgba(255, 255, 255, 0.04)",
                  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
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
                    className="w-12 h-12 rounded-lg p-2.5"
                    style={{
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))",
                      border: "1px solid rgba(59, 130, 246, 0.1)",
                      backdropFilter: "blur(4px)",
                      WebkitBackdropFilter: "blur(4px)"
                    }}
                    whileHover={{
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))",
                      borderColor: "rgba(59, 130, 246, 0.2)",
                      boxShadow: "0 0 15px rgba(59, 130, 246, 0.1)",
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
                    whileHover={{
                      x: 4,
                      transition: {
                        type: "spring",
                        stiffness: 400,
                        damping: 15,
                        mass: 0.8
                      }
                    }}
                  >
                    <span>Learn More</span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>

                {/* Enhanced Hover Effects */}
                <motion.div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: "linear-gradient(to bottom right, rgba(124, 124, 243, 0.05), transparent, rgba(16, 185, 129, 0.05))"
                  }}
                  whileHover={{
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
        </div>

        {/* Bottom CTA Section */}
        <div ref={ctaRef} className="text-center mt-16">
          <motion.button
            className="relative group px-8 py-4 rounded-xl font-medium text-slate-100"
            style={{
              background: "rgba(15, 23, 42, 0.3)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(124, 124, 243, 0.1)",
              transition: "all 0.3s ease"
            }}
            whileHover={{
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
        </div>
      </div>
    </section>
  );
};

export default Features;