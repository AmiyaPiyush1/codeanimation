import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExecutionControls = ({
  onFirst,
  onPrev,
  onNext,
  onLast,
  onExecute,
  currentStep = 0,
  debuggedQueue = [],
  isRunning = false,
  isTransitioning = false,
  location = { pathname: '' }
}) => {
  // Calculate progress percentage
  const progress = debuggedQueue.length > 0 
    ? ((currentStep + 1) / debuggedQueue.length) * 100 
    : 0;

  return (
    <motion.div 
      className="flex flex-col gap-3 p-4 rounded-xl bg-slate-900/80 backdrop-blur-lg shadow-[0_0_30px_rgba(0,0,0,0.4)] border border-slate-800/50 w-full"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Controls Container */}
      <div className="flex justify-between items-center gap-3">
        {/* First Button */}
        <motion.button
          className="group relative flex items-center gap-1.5 z-10 px-3 py-1.5
            bg-slate-800/60 text-slate-400 rounded-md cursor-pointer 
            transition-all duration-200 ease-in-out border border-transparent
            hover:border-purple-500/70 hover:text-purple-400 hover:bg-slate-700/60
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:text-slate-400 disabled:hover:bg-slate-800/60
            before:content-[attr(data-tooltip)] before:absolute before:px-2 before:py-1 before:left-1/2 before:-translate-x-1/2 before:-top-8 before:w-max before:max-w-xs before:bg-slate-900 before:text-slate-300 before:text-xs before:rounded before:opacity-0 before:transition-all before:duration-200 before:pointer-events-none before:whitespace-nowrap before:shadow-lg before:border before:border-slate-700/50
            hover:before:opacity-100 hover:before:-translate-y-1"
          onClick={onFirst}
          disabled={currentStep === 0 || isRunning || isTransitioning}
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label="First Step"
          data-tooltip="Go to first step (Ctrl + Home)"
        >
          <motion.div
            className="flex items-center justify-center w-4 h-4"
            whileHover={{ rotate: -5 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-back">
              <title>First Step</title>
              <polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/>
            </svg>
          </motion.div>
          <span className="text-xs font-semibold">First</span>
        </motion.button>

        {/* Prev Button */}
        <motion.button
          className="group relative flex items-center gap-1.5 z-10 px-3 py-1.5
            bg-slate-800/60 text-slate-400 rounded-md cursor-pointer 
            transition-all duration-200 ease-in-out border border-transparent
            hover:border-purple-500/70 hover:text-purple-400 hover:bg-slate-700/60
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:text-slate-400 disabled:hover:bg-slate-800/60
            before:content-[attr(data-tooltip)] before:absolute before:px-2 before:py-1 before:left-1/2 before:-translate-x-1/2 before:-top-8 before:w-max before:max-w-xs before:bg-slate-900 before:text-slate-300 before:text-xs before:rounded before:opacity-0 before:transition-all before:duration-200 before:pointer-events-none before:whitespace-nowrap before:shadow-lg before:border before:border-slate-700/50
            hover:before:opacity-100 hover:before:-translate-y-1"
          onClick={onPrev}
          disabled={currentStep === 0 || isRunning || isTransitioning}
          whileHover={{ scale: 1.05, translateX: -3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label="Previous Step"
          data-tooltip="Go to previous step (Ctrl + ←)"
        >
          <motion.div
            className="flex items-center justify-center w-4 h-4"
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
              <title>Previous Step</title>
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </motion.div>
          <span className="text-xs font-semibold">Prev</span>
        </motion.button>

        {/* Execute/Pause Button */}
        <motion.button
          className="group relative flex items-center gap-1.5 z-10 px-3.5 py-1.5
            rounded-md cursor-pointer text-white border border-transparent
            transition-all duration-300 ease-in-out
            bg-gradient-to-r from-purple-600/90 to-purple-500/90 hover:from-purple-500 hover:to-purple-400
            disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:hover:border-transparent
            shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]
            before:content-[attr(data-tooltip)] before:absolute before:px-2 before:py-1 before:left-1/2 before:-translate-x-1/2 before:-top-8 before:w-max before:max-w-xs before:bg-slate-900 before:text-slate-300 before:text-xs before:rounded before:opacity-0 before:transition-all before:duration-200 before:pointer-events-none before:whitespace-nowrap before:shadow-lg before:border before:border-slate-700/50
            hover:before:opacity-100 hover:before:-translate-y-1
            after:content-[''] after:absolute after:inset-0 after:rounded-md after:bg-gradient-to-r after:from-purple-400/20 after:to-purple-300/20 after:opacity-0 after:transition-opacity after:duration-300
            hover:after:opacity-100"
          onClick={onExecute}
          disabled={isTransitioning}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label={isRunning ? 'Pause Execution' : 'Run Code'}
          data-tooltip={isRunning ? 'Pause execution (Ctrl + Enter)' : 'Run code (Ctrl + Enter)'}
        >
          <AnimatePresence mode="wait">
            {isRunning ? (
              <motion.div 
                key="pause"
                className="flex items-center justify-center w-4 h-4" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.1 }} 
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 15
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="lucide lucide-pause"
                >
                  <title>Pause Execution</title>
                  <rect width="3" height="14" x="7" y="5" rx="1"/>
                  <rect width="3" height="14" x="14" y="5" rx="1"/>
                </svg>
              </motion.div>
            ) : (
              <motion.div 
                key="play"
                className="flex items-center justify-center w-4 h-4" 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1.1 }} 
                transition={{ 
                  type: "spring",
                  stiffness: 500,
                  damping: 15
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="lucide lucide-play"
                >
                  <title>Run Code</title>
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.span 
            className="text-xs font-semibold"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {isRunning ? 'Pause' : 'Run'}
          </motion.span>
        </motion.button>

        {/* Next Button */}
        <motion.button
          className="group relative flex items-center gap-1.5 z-10 px-3 py-1.5
            bg-slate-800/60 text-slate-400 rounded-md cursor-pointer 
            transition-all duration-200 ease-in-out border border-transparent
            hover:border-purple-500/70 hover:text-purple-400 hover:bg-slate-700/60
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:text-slate-400 disabled:hover:bg-slate-800/60
            before:content-[attr(data-tooltip)] before:absolute before:px-2 before:py-1 before:left-1/2 before:-translate-x-1/2 before:-top-8 before:w-max before:max-w-xs before:bg-slate-900 before:text-slate-300 before:text-xs before:rounded before:opacity-0 before:transition-all before:duration-200 before:pointer-events-none before:whitespace-nowrap before:shadow-lg before:border before:border-slate-700/50
            hover:before:opacity-100 hover:before:-translate-y-1"
          onClick={onNext}
          disabled={!debuggedQueue || currentStep === debuggedQueue.length - 1 || isRunning || isTransitioning}
          whileHover={{ scale: 1.05, translateX: 3 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label="Next Step"
          data-tooltip="Go to next step (Ctrl + →)"
        >
          <motion.div
            className="flex items-center justify-center w-4 h-4"
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
              <title>Next Step</title>
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </motion.div>
          <span className="text-xs font-semibold">Next</span>
        </motion.button>

        {/* Last Button */}
        <motion.button
          className="group relative flex items-center gap-1.5 z-10 px-3 py-1.5
            bg-slate-800/60 text-slate-400 rounded-md cursor-pointer 
            transition-all duration-200 ease-in-out border border-transparent
            hover:border-purple-500/70 hover:text-purple-400 hover:bg-slate-700/60
            disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:text-slate-400 disabled:hover:bg-slate-800/60
            before:content-[attr(data-tooltip)] before:absolute before:px-2 before:py-1 before:left-1/2 before:-translate-x-1/2 before:-top-8 before:w-max before:max-w-xs before:bg-slate-900 before:text-slate-300 before:text-xs before:rounded before:opacity-0 before:transition-all before:duration-200 before:pointer-events-none before:whitespace-nowrap before:shadow-lg before:border before:border-slate-700/50
            hover:before:opacity-100 hover:before:-translate-y-1"
          onClick={onLast}
          disabled={!debuggedQueue || currentStep === debuggedQueue.length - 1 || isRunning || isTransitioning}
          whileHover={{ scale: 1.05, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          aria-label="Last Step"
          data-tooltip="Go to last step (Ctrl + End)"
        >
          <motion.div
            className="flex items-center justify-center w-4 h-4"
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-forward">
              <title>Last Step</title>
              <polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>
            </svg>
          </motion.div>
          <span className="text-xs font-semibold">Last</span>
        </motion.button>
      </div>

      {/* Progress Text */}
      <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
        <span>Step {currentStep + 1} of {debuggedQueue.length}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
    </motion.div>
  );
};

export default ExecutionControls;