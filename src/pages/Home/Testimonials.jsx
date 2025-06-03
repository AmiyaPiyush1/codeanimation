import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Users, Award, TrendingUp, CheckCircle } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const Testimonials = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
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

    // Enhanced Testimonials grid animations with staggered effect
    sr.reveal(testimonialsRef.current, {
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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      company: "Stanford University",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9f23f9b?w=150&h=150&fit=crop&crop=face",
      content: "CodeStream transformed my understanding of algorithms. The visual debugging feature made complex concepts like dynamic programming finally click.",
      rating: 5,
      impact: "Improved test scores by 40%"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      company: "Google",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "The AI tutor helped me understand the 'why' behind each algorithm. CodeStream was instrumental in landing my dream job at Google.",
      rating: 5,
      impact: "Landed job at Google"
    },
    {
      name: "Emily Wang",
      role: "Bootcamp Graduate",
      company: "Self-taught Developer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Coming from a non-CS background, CodeStream made algorithms accessible. The step-by-step visualizations are incredibly intuitive.",
      rating: 5,
      impact: "Mastered DSA in 3 months"
    },
    {
      name: "David Kim",
      role: "Teaching Assistant",
      company: "MIT",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "I use CodeStream in my algorithm classes. Students grasp complex concepts 3x faster with the interactive visualizations.",
      rating: 5,
      impact: "3x faster learning"
    },
    {
      name: "Alex Thompson",
      role: "Senior Developer",
      company: "Microsoft",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      content: "The AI explanations are incredibly detailed and accurate. It's like having a personal algorithms tutor available 24/7.",
      rating: 5,
      impact: "Promoted to Senior Dev"
    },
    {
      name: "Lisa Johnson",
      role: "Full Stack Developer",
      company: "Tech Startup",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      content: "CodeStream helped optimize our core algorithms. The performance insights and suggestions saved significant server costs.",
      rating: 5,
      impact: "Reduced costs by 60%"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Learners", icon: Users, color: "text-blue-400" },
    { number: "98%", label: "Success Rate", icon: Award, color: "text-emerald-400" },
    { number: "4.9/5", label: "Average Rating", icon: Star, color: "text-yellow-400" },
  ];

  return (
    <section ref={sectionRef} className="relative py-20 bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
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
                <Quote className="w-5 h-5 text-blue-400" />
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
                Testimonials
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
              <span className="relative z-10">Success Stories</span>
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
                From Our Students
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
            Hear from our students who have transformed their careers through our interactive learning platform.
          </motion.p>
        </div>

        {/* Professional Stats */}
        <div ref={statsRef} className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 glass-pro rounded-2xl border border-slate-700/50 hover:border-blue-500/30 interactive-card transition-all duration-300 ease-in-out"
              style={{
                background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                transition: "all 0.3s ease-in-out"
              }}
            >
              <motion.div
                whileHover={{ rotate: 3, scale: 1.05 }}
                className={`w-14 h-14 mx-auto mb-4 rounded-2xl p-3 ${stat.color} shadow-soft`}
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                  transition: "all 0.3s ease-in-out"
                }}
              >
                <stat.icon className="w-full h-full" />
              </motion.div>
              <div className="text-2xl font-bold text-slate-100 mb-2">{stat.number}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Professional Testimonials Grid */}
        <div ref={testimonialsRef} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="relative h-full"
            >
              {/* Professional Testimonial Card */}
              <div 
                className="relative h-full p-8 glass-pro rounded-2xl border border-slate-700/50 interactive-card overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                  transition: "all 0.3s ease-in-out"
                }}
              >
                {/* Professional Quote Icon */}
                <div
                  className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(16, 185, 129, 0.2))",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                    transition: "all 0.3s ease-in-out"
                  }}
                >
                  <Quote className="w-5 h-5 text-blue-400" />
                </div>

                <div className="space-y-6">
                  {/* Professional Rating */}
                  <div className="flex gap-1.5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <div
                        key={i}
                        className="transform transition-transform duration-200"
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </div>
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <p className="text-slate-300 leading-relaxed text-lg font-medium">
                    "{testimonial.content}"
                  </p>

                  {/* Professional Impact Badge */}
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20"
                    style={{
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      transition: "all 0.3s ease-in-out"
                    }}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                      {testimonial.impact}
                    </span>
                  </div>

                  {/* Professional Profile */}
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-700/50">
                    <div className="relative">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/30"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-100 text-lg mb-1">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-400 mb-1">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-blue-400 font-medium truncate">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Professional Bottom CTA */}
        <div ref={ctaRef} className="text-center mt-16">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary px-8 py-4 rounded-xl font-semibold interactive-element"
            style={{
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)",
              transition: "all 0.3s ease-in-out"
            }}
          >
            Join the CodeStream Community
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;