import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <div style={{ 
      backgroundColor: '#020517',
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(2, 5, 23, 0.7) 0%, rgba(2, 5, 23, 0.5) 50%, rgba(2, 5, 23, 0.7) 100%)',
        zIndex: 10,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}></div>
    <motion.div
        initial={{ 
          opacity: 0,
          y: 20,
          scale: 0.95,
          filter: 'blur(10px)'
        }}
        animate={{ 
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)'
        }}
        exit={{ 
          opacity: 0,
          y: -20,
          scale: 0.95,
          filter: 'blur(10px)'
        }}
      transition={{
          duration: 0.3,
          ease: [0.32, 0.72, 0, 1],
          opacity: { duration: 0.25 },
          y: { duration: 0.3 },
          scale: { duration: 0.3 },
          filter: { duration: 0.2 }
      }}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
          WebkitFontSmoothing: 'antialiased',
          zIndex: 20,
          willChange: 'transform, opacity, filter'
      }}
    >
      {children}
    </motion.div>
    </div>
  );
};

export default PageTransition;