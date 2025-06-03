import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Hero from './Hero';
import Features from './Features';
import './Home.css';
import HowItWorks from './HowItWorks';
import InteractiveDemo from './InteractiveDemo';
import Testimonials from './Testimonials';
import InteractiveBackground from './InteractiveBackground';
import ScrollReveal from 'scrollreveal';

const CodeStreamLanding = () => {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const interactiveDemoRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Enhanced parallax effects with smoother transitions
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'], {
    clamp: true
  });
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.9, 0.8], {
    clamp: true
  });
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1], {
    clamp: true
  });

  // Memoize background elements with enhanced animations
  const backgroundElements = useMemo(() => (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        y: backgroundY, 
        opacity: backgroundOpacity,
        scale: backgroundScale,
        willChange: 'transform, opacity, scale'
      }}
    >
      {/* Simplified Animated Mesh Gradient */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          background: 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.2) 0%, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.15) 0%, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.15) 0%, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.2) 0%, transparent 50%)',
          animation: 'gradient-shift 30s ease-in-out infinite'
        }}
      />
      
      {/* Simplified Neural Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(124, 124, 243, 0.3) 1px, transparent 1px),
               linear-gradient(90deg, rgba(124, 124, 243, 0.3) 1px, transparent 1px)
             `,
             backgroundSize: '100px 100px',
             animation: 'float-subtle 20s ease-in-out infinite'
           }} 
      />
      
      {/* Optimized Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full morph-shape`}
            style={{
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 3) * 30}%`,
              width: `${60 + i * 10}px`,
              height: `${60 + i * 10}px`,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(124, 124, 243, 0.08)' :
                i % 3 === 1 ? 'rgba(34, 211, 238, 0.06)' :
                'rgba(159, 122, 234, 0.04)'
              } 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, 20, -15, 0],
              y: [0, -15, 20, 0],
              scale: [1, 1.05, 0.95, 1],
              rotate: [0, 90, 180, 270],
            }}
            transition={{
              duration: 20 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      {/* Simplified Dynamic Accent Shapes */}
      <motion.div 
        className="absolute top-20 right-20 w-72 h-72 rounded-full blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(124, 124, 243, 0.12) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div 
        className="absolute bottom-40 left-40 w-64 h-64 rounded-full blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.35, 0.15],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </motion.div>
  ), [backgroundY, backgroundOpacity, backgroundScale]);

  // Memoize neural network lines
  const neuralLines = useMemo(() => (
    <div className="fixed inset-0 pointer-events-none z-1">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="neural-line"
          style={{
            top: `${5 + i * 10}%`,
            left: '-50%',
            width: '200%',
            transform: `rotate(${-30 + i * 15}deg)`,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            scaleX: [0, 1, 0],
          }}
          transition={{
            duration: 8,
            delay: i * 1,
            repeat: Infinity,
            repeatDelay: 6,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  ), []);

  // Memoize overlay effects
  const overlayEffects = useMemo(() => (
    <div className="fixed inset-0 pointer-events-none z-5">
      {/* Simplified Vignette Effect */}
      <div 
        className="absolute inset-0 opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(15, 23, 42, 0.3) 100%)'
        }}
      />
      
      {/* Simplified Film Grain Texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] mix-blend-mode-screen"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
        }}
      />
    </div>
  ), []);

  // Configure ScrollReveal animations
  useEffect(() => {
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '40px',
      duration: 600,
      delay: 0,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reset: false,
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
        el.style.transform = 'translateY(40px) scale(0.98) rotate(1deg)';
      }
    });

    // Header section animations
    sr.reveal(headerRef.current, {
      delay: 0,
      distance: '30px',
      duration: 500,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.98,
      opacity: 0,
      rotate: { x: 5, z: 1 }
    });

    // Hero section animations
    sr.reveal(heroRef.current, {
      delay: 50,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.98,
      opacity: 0,
      rotate: { y: 3, z: 1 }
    });

    // Features section animations
    sr.reveal(featuresRef.current, {
      delay: 100,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.98,
      opacity: 0,
      rotate: { y: 3, z: 1 }
    });

    // How It Works section animations
    sr.reveal(howItWorksRef.current, {
      delay: 150,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.98,
      opacity: 0,
      rotate: { y: 3, z: 1 }
    });

    // Interactive Demo section animations
    sr.reveal(interactiveDemoRef.current, {
      delay: 200,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.98,
      opacity: 0,
      rotate: { y: 3, z: 1 }
    });

    // Testimonials section animations
    sr.reveal(testimonialsRef.current, {
      delay: 250,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.98,
      opacity: 0,
      rotate: { y: 3, z: 1 }
    });

    // CTA section animations
    sr.reveal(ctaRef.current, {
      delay: 300,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.98,
      opacity: 0,
      rotate: { y: 3, z: 1 }
    });

    return () => {
      sr.destroy();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full min-h-screen bg-navy-950 text-slate-50 overflow-x-hidden landing-container"
      style={{ 
        position: 'relative',
        height: 'auto',
        overflowY: 'auto'
      }}
    >
      {/* Interactive Background */}
      <InteractiveBackground />
      
      {/* Optimized Background Elements */}
      {backgroundElements}

      {/* Optimized Neural Network Lines */}
      {neuralLines}

      {/* Scroll Progress Indicator */}
      <motion.div
        className="scroll-indicator"
        style={{ scaleX: scrollYProgress }}
        initial={{ scaleX: 0 }}
      />

      {/* Main Content */}
      <main className="relative z-10 w-full">
        <Hero />
        <Features />
        <HowItWorks />
        <InteractiveDemo />
        <Testimonials />
      </main>

      {/* Optimized Overlay Effects */}
      {overlayEffects}
    </div>
  );
};

export default CodeStreamLanding;