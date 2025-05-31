import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Hero from './Hero';
import Features from './Features';
import './Home.css';
import HowItWorks from './HowItWorks';
import InteractiveDemo from './InteractiveDemo';
import Testimonials from './Testimonials';
import InteractiveBackground from './InteractiveBackground';

const CodeStreamLanding = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Ultra-modern parallax effects with error handling
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'], {
    clamp: true
  });
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6], {
    clamp: true
  });

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
      
      {/* Ultra-Modern Dynamic Background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ 
          y: backgroundY, 
          opacity: backgroundOpacity,
          willChange: 'transform, opacity'
        }}
      >
        {/* Animated Mesh Gradient */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0%, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.2) 0%, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.2) 0%, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 0.3) 0%, transparent 50%)',
            animation: 'gradient-shift 20s ease-in-out infinite'
          }}
        />
        
        {/* Neural Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{
               backgroundImage: `
                 linear-gradient(rgba(124, 124, 243, 0.4) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(124, 124, 243, 0.4) 1px, transparent 1px)
               `,
               backgroundSize: '80px 80px',
               animation: 'float-subtle 15s ease-in-out infinite'
             }} 
        />
        
        {/* Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full morph-shape`}
              style={{
                left: `${10 + i * 8}%`,
                top: `${15 + (i % 3) * 25}%`,
                width: `${80 + i * 15}px`,
                height: `${80 + i * 15}px`,
                background: `radial-gradient(circle, ${
                  i % 3 === 0 ? 'rgba(124, 124, 243, 0.1)' :
                  i % 3 === 1 ? 'rgba(34, 211, 238, 0.08)' :
                  'rgba(159, 122, 234, 0.06)'
                } 0%, transparent 70%)`,
              }}
              animate={{
                x: [0, 30, -20, 0],
                y: [0, -20, 30, 0],
                scale: [1, 1.1, 0.9, 1],
                rotate: [0, 120, 240, 360],
              }}
              transition={{
                duration: 25 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 2,
              }}
            />
          ))}
        </div>

        {/* Dynamic Accent Shapes */}
        <motion.div 
          className="absolute top-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(124, 124, 243, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div 
          className="absolute bottom-40 left-40 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.12) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
        />
      </motion.div>

      {/* Neural Network Background Lines */}
      <div className="fixed inset-0 pointer-events-none z-1">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="neural-line"
            style={{
              top: `${5 + i * 7}%`,
              left: '-50%',
              width: '200%',
              transform: `rotate(${-30 + i * 12}deg)`,
            }}
            animate={{
              opacity: [0, 0.4, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 6,
              delay: i * 0.8,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

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

      {/* Immersive Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none z-5">
        {/* Vignette Effect */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(15, 23, 42, 0.4) 100%)'
          }}
        />
        
        {/* Film Grain Texture */}
        <div 
          className="absolute inset-0 opacity-[0.02] mix-blend-mode-screen"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
          }}
        />
      </div>
    </div>
  );
};

export default CodeStreamLanding;