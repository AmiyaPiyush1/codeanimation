import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    const initParticles = () => {
      particles.current = [];
      const numParticles = Math.min(40, Math.floor((width * height) / 20000));
      
      for (let i = 0; i < numParticles; i++) {
        particles.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.3 + 0.1,
          color: i % 3 === 0 ? '124, 124, 243' : i % 3 === 1 ? '34, 211, 238' : '159, 122, 234',
          baseSize: Math.random() * 1.5 + 0.5,
          baseOpacity: Math.random() * 0.3 + 0.1,
        });
      }
    };

    const drawParticle = (particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
      ctx.fill();
      
      // Subtle glow effect
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${particle.color}, ${particle.opacity * 0.5})`;
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const p1 = particles.current[i];
          const p2 = particles.current[j];
          const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          
          if (distance < 150) {
            const opacity = (150 - distance) / 150 * 0.08;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(124, 124, 243, ${opacity})`;
            ctx.lineWidth = 0.3;
            ctx.stroke();
          }
        }
      }
    };

    const updateParticles = () => {
      particles.current.forEach(particle => {
        // Mouse interaction with smoother response
        const dx = mousePos.current.x - particle.x;
        const dy = mousePos.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          const force = Math.pow((150 - distance) / 150, 2);
          particle.vx += dx * force * 0.00005;
          particle.vy += dy * force * 0.00005;
          
          // Subtle size and opacity changes
          particle.size = particle.baseSize * (1 + force * 0.5);
          particle.opacity = particle.baseOpacity * (1 + force * 0.3);
        } else {
          // Smooth return to base values
          particle.size += (particle.baseSize - particle.size) * 0.1;
          particle.opacity += (particle.baseOpacity - particle.opacity) * 0.1;
        }
        
        // Update position with smoother movement
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary conditions with smooth bounce
        if (particle.x < 0 || particle.x > width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(width, particle.x));
        }
        if (particle.y < 0 || particle.y > height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(height, particle.y));
        }
        
        // Add slight drift back to center with damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.shadowBlur = 0;
      
      updateParticles();
      drawConnections();
      
      particles.current.forEach(drawParticle);
      
      animationId.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    // Initialize
    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return (
    <>
      {/* Canvas for interactive particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-1"
        style={{ opacity: 0.4 }}
      />
      
      {/* Static floating particles with enhanced animations */}
      <div className="fixed inset-0 pointer-events-none z-2">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              background: `rgba(${
                i % 3 === 0 ? '124, 124, 243' : 
                i % 3 === 1 ? '34, 211, 238' : 
                '159, 122, 234'
              }, ${Math.random() * 0.2 + 0.1})`,
              boxShadow: `0 0 ${Math.random() * 4 + 2}px rgba(${
                i % 3 === 0 ? '124, 124, 243' : 
                i % 3 === 1 ? '34, 211, 238' : 
                '159, 122, 234'
              }, ${Math.random() * 0.2 + 0.1})`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 10 - 5, 0],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 6 + 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default InteractiveBackground;