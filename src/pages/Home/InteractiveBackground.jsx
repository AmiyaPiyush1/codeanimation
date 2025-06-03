import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationId = useRef(null);
  const waves = useRef([]);
  const time = useRef(0);

  // Memoize wave configurations
  const waveConfigs = useMemo(() => [
    {
      amplitude: 0.08,
      frequency: 0.002,
      speed: 0.3,
      color: 'rgba(124, 124, 243, 0.12)',
      offset: 0,
      thickness: 1.5
    },
    {
      amplitude: 0.06,
      frequency: 0.003,
      speed: 0.2,
      color: 'rgba(34, 211, 238, 0.1)',
      offset: Math.PI / 2,
      thickness: 1.5
    },
    {
      amplitude: 0.09,
      frequency: 0.0015,
      speed: 0.25,
      color: 'rgba(159, 122, 234, 0.08)',
      offset: Math.PI,
      thickness: 1.5
    }
  ], []);

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
      initWaves();
    };

    const initWaves = () => {
      waves.current = waveConfigs.map(config => ({
        ...config,
        amplitude: height * config.amplitude,
        points: []
      }));
    };

    const drawWave = (wave) => {
      const points = [];
      const segments = 80; // Reduced from 100
      const segmentWidth = width / segments;

      for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth;
        const distanceFromMouse = Math.sqrt(
          Math.pow(x - mousePos.current.x, 2) + 
          Math.pow(height/2 - mousePos.current.y, 2)
        );
        
        const mouseInfluence = Math.max(0, 1 - distanceFromMouse / 400); // Increased from 300
        const y = height/2 + 
          Math.sin(x * wave.frequency + time.current * wave.speed + wave.offset) * 
          wave.amplitude * (1 + mouseInfluence * 0.3); // Reduced from 0.5
        
        points.push({ x, y });
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }

      const gradient = ctx.createLinearGradient(0, height/2 - wave.amplitude, 0, height/2 + wave.amplitude);
      gradient.addColorStop(0, wave.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = wave.thickness;
      ctx.stroke();

      // Reduced glow effect
      ctx.shadowBlur = 10; // Reduced from 20
      ctx.shadowColor = wave.color;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Reduced geometric accents
      points.forEach((point, index) => {
        if (index % 15 === 0) { // Increased from 10
          const size = 3 + Math.sin(time.current + index) * 1.5; // Reduced from 4 and 2
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fillStyle = wave.color;
          ctx.fill();
        }
      });
    };

    const drawGeometricShapes = () => {
      const shapes = [
        {
          type: 'triangle',
          x: width * 0.2,
          y: height * 0.3,
          size: 30, // Reduced from 40
          rotation: time.current * 0.15, // Reduced from 0.2
          color: 'rgba(124, 124, 243, 0.08)' // Reduced opacity
        },
        {
          type: 'square',
          x: width * 0.8,
          y: height * 0.7,
          size: 24, // Reduced from 30
          rotation: time.current * -0.1, // Reduced from -0.15
          color: 'rgba(34, 211, 238, 0.08)' // Reduced opacity
        },
        {
          type: 'circle',
          x: width * 0.5,
          y: height * 0.5,
          size: 40, // Reduced from 50
          rotation: 0,
          color: 'rgba(159, 122, 234, 0.08)' // Reduced opacity
        }
      ];

      shapes.forEach(shape => {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        
        const distanceFromMouse = Math.sqrt(
          Math.pow(shape.x - mousePos.current.x, 2) + 
          Math.pow(shape.y - mousePos.current.y, 2)
        );
        const mouseInfluence = Math.max(0, 1 - distanceFromMouse / 500); // Increased from 400
        
        ctx.scale(1 + mouseInfluence * 0.15, 1 + mouseInfluence * 0.15); // Reduced from 0.2

        switch(shape.type) {
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(0, -shape.size);
            ctx.lineTo(shape.size, shape.size);
            ctx.lineTo(-shape.size, shape.size);
            break;
          case 'square':
            ctx.beginPath();
            ctx.rect(-shape.size/2, -shape.size/2, shape.size, shape.size);
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(0, 0, shape.size/2, 0, Math.PI * 2);
            break;
        }

        ctx.fillStyle = shape.color;
        ctx.fill();
        ctx.restore();
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Simplified background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, 'rgba(15, 23, 42, 0.08)'); // Reduced opacity
      bgGradient.addColorStop(1, 'rgba(15, 23, 42, 0.04)'); // Reduced opacity
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      waves.current.forEach(drawWave);
      drawGeometricShapes();

      time.current += 0.008; // Reduced from 0.01
      animationId.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

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
  }, [waveConfigs]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-1"
        style={{ opacity: 0.7 }} // Reduced from 0.8
      />
      
      <div className="fixed inset-0 pointer-events-none z-2">
        {[...Array(2)].map((_, i) => ( // Reduced from 3
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: '2px',
              height: '2px',
              background: `rgba(${
                i === 0 ? '124, 124, 243' : '34, 211, 238'
              }, 0.4)`, // Reduced opacity
              boxShadow: `0 0 8px rgba(${ // Reduced from 10px
                i === 0 ? '124, 124, 243' : '34, 211, 238'
              }, 0.4)`, // Reduced opacity
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
            }}
            animate={{
              scale: [1, 1.3, 1], // Reduced from 1.5
              opacity: [0.2, 0.4, 0.2], // Reduced from 0.3, 0.6, 0.3
            }}
            transition={{
              duration: 4, // Increased from 3
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8, // Increased from 0.5
            }}
          />
        ))}
      </div>
    </>
  );
};

export default InteractiveBackground;