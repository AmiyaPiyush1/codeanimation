import React from 'react';
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import "./VisualDebuggerBoiler.css";  // Import the existing CSS
import { Slider, Tooltip, Progress } from 'antd';
import { 
  Play, Pause, SkipBack, SkipForward, 
  Maximize2, Minimize2, Share2, Download,
  BarChart2, Cpu, Database, Clock, Info,
  History, Gauge, Layers, BookOpen,
  Share, Settings, Bug, GitCompare,
  FileText, Accessibility
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Utility function for formatting memory sizes
const formatMemory = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Timeline Component
const Timeline = ({ currentStep, totalSteps, onStepChange, markers }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);
  const playbackInterval = React.useRef(null);

  const handleStepChange = (step) => {
    if (typeof step === 'function') {
      const newStep = step(currentStep);
      onStepChange(newStep);
    } else {
      onStepChange(step);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      clearInterval(playbackInterval.current);
    } else {
      playbackInterval.current = setInterval(() => {
        handleStepChange((prevStep) => {
          const nextStep = prevStep + 1;
          if (nextStep >= totalSteps) {
            clearInterval(playbackInterval.current);
            setIsPlaying(false);
            return totalSteps - 1;
          }
          return nextStep;
        });
      }, 1000 / playbackSpeed);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      clearInterval(playbackInterval.current);
      playbackInterval.current = setInterval(() => {
        handleStepChange((prevStep) => {
          const nextStep = prevStep + 1;
          if (nextStep >= totalSteps) {
            clearInterval(playbackInterval.current);
            setIsPlaying(false);
            return totalSteps - 1;
          }
          return nextStep;
        });
      }, 1000 / speed);
    }
  };

  // Stop playback when component unmounts or when currentStep changes
  React.useEffect(() => {
    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, []);

  // Stop playback when reaching the end
  React.useEffect(() => {
    if (currentStep >= totalSteps - 1 && isPlaying) {
      clearInterval(playbackInterval.current);
      setIsPlaying(false);
    }
  }, [currentStep, totalSteps, isPlaying]);

  return (
    <div className="timeline-container glass-pro p-4 rounded-lg border border-slate-700/50">
      <div className="flex flex-col gap-4">
        {/* Timeline Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStepChange(0)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Go to start"
            >
              <SkipBack className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-emerald-400" />
              ) : (
                <Play className="w-4 h-4 text-emerald-400" />
              )}
            </button>
            <button
              onClick={() => handleStepChange(totalSteps - 1)}
              className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              title="Go to end"
            >
              <SkipForward className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Speed:</span>
            <select
              value={playbackSpeed}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              className="bg-slate-800 text-slate-200 rounded-lg px-2 py-1 text-sm border border-slate-700/50"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="relative">
          <Slider
            className="flex-1"
            value={currentStep}
            min={0}
            max={totalSteps - 1}
            onChange={handleStepChange}
            marks={markers}
            tooltip={{ 
              formatter: (value) => `Step ${value + 1}`,
              placement: 'top'
            }}
            trackStyle={{ backgroundColor: '#10B981' }}
            handleStyle={{ 
              borderColor: '#10B981',
              backgroundColor: '#10B981',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
            }}
            railStyle={{ backgroundColor: '#334155' }}
          />
        </div>

        {/* Step Information */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Step {currentStep + 1} of {totalSteps}</span>
          {markers[currentStep] && (
            <span className="text-emerald-400 font-medium">
              {markers[currentStep].label}
            </span>
          )}
        </div>

        {/* Step Navigation */}
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: Math.min(4, totalSteps) }, (_, i) => {
            const step = Math.floor((currentStep / totalSteps) * totalSteps) + i;
            if (step >= totalSteps) return null;
            return (
              <button
                key={step}
                onClick={() => handleStepChange(step)}
                className={`p-2 rounded-lg text-sm transition-colors ${
                  step === currentStep
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                }`}
              >
                Step {step + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Performance Metrics Component
const PerformanceMetrics = ({ metrics }) => {
  const [expandedSections, setExpandedSections] = React.useState({
    overview: true,
    memory: true,
    time: true,
    complexity: true,
    suggestions: true
  });
  const [analysis, setAnalysis] = React.useState(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  React.useEffect(() => {
    if (metrics) {
      analyzePerformance(metrics);
    }
  }, [metrics]);

  const analyzePerformance = async (currentMetrics) => {
    setIsAnalyzing(true);
    try {
      // Basic analysis of performance metrics
      const suggestions = [];
      
      // Time complexity analysis
      if (currentMetrics.timeComplexity) {
        if (currentMetrics.timeComplexity.includes('O(n²)') || currentMetrics.timeComplexity.includes('O(2^n)')) {
          suggestions.push({
            title: 'High Time Complexity',
            description: 'Consider optimizing algorithms with high time complexity.',
            impact: 'High'
          });
        }
      }

      // Memory usage analysis
      if (currentMetrics.memoryUsage > 1000000) { // 1MB threshold
        suggestions.push({
          title: 'High Memory Usage',
          description: 'Consider implementing memory optimization techniques.',
          impact: 'Medium'
        });
      }

      // CPU usage analysis
      if (currentMetrics.cpuUsage > 80) {
        suggestions.push({
          title: 'High CPU Usage',
          description: 'Consider optimizing CPU-intensive operations.',
          impact: 'High'
        });
      }

      setAnalysis({ suggestions });
    } catch (error) {
      console.error('Error analyzing performance:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Utility functions
  const formatTime = (ms) => {
    if (!ms && ms !== 0) return '0ms';
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemory = (bytes) => {
    if (!bytes && bytes !== 0) return '0B';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const renderSparkline = (data, color = 'emerald', gradient = true) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    // Define vibrant color combinations
    const colorSchemes = {
      blue: {
        line: 'rgb(59, 130, 246)', // blue-500
        gradient: ['rgba(59, 130, 246, 0.8)', 'rgba(37, 99, 235, 1)'], // blue-500 to blue-600
        area: ['rgba(59, 130, 246, 0.4)', 'rgba(37, 99, 235, 0.1)']
      },
      purple: {
        line: 'rgb(168, 85, 247)', // purple-500
        gradient: ['rgba(168, 85, 247, 0.8)', 'rgba(147, 51, 234, 1)'], // purple-500 to purple-600
        area: ['rgba(168, 85, 247, 0.4)', 'rgba(147, 51, 234, 0.1)']
      },
      amber: {
        line: 'rgb(245, 158, 11)', // amber-500
        gradient: ['rgba(245, 158, 11, 0.8)', 'rgba(217, 119, 6, 1)'], // amber-500 to amber-600
        area: ['rgba(245, 158, 11, 0.4)', 'rgba(217, 119, 6, 0.1)']
      },
      emerald: {
        line: 'rgb(16, 185, 129)', // emerald-500
        gradient: ['rgba(16, 185, 129, 0.8)', 'rgba(5, 150, 105, 1)'], // emerald-500 to emerald-600
        area: ['rgba(16, 185, 129, 0.4)', 'rgba(5, 150, 105, 0.1)']
      }
    };

    const scheme = colorSchemes[color] || colorSchemes.emerald;
    
    return (
      <svg className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={scheme.gradient[0]} />
            <stop offset="100%" stopColor={scheme.gradient[1]} />
          </linearGradient>
          {gradient && (
            <linearGradient id={`area-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={scheme.area[0]} />
              <stop offset="100%" stopColor={scheme.area[1]} />
            </linearGradient>
          )}
        </defs>
        <path
          d={data.map((value, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((value - min) / range) * 100;
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(' ')}
          fill="none"
          stroke={scheme.line}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {gradient && (
          <path
            d={`${data.map((value, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - ((value - min) / range) * 100;
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')} L 100 100 L 0 100 Z`}
            fill={`url(#area-${color})`}
          />
        )}
      </svg>
    );
  };

  const renderMetricCard = (label, value, icon, trend = null, color = 'emerald', sparklineData = null) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-${color}-500/30`}>
            {icon}
          </div>
          <span className="text-sm font-medium text-slate-200">{label}</span>
        </div>
        {trend && (
          <div className={`text-xs font-medium ${
            trend > 0 ? 'text-emerald-400' : 'text-red-400'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold text-white mb-2">{value}</div>
      {sparklineData && (
        <div className="h-16 w-full bg-slate-900/30 rounded-lg p-2">
          {renderSparkline(sparklineData, color)}
        </div>
      )}
    </motion.div>
  );

  const renderSection = (title, icon, content, sectionKey) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1
      }}
      className="space-y-4"
    >
      <motion.div 
        className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </h2>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "rgba(148, 163, 184, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => toggleSection(sectionKey)}
          className="p-2 rounded-lg transition-colors duration-200"
        >
          <motion.span
            animate={{ rotate: expandedSections[sectionKey] ? 0 : 180 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="text-xl text-slate-400"
          >
            {expandedSections[sectionKey] ? '−' : '+'}
          </motion.span>
        </motion.button>
      </motion.div>
      
      <AnimatePresence initial={false}>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: "auto", 
              opacity: 1,
              transition: {
                height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
              }
            }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              {content}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full p-6 space-y-6 overflow-auto scrollbar-hide"
    >
      {renderSection(
        "Performance Overview",
        <BarChart2 className="w-5 h-5 text-emerald-400" />,
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {renderMetricCard(
            'Total Time',
            formatTime(metrics?.totalTime),
            <Clock className="w-4 h-4 text-blue-400" />,
            null,
            'blue',
            metrics?.timeHistory
          )}
          {renderMetricCard(
            'Memory Usage',
            formatMemory(metrics?.memoryUsage),
            <Database className="w-4 h-4 text-purple-400" />,
            null,
            'purple',
            metrics?.memoryHistory
          )}
          {renderMetricCard(
            'CPU Usage',
            `${metrics?.cpuUsage?.toFixed(1) || 0}%`,
            <Cpu className="w-4 h-4 text-amber-400" />,
            null,
            'amber',
            metrics?.cpuHistory
          )}
          {renderMetricCard(
            'Complexity',
            metrics?.complexity || 'O(1)',
            <Layers className="w-4 h-4 text-emerald-400" />,
            null,
            'emerald'
          )}
        </div>,
        'overview'
      )}

      {renderSection(
        "Memory Analysis",
        <Database className="w-5 h-5 text-purple-400" />,
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Memory Usage Over Time</h3>
            <div className="h-32 bg-slate-900/30 rounded-lg p-2">
              {renderSparkline(metrics?.memoryHistory, 'purple', true)}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-200 mb-2">Memory Distribution</h3>
            <div className="space-y-4">
              {Object.entries(metrics?.memoryDistribution || {}).map(([type, value]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-200 capitalize">{type}</span>
                    <span className="text-white font-medium">{formatMemory(value)}</span>
                  </div>
                  <div className="h-2 bg-slate-900/50 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        type === 'heap' ? 'bg-purple-500' :
                        type === 'stack' ? 'bg-blue-500' :
                        'bg-emerald-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.min((value / (metrics?.memoryUsage || 1)) * 100, 100)}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        'memory'
      )}

      {renderSection(
        "Time Analysis",
        <Clock className="w-5 h-5 text-blue-400" />,
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Execution Time Breakdown</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Average</span>
                  <span className="text-white">{formatTime(metrics?.averageTime || 0)}</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((metrics?.averageTime || 0) / (metrics?.maxTime || 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Min</span>
                  <span className="text-white">{formatTime(metrics?.minTime || 0)}</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((metrics?.minTime || 0) / (metrics?.maxTime || 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Max</span>
                  <span className="text-white">{formatTime(metrics?.maxTime || 0)}</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Time Distribution</h3>
            <div className="h-32">
              {renderSparkline(metrics?.timeHistory || [0, 10, 20, 15, 25, 30, 20], 'blue')}
            </div>
          </div>
        </div>,
        'time'
      )}

      {renderSection(
        "Complexity Analysis",
        <Layers className="w-5 h-5 text-emerald-400" />,
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Time Complexity</h3>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                {metrics?.timeComplexity || 'O(1)'}
              </div>
              <span className="text-slate-400 text-sm">
                {metrics?.timeComplexityDescription || 'Constant time complexity'}
              </span>
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Space Complexity</h3>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                {metrics?.spaceComplexity || 'O(1)'}
              </div>
              <span className="text-slate-400 text-sm">
                {metrics?.spaceComplexityDescription || 'Constant space complexity'}
              </span>
            </div>
          </div>
        </div>,
        'complexity'
      )}

      {renderSection(
        "Optimization Suggestions",
        <Gauge className="w-5 h-5 text-amber-400" />,
        <div className="grid grid-cols-1 gap-4">
          {analysis?.suggestions?.map((suggestion, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Gauge className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-white mb-1">{suggestion.title}</h3>
                  <p className="text-sm text-slate-400">{suggestion.description}</p>
                  {suggestion.impact && (
                    <div className="mt-2 text-xs text-slate-500">
                      Potential Impact: {suggestion.impact}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>,
        'suggestions'
      )}
    </motion.div>
  );
};

// Multi-View Container
const MultiViewContainer = ({ views, activeView, onViewChange }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [viewStats, setViewStats] = React.useState({});
  const [hoveredView, setHoveredView] = React.useState(null);
  const [showSettings, setShowSettings] = React.useState(false);
  
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = React.useState(() => {
    const savedSettings = localStorage.getItem('multiViewSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      autoRefresh: true,
      showAnimations: true,
      compactMode: false,
      theme: 'dark'
    };
  });

  // Save settings to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('multiViewSettings', JSON.stringify(settings));
  }, [settings]);

  // Auto refresh effect
  React.useEffect(() => {
    if (settings.autoRefresh) {
      const refreshInterval = setInterval(() => {
        handleRefresh();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [settings.autoRefresh]);

  // Theme effect
  React.useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.style.setProperty('--bg-primary', 'rgba(255, 255, 255, 0.9)');
      root.style.setProperty('--bg-secondary', 'rgba(241, 245, 249, 0.9)');
      root.style.setProperty('--text-primary', '#1e293b');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--border-color', 'rgba(148, 163, 184, 0.5)');
      root.style.setProperty('--hover-bg', 'rgba(148, 163, 184, 0.1)');
    } else {
      root.style.setProperty('--bg-primary', 'rgba(15, 23, 42, 0.9)');
      root.style.setProperty('--bg-secondary', 'rgba(30, 41, 59, 0.9)');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#94a3b8');
      root.style.setProperty('--border-color', 'rgba(148, 163, 184, 0.5)');
      root.style.setProperty('--hover-bg', 'rgba(148, 163, 184, 0.1)');
    }
  }, [settings.theme]);

  // Calculate view statistics
  React.useEffect(() => {
    const stats = {};
    views.forEach(view => {
      stats[view.id] = {
        lastAccessed: Date.now(),
        accessCount: 0
      };
    });
    setViewStats(stats);
  }, [views]);

  const handleViewChange = (viewId) => {
    onViewChange(viewId);
    setViewStats(prev => ({
      ...prev,
      [viewId]: {
        lastAccessed: Date.now(),
        accessCount: (prev[viewId]?.accessCount || 0) + 1
      }
    }));
  };

  const handleRefresh = () => {
    // Reset view statistics
    const stats = {};
    views.forEach(view => {
      stats[view.id] = {
        lastAccessed: Date.now(),
        accessCount: 0
      };
    });
    setViewStats(stats);
    
    // Reset to first view
    handleViewChange(views[0].id);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const renderSettingsPanel = () => (
    <motion.div
      className="absolute top-16 right-0 w-64 glass-pro p-4 rounded-xl border border-slate-700/50 shadow-xl z-50"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200">Auto Refresh</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.autoRefresh ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('autoRefresh', !settings.autoRefresh)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.autoRefresh ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200">Show Animations</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.showAnimations ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('showAnimations', !settings.showAnimations)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.showAnimations ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200">Compact Mode</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.compactMode ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('compactMode', !settings.compactMode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.compactMode ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="pt-2 border-t border-slate-700/50">
          <span className="text-sm font-medium text-slate-200 mb-2 block">Theme</span>
          <div className="grid grid-cols-2 gap-2">
            {['dark', 'light'].map(theme => (
              <motion.button
                key={theme}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  settings.theme === theme
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                }`}
                onClick={() => handleSettingChange('theme', theme)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderViewButton = (view) => {
    const isActive = activeView === view.id;
    const stats = viewStats[view.id] || { accessCount: 0 };
    const timeSinceLastAccess = Date.now() - (stats.lastAccessed || 0);
    const isRecentlyAccessed = timeSinceLastAccess < 5 * 60 * 1000; // 5 minutes

    return (
      <motion.button
        key={view.id}
        className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
          isActive
            ? 'bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 text-white shadow-lg'
            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
        } ${settings.compactMode ? 'px-2 py-1.5 text-xs' : ''}`}
        onClick={() => handleViewChange(view.id)}
        onMouseEnter={() => setHoveredView(view.id)}
        onMouseLeave={() => setHoveredView(null)}
        whileHover={settings.showAnimations ? { 
          scale: 1.05,
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)"
        } : {}}
        whileTap={settings.showAnimations ? { scale: 0.95 } : {}}
        initial={settings.showAnimations ? { opacity: 0, y: 20 } : {}}
        animate={settings.showAnimations ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-2">
          {view.icon && (
            <motion.div
              className={`p-1.5 rounded-lg ${
                isActive ? 'bg-white/20' : 'bg-slate-700/50'
              } ${settings.compactMode ? 'p-1' : ''}`}
              whileHover={settings.showAnimations ? { rotate: 360 } : {}}
              transition={{ duration: 0.5 }}
            >
              {React.cloneElement(view.icon, {
                className: `w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'} ${settings.compactMode ? 'w-3 h-3' : ''}`
              })}
            </motion.div>
          )}
          <span>{view.label}</span>
        </div>
        
        {/* View statistics indicators */}
        {!settings.compactMode && (
          <div className="absolute -top-1 -right-1 flex gap-1">
            {stats.accessCount > 0 && (
              <motion.div
                className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 text-xs text-white font-medium"
                initial={settings.showAnimations ? { scale: 0 } : {}}
                animate={settings.showAnimations ? { scale: 1 } : {}}
                whileHover={settings.showAnimations ? { scale: 1.1 } : {}}
              >
                {stats.accessCount}
              </motion.div>
            )}
            {isRecentlyAccessed && (
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-500"
                initial={settings.showAnimations ? { scale: 0 } : {}}
                animate={settings.showAnimations ? { scale: 1 } : {}}
                transition={{ duration: 0.2 }}
              />
            )}
          </div>
        )}

        {/* Hover effect */}
        {hoveredView === view.id && !isActive && settings.showAnimations && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20"
            layoutId="hoverEffect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.button>
    );
  };

  return (
    <motion.div 
      className={`multi-view-container glass-pro rounded-xl border border-slate-700/50 h-full relative overflow-hidden ${
        settings.compactMode ? 'p-3' : 'p-6'
      }`}
      style={{
        backgroundColor: settings.theme === 'light' ? 'var(--bg-primary)' : 'var(--bg-primary)',
        color: settings.theme === 'light' ? 'var(--text-primary)' : 'var(--text-primary)',
      }}
      initial={settings.showAnimations ? { opacity: 0 } : {}}
      animate={settings.showAnimations ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      {settings.showAnimations && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      )}

      {/* View Navigation */}
      <div className={`flex items-center justify-between mb-6 relative z-10 ${settings.compactMode ? 'mb-3' : ''}`}>
        <div className="flex gap-3">
          {views.map(renderViewButton)}
        </div>
        <motion.div
          className="flex items-center gap-3"
          initial={settings.showAnimations ? { opacity: 0 } : {}}
          animate={settings.showAnimations ? { opacity: isHovered ? 1 : 0 } : {}}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            className={`p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors ${
              settings.compactMode ? 'p-1.5' : ''
            }`}
            title="Reset view"
            onClick={handleRefresh}
            whileHover={settings.showAnimations ? { scale: 1.1 } : {}}
            whileTap={settings.showAnimations ? { scale: 0.95 } : {}}
          >
            <svg className={`w-4 h-4 ${settings.compactMode ? 'w-3 h-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
          <motion.button
            className={`p-2 rounded-xl transition-colors ${
              showSettings ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 text-slate-400 hover:text-white'
            } ${settings.compactMode ? 'p-1.5' : ''}`}
            title="View settings"
            onClick={() => setShowSettings(!showSettings)}
            whileHover={settings.showAnimations ? { scale: 1.1 } : {}}
            whileTap={settings.showAnimations ? { scale: 0.95 } : {}}
          >
            <svg className={`w-4 h-4 ${settings.compactMode ? 'w-3 h-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && renderSettingsPanel()}
      </AnimatePresence>

      {/* View Content */}
      <motion.div 
        className={`view-content relative rounded-xl overflow-hidden bg-slate-800/30 border border-slate-700/50 ${
          settings.compactMode ? 'h-[calc(100%-45px)]' : 'h-[calc(100%-80px)]'
        }`}
        initial={settings.showAnimations ? { opacity: 0 } : {}}
        animate={settings.showAnimations ? { opacity: 1 } : {}}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={settings.showAnimations ? { opacity: 0, x: 20 } : {}}
            animate={settings.showAnimations ? { opacity: 1, x: 0 } : {}}
            exit={settings.showAnimations ? { opacity: 0, x: -20 } : {}}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {views.find(v => v.id === activeView)?.content}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Progress indicator */}
      {settings.showAnimations && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}

      {/* Ambient light effect */}
      {settings.showAnimations && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${isHovered ? '50%' : '0%'} 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)`,
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

// Learning Features Component
const LearningFeatures = ({ currentStep, explanation, quiz, nodeData }) => {
  const [selectedAnswer, setSelectedAnswer] = React.useState(null);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [isCorrect, setIsCorrect] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState({
    explanation: true,
    quiz: true,
    concepts: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setIsCorrect(answer === quiz?.correctAnswer);
  };

  const renderSection = (title, icon, content, sectionKey) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="learning-section glass-pro p-4 rounded-xl border border-slate-700/50 mb-4"
      transition={{ duration: 0.3 }}
    >
      <div 
        className="flex items-center justify-between mb-3 cursor-pointer"
        onClick={() => toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-base font-semibold text-slate-200">{title}</h3>
        </div>
        <motion.div
          animate={{ rotate: expandedSections[sectionKey] ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>
      <AnimatePresence>
        {expandedSections[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderQuiz = () => {
    if (!quiz) return null;

    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-300">{quiz.question}</p>
        <div className="space-y-2">
          {quiz.options.map((option, index) => (
            <motion.button
              key={index}
              className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                selectedAnswer === option
                  ? isCorrect
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-red-500/20 text-red-400 border-red-500/50'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50'
              } border`}
              onClick={() => handleAnswerSelect(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={showFeedback}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                  selectedAnswer === option
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : 'border-red-500 bg-red-500/20'
                    : 'border-slate-600'
                }`}>
                  {selectedAnswer === option && (
                    <motion.svg
                      className={`w-4 h-4 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {isCorrect ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      )}
                    </motion.svg>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
        {showFeedback && (
          <motion.div
            className={`p-3 rounded-lg ${
              isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm font-medium">
              {isCorrect ? 'Correct!' : 'Incorrect. Try again!'}
            </p>
            {!isCorrect && (
              <p className="text-sm mt-1">{quiz.explanation}</p>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  const renderExplanation = () => {
    // Split explanation into paragraphs if it contains newlines
    const explanationParagraphs = explanation?.split('\n\n') || [];
    
    return (
      <div className="space-y-4">
        <div className="prose prose-invert max-w-none">
          {explanationParagraphs.map((paragraph, index) => (
            <p key={index} className="text-sm text-slate-300 mb-3">
              {paragraph}
            </p>
          ))}
        </div>

        {nodeData?.variables && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-slate-200 mb-2">Current Variables:</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(nodeData.variables).map(([key, value]) => (
                <motion.div
                  key={key}
                  className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-xs text-slate-400">{key}:</span>
                  <span className="text-sm font-medium text-slate-200 ml-2">
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {currentStep > 0 && (
          <motion.div
            className="flex items-center gap-2 text-sm text-slate-400 mt-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>This step is part of the algorithm's execution process.</span>
          </motion.div>
        )}
      </div>
    );
  };

  const renderKeyConcepts = () => (
    <div className="space-y-3">
      {['Time Complexity', 'Space Complexity', 'Key Operations'].map((concept, index) => (
        <motion.div
          key={concept}
          className="concept-card p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-slate-200">{concept}</span>
          </div>
          <p className="text-sm text-slate-400">
            {concept === 'Time Complexity' && 'O(n log n) - Efficient for large datasets'}
            {concept === 'Space Complexity' && 'O(n) - Linear space requirement'}
            {concept === 'Key Operations' && 'Comparison and swapping of elements'}
          </p>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="learning-features space-y-4">
      {renderSection(
        'Step Explanation',
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>,
        renderExplanation(),
        'explanation'
      )}

      {quiz && renderSection(
        'Quick Quiz',
        <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>,
        renderQuiz(),
        'quiz'
      )}

      {renderSection(
        'Key Concepts',
        <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>,
        renderKeyConcepts(),
        'concepts'
      )}
    </div>
  );
};

const FlowController = ({ currentStep, nodes }) => {
  return null;
};

const defaultTheme = {
  primary: '#10B981', // emerald-500
  secondary: '#059669', // emerald-600
  background: '#1F2937', // gray-800
  text: '#F9FAFB', // gray-50
  border: '#374151', // gray-700
  nodeBackground: '#374151', // gray-700
  nodeBorder: '#4B5563', // gray-600
  edgeColor: '#6B7280', // gray-500
  highlight: '#34D399', // emerald-400
  error: '#EF4444', // red-500
  warning: '#F59E0B', // amber-500
  success: '#10B981', // emerald-500
  info: '#3B82F6' // blue-500
};

const defaultCustomizationSettings = {
  theme: 'dark',
  nodeStyle: 'default',
  edgeStyle: 'default',
  animationSpeed: 'normal',
  showLabels: true,
  showGrid: true,
  showControls: true,
  nodeSize: 'medium',
  edgeThickness: 'normal',
  colorScheme: 'emerald',
  layout: 'auto',
  compactMode: false,
  showTooltips: true,
  highlightActive: true,
  showMetrics: true,
  colors: defaultTheme
};

const FlowContent = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  currentStep, 
  loader, 
  customizationSettings = defaultCustomizationSettings 
}) => {
  const reactFlowWrapper = React.useRef(null);
  const { fitView } = useReactFlow();
  const [progressText, setProgressText] = React.useState('');
  const [progressStage, setProgressStage] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const timeoutsRef = React.useRef([]);
  const progressRef = React.useRef({
    currentIndex: 0,
    isComplete: false,
    error: null
  });

  // Get the current color scheme from customization settings
  const colorSchemes = {
    emerald: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: '#064E3B',
      text: '#ECFDF5',
      muted: '#6EE7B7',
      border: '#059669'
    },
    blue: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      accent: '#60A5FA',
      background: '#1E3A8A',
      text: '#EFF6FF',
      muted: '#93C5FD',
      border: '#2563EB'
    },
    purple: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      background: '#4C1D95',
      text: '#F5F3FF',
      muted: '#C4B5FD',
      border: '#7C3AED'
    },
    rose: {
      primary: '#F43F5E',
      secondary: '#E11D48',
      accent: '#FB7185',
      background: '#881337',
      text: '#FFF1F2',
      muted: '#FDA4AF',
      border: '#E11D48'
    },
    amber: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      background: '#78350F',
      text: '#FFFBEB',
      muted: '#FCD34D',
      border: '#D97706'
    },
    teal: {
      primary: '#14B8A6',
      secondary: '#0D9488',
      accent: '#2DD4BF',
      background: '#134E4A',
      text: '#F0FDFA',
      muted: '#5EEAD4',
      border: '#0D9488'
    },
    indigo: {
      primary: '#6366F1',
      secondary: '#4F46E5',
      accent: '#818CF8',
      background: '#312E81',
      text: '#EEF2FF',
      muted: '#A5B4FC',
      border: '#4F46E5'
    }
  };

  // Theme configurations with enhanced color handling
  const themeConfigs = {
    dark: {
      background: '#0F172A',
      nodeBackground: colorSchemes[customizationSettings.colorScheme].primary,
      nodeBorder: colorSchemes[customizationSettings.colorScheme].border,
      nodeText: colorSchemes[customizationSettings.colorScheme].text,
      edgeColor: colorSchemes[customizationSettings.colorScheme].accent,
      controlsBackground: 'rgba(15, 23, 42, 0.8)',
      controlsBorder: 'rgba(148, 163, 184, 0.1)',
      backgroundDots: colorSchemes[customizationSettings.colorScheme].muted,
      nodeHoverBackground: colorSchemes[customizationSettings.colorScheme].secondary,
      nodeSelectedBackground: colorSchemes[customizationSettings.colorScheme].accent,
      nodeSelectedBorder: colorSchemes[customizationSettings.colorScheme].primary,
      edgeHoverColor: colorSchemes[customizationSettings.colorScheme].primary,
      edgeSelectedColor: colorSchemes[customizationSettings.colorScheme].secondary
    },
    light: {
      background: '#F8FAFC',
      nodeBackground: colorSchemes[customizationSettings.colorScheme].primary,
      nodeBorder: colorSchemes[customizationSettings.colorScheme].border,
      nodeText: colorSchemes[customizationSettings.colorScheme].text,
      edgeColor: colorSchemes[customizationSettings.colorScheme].accent,
      controlsBackground: 'rgba(248, 250, 252, 0.8)',
      controlsBorder: 'rgba(148, 163, 184, 0.2)',
      backgroundDots: colorSchemes[customizationSettings.colorScheme].muted,
      nodeHoverBackground: colorSchemes[customizationSettings.colorScheme].secondary,
      nodeSelectedBackground: colorSchemes[customizationSettings.colorScheme].accent,
      nodeSelectedBorder: colorSchemes[customizationSettings.colorScheme].primary,
      edgeHoverColor: colorSchemes[customizationSettings.colorScheme].primary,
      edgeSelectedColor: colorSchemes[customizationSettings.colorScheme].secondary
    }
  };

  // Get current theme based on settings and system preference
  const getCurrentTheme = () => {
    if (customizationSettings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return customizationSettings.theme;
  };

  const currentTheme = getCurrentTheme();
  const theme = themeConfigs[currentTheme];

  // Configure nodes with enhanced theme and style
  const configuredNodes = nodes.map(node => {
    // Define node size configurations
    const nodeSizeConfigs = {
      small: {
        width: 120,
        height: 40,
        padding: '8px',
        fontSize: '12px'
      },
      medium: {
        width: 150,
        height: 60,
        padding: '12px',
        fontSize: '14px'
      },
      large: {
        width: 180,
        height: 80,
        padding: '16px',
        fontSize: '16px'
      }
    };

    // Get the selected size configuration
    const selectedSize = nodeSizeConfigs[customizationSettings.nodeSize] || nodeSizeConfigs.medium;

    // Define base styles for different node styles with enhanced hover and selection states
    const nodeStyleConfigs = {
      default: {
        borderRadius: '8px',
        padding: selectedSize.padding,
        border: '2px solid',
        backgroundColor: theme.nodeBackground,
        width: selectedSize.width,
        height: selectedSize.height,
        fontSize: selectedSize.fontSize,
        '&:hover': {
          backgroundColor: theme.nodeHoverBackground,
          transform: 'scale(1.02)'
        },
        '&.selected': {
          backgroundColor: theme.nodeSelectedBackground,
          borderColor: theme.nodeSelectedBorder
        }
      },
      minimal: {
        borderRadius: '4px',
        padding: selectedSize.padding,
        border: '1px solid',
        backgroundColor: theme.nodeBackground,
        width: selectedSize.width,
        height: selectedSize.height,
        fontSize: selectedSize.fontSize,
        opacity: 0.9,
        '&:hover': {
          backgroundColor: theme.nodeHoverBackground,
          opacity: 1,
          transform: 'scale(1.01)'
        },
        '&.selected': {
          backgroundColor: theme.nodeSelectedBackground,
          borderColor: theme.nodeSelectedBorder,
          opacity: 1
        }
      },
      rounded: {
        borderRadius: '20px',
        padding: selectedSize.padding,
        border: '2px solid',
        backgroundColor: theme.nodeBackground,
        width: selectedSize.width,
        height: selectedSize.height,
        fontSize: selectedSize.fontSize,
        opacity: 0.95,
        '&:hover': {
          backgroundColor: theme.nodeHoverBackground,
          opacity: 1,
          transform: 'scale(1.02)'
        },
        '&.selected': {
          backgroundColor: theme.nodeSelectedBackground,
          borderColor: theme.nodeSelectedBorder,
          opacity: 1
        }
      },
      sharp: {
        borderRadius: '0px',
        padding: selectedSize.padding,
        border: '2px solid',
        backgroundColor: theme.nodeBackground,
        width: selectedSize.width,
        height: selectedSize.height,
        fontSize: selectedSize.fontSize,
        opacity: 0.95,
        '&:hover': {
          backgroundColor: theme.nodeHoverBackground,
          opacity: 1,
          transform: 'scale(1.02)'
        },
        '&.selected': {
          backgroundColor: theme.nodeSelectedBackground,
          borderColor: theme.nodeSelectedBorder,
          opacity: 1
        }
      }
    };

    // Get the selected style configuration
    const selectedStyle = nodeStyleConfigs[customizationSettings.nodeStyle] || nodeStyleConfigs.default;

    return {
      ...node,
      draggable: true,
      style: {
        ...node.style,
        ...selectedStyle,
        cursor: 'grab',
        color: theme.nodeText,
        boxShadow: `0 4px 6px -1px ${theme.edgeColor}20`,
        transition: 'all 0.3s ease',
        userSelect: 'none',
        touchAction: 'none'
      }
    };
  });

  // Configure edges with enhanced theme and style
  const configuredEdges = edges.map(edge => {
    // Define edge thickness based on settings
    const edgeThicknessConfigs = {
      thin: 1,
      normal: 2,
      thick: 3
    };

    // Define edge styles based on the selected edge style with enhanced hover and selection states
    const edgeStyleConfigs = {
      default: {
        type: 'default',
        style: {
          strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] || 2,
          strokeLinecap: 'round',
          '&:hover': {
            stroke: theme.edgeHoverColor,
            strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] + 1
          },
          '&.selected': {
            stroke: theme.edgeSelectedColor,
            strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] + 1
          }
        }
      },
      dashed: {
        type: 'default',
        style: {
          strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] || 2,
          strokeDasharray: '5,5',
          strokeLinecap: 'round',
          '&:hover': {
            stroke: theme.edgeHoverColor,
            strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] + 1,
            strokeDasharray: '4,4'
          },
          '&.selected': {
            stroke: theme.edgeSelectedColor,
            strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] + 1,
            strokeDasharray: '4,4'
          }
        }
      },
      dotted: {
        type: 'default',
        style: {
          strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] || 2,
          strokeDasharray: '2,4',
          strokeLinecap: 'round',
          '&:hover': {
            stroke: theme.edgeHoverColor,
            strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] + 1,
            strokeDasharray: '2,3'
          },
          '&.selected': {
            stroke: theme.edgeSelectedColor,
            strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] + 1,
            strokeDasharray: '2,3'
          }
        }
      },
      curved: {
        type: 'smoothstep',
        style: {
          strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] || 2,
          strokeLinecap: 'round',
          '&:hover': {
            stroke: theme.edgeHoverColor,
            strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] + 1
          },
          '&.selected': {
            stroke: theme.edgeSelectedColor,
            strokeWidth: edgeThicknessConfigs[customizationSettings.edgeThickness] + 1
          }
        }
      }
    };

    // Get the selected edge style configuration
    const selectedEdgeStyle = edgeStyleConfigs[customizationSettings.edgeStyle] || edgeStyleConfigs.default;

    return {
      ...edge,
      type: selectedEdgeStyle.type,
      style: {
        ...edge.style,
        ...selectedEdgeStyle.style,
        stroke: theme.edgeColor,
        transition: 'all 0.3s ease'
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: theme.edgeColor
      },
      animated: true
    };
  });

  // Add useEffect to handle theme changes with enhanced CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    // Set all theme-related custom properties
    root.style.setProperty('--flow-background', theme.background);
    root.style.setProperty('--flow-node-background', theme.nodeBackground);
    root.style.setProperty('--flow-node-border-color', theme.nodeBorder);
    root.style.setProperty('--flow-edge-color', theme.edgeColor);
    root.style.setProperty('--flow-controls-background', theme.controlsBackground);
    root.style.setProperty('--flow-controls-border-color', theme.controlsBorder);
    root.style.setProperty('--flow-background-dots', theme.backgroundDots);
    root.style.setProperty('--flow-node-hover-background', theme.nodeHoverBackground);
    root.style.setProperty('--flow-node-selected-background', theme.nodeSelectedBackground);
    root.style.setProperty('--flow-node-selected-border', theme.nodeSelectedBorder);
    root.style.setProperty('--flow-edge-hover-color', theme.edgeHoverColor);
    root.style.setProperty('--flow-edge-selected-color', theme.edgeSelectedColor);
    
    // Set border-related custom properties
    root.style.setProperty('--flow-border-width', '0px');
    root.style.setProperty('--flow-border-style', 'none');
    root.style.setProperty('--flow-controls-border-width', '1px');
    root.style.setProperty('--flow-controls-border-style', 'solid');
  }, [theme]);

  return (
    <div className="w-full h-full relative">
      <AnimatePresence mode="wait">
        {loader ? (
          <motion.div
            className="loader"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.5 } }}
          />
        ) : (
          <ReactFlow 
            ref={reactFlowWrapper}
            nodes={configuredNodes}
            edges={configuredEdges} 
            onNodesChange={onNodesChange} 
            fitView
            fitViewOptions={{ padding: 0.2 }}
            attributionPosition="bottom-left"
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
            panOnDrag={true}
            zoomOnScroll={true}
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            className="w-full h-full react-flow-container custom-background"
            style={{ 
              minHeight: '400px',
              transition: 'background-color 0.3s ease'
            }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              className: 'custom-edge'
            }}
          >
            <FlowController currentStep={currentStep} nodes={nodes} />
            <Controls 
              className="custom-controls"
              style={{
                transition: 'all 0.3s ease'
              }}
            />
            <Background 
              variant="dots" 
              gap={12} 
              size={1} 
              color="var(--flow-background-dots)"
              className="opacity-50"
            />
          </ReactFlow>
        )}
      </AnimatePresence>
    </div>
  );
};

const FloatingWindow = ({ isVisible, onClose, title, children }) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [size, setSize] = React.useState(() => {
    // Try to load saved size from localStorage
    const savedSize = localStorage.getItem(`window-size-${title}`);
    if (savedSize) {
      try {
        const parsedSize = JSON.parse(savedSize);
        return {
          width: Math.max(400, parsedSize.width),
          height: Math.max(300, parsedSize.height)
        };
      } catch (e) {
        console.warn('Failed to parse saved window size:', e);
      }
    }
    return { width: 600, height: 400 };
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const [windowState, setWindowState] = React.useState('minimized');
  const [isInitialized, setIsInitialized] = React.useState(false);
  const windowRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const resizeObserverRef = React.useRef(null);

  // Initialize content size measurement
  React.useEffect(() => {
    if (!isInitialized && contentRef.current) {
      const measureContent = () => {
        const content = contentRef.current;
        if (!content) return;

        // Get the content's natural size
        const contentWidth = content.scrollWidth;
        const contentHeight = content.scrollHeight;

        // Add padding and header height
        const headerHeight = 40; // Height of the header
        const padding = 32; // Total padding (16px on each side)

        // Calculate new size with minimum constraints
        const newWidth = Math.max(400, contentWidth + padding);
        const newHeight = Math.max(300, contentHeight + headerHeight + padding);

        // Keep within viewport bounds
        const maxWidth = window.innerWidth - 40; // 20px margin on each side
        const maxHeight = window.innerHeight - 40;

        setSize({
          width: Math.min(newWidth, maxWidth),
          height: Math.min(newHeight, maxHeight)
        });

        setIsInitialized(true);
      };

      // Initial measurement
      measureContent();

      // Set up ResizeObserver to handle dynamic content changes
      resizeObserverRef.current = new ResizeObserver(() => {
        if (!isResizing) { // Only auto-resize if not being manually resized
          measureContent();
        }
      });

      resizeObserverRef.current.observe(contentRef.current);

      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
        }
      };
    }
  }, [isInitialized, isResizing]);

  // Save size to localStorage when it changes
  React.useEffect(() => {
    if (size.width > 0 && size.height > 0 && isInitialized) {
      localStorage.setItem(`window-size-${title}`, JSON.stringify(size));
    }
  }, [size, title, isInitialized]);

  // Center the window relative to React Flow container
  React.useEffect(() => {
    if (isVisible && windowRef.current) {
      const flowContainer = document.querySelector('.react-flow');
      if (flowContainer) {
        const flowRect = flowContainer.getBoundingClientRect();
        const windowRect = windowRef.current.getBoundingClientRect();

        // Calculate center position relative to React Flow container
        const centerX = flowRect.left + (flowRect.width - windowRect.width) / 2;
        const centerY = flowRect.top + (flowRect.height - windowRect.height) / 2;

        // Ensure window stays within viewport bounds
        const maxX = window.innerWidth - windowRect.width;
        const maxY = window.innerHeight - windowRect.height;

        setPosition({
          x: Math.max(0, Math.min(centerX, maxX)),
          y: Math.max(0, Math.min(centerY, maxY))
        });

        // Animate window state
        setWindowState('minimized');
        setTimeout(() => setWindowState('normal'), 100);
      }
    }
  }, [isVisible]);

  // Handle mouse movement for both dragging and resizing
  const handleMouseMove = React.useCallback((e) => {
    if (isDragging && windowRef.current) {
      e.preventDefault();
      e.stopPropagation();

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep window within viewport bounds with smooth edge resistance
      const maxX = window.innerWidth - windowRef.current.offsetWidth;
      const maxY = window.innerHeight - windowRef.current.offsetHeight;

      // Add resistance at edges with spring effect
      const resistance = 0.3;
      const edgeX = Math.max(0, Math.min(maxX, newX));
      const edgeY = Math.max(0, Math.min(maxY, newY));
      
      const resistanceX = newX < 0 ? newX * resistance : 
                         newX > maxX ? (newX - maxX) * resistance : 0;
      const resistanceY = newY < 0 ? newY * resistance : 
                         newY > maxY ? (newY - maxY) * resistance : 0;

      setPosition({
        x: edgeX + resistanceX,
        y: edgeY + resistanceY
      });
    } else if (isResizing && windowRef.current) {
      e.preventDefault();
      e.stopPropagation();

      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;

      // Calculate new size with minimum constraints
      const newWidth = Math.max(400, resizeStart.width + deltaX);
      const newHeight = Math.max(300, resizeStart.height + deltaY);

      // Keep window within viewport bounds
      const maxWidth = window.innerWidth - position.x;
      const maxHeight = window.innerHeight - position.y;

      setSize({
        width: Math.min(newWidth, maxWidth),
        height: Math.min(newHeight, maxHeight)
      });
    } else if (windowRef.current && isFocused) {
      const rect = windowRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePosition({ x, y });
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, position, isFocused]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.window-handle')) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      setIsDragging(true);
    } else if (e.target.closest('.resize-handle')) {
      e.preventDefault();
      e.stopPropagation();

      const rect = windowRef.current.getBoundingClientRect();
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height
      });
      
      setIsResizing(true);
    }
  };

  const handleMouseUp = React.useCallback((e) => {
    if (isDragging || isResizing) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setIsResizing(false);
    }
  }, [isDragging, isResizing]);

  React.useEffect(() => {
    if (isDragging || isResizing || isFocused) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isFocused, handleMouseMove, handleMouseUp]);

  if (!isVisible) return null;

  return (
    <motion.div
      ref={windowRef}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: windowState === 'minimized' ? 0.95 : 1,
        y: windowState === 'minimized' ? 20 : 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30
        }
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.95, 
        y: 20,
        transition: {
          duration: 0.2
        }
      }}
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: size.width,
        height: size.height,
        zIndex: 50,
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
        touchAction: 'none',
        transform: `translate3d(0, 0, 0)`,
        willChange: 'transform',
        perspective: '1000px',
      }}
      className="floating-window overflow-hidden rounded-xl border border-slate-700/50 shadow-2xl backdrop-blur-xl"
      onMouseDown={handleMouseDown}
      onMouseEnter={() => {
        setIsHovered(true);
        setIsFocused(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsFocused(false);
      }}
    >
      {/* Minimalist header */}
      <div className="window-handle relative flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-200">{title}</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-1 rounded-full hover:bg-slate-700/50 transition-colors"
        >
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.button>
      </div>

      {/* Content area */}
      <div
        ref={contentRef}
        className="relative flex-1 overflow-auto p-4"
        style={{
          height: `calc(${size.height}px - 40px)`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>

      {/* Resize handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(148, 163, 184, 0.2) 50%)',
        }}
      />
    </motion.div>
  );
};

const CallStackView = ({ nodes, currentStep }) => {
  const [expandedSteps, setExpandedSteps] = React.useState(new Set());
  const [hoveredStep, setHoveredStep] = React.useState(null);

  const toggleStep = (stepIndex) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(stepIndex)) {
        next.delete(stepIndex);
      } else {
        next.add(stepIndex);
      }
      return next;
    });
  };

  const renderStepContent = (node, index) => {
    const isExpanded = expandedSteps.has(index);
    const isCurrentStep = index === currentStep;
    const hasVariables = node.data?.variables && Object.keys(node.data.variables).length > 0;
    const hasExplanation = node.data?.explanation;

    return (
      <motion.div
        className="callstack-item glass-pro p-4 rounded-xl border border-slate-700/50 relative"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        onMouseEnter={() => setHoveredStep(index)}
        onMouseLeave={() => setHoveredStep(null)}
      >
        {/* Step Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div 
              className={`p-2 rounded-lg ${
                isCurrentStep ? 'bg-emerald-500/20' : 'bg-slate-700/50'
              }`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <svg className={`w-4 h-4 ${
                isCurrentStep ? 'text-emerald-400' : 'text-slate-400'
              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </motion.div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200">Step {index + 1}</span>
              <span className="text-xs text-slate-400">{node.data?.type || 'Operation'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              className={`p-1.5 rounded-lg transition-colors ${
                isExpanded ? 'bg-slate-700/50' : 'bg-slate-800/50'
              }`}
              onClick={() => toggleStep(index)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.svg
                className="w-4 h-4 text-slate-400"
                animate={{ rotate: isExpanded ? 180 : 0 }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>
          </div>
        </div>

        {/* Step Description */}
        <div className="text-sm text-slate-300 mb-3">
          {node.data?.label || 'No description available'}
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Variables Section */}
              {hasVariables && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-400">Variables</div>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(node.data.variables).map(([key, value]) => (
                      <motion.div
                        key={key}
                        className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="text-xs text-slate-400">{key}</div>
                        <div className="text-sm font-medium text-slate-200">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Explanation Section */}
              {hasExplanation && (
                <motion.div
                  className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="text-xs font-medium text-slate-400 mb-1">Explanation</div>
                  <div className="text-sm text-slate-300">{node.data.explanation}</div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Step Indicator */}
        {isCurrentStep && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Hover Effect */}
        {hoveredStep === index && !isCurrentStep && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10"
            layoutId="hoverEffect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    );
  };

  return (
    <div className="callstack-view p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-200">Call Stack</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Current Step:</span>
          <span className="text-sm font-medium text-emerald-400">{currentStep + 1}</span>
        </div>
      </div>

      <div className="space-y-4">
        {nodes.slice(0, currentStep + 1).map((node, index) => renderStepContent(node, index))}
      </div>
    </div>
  );
};

// Add ShareVisualization component before VisualDebuggerGraph
const ShareVisualization = ({ nodes, edges, currentStep, customizationSettings }) => {
  const [shareUrl, setShareUrl] = React.useState('');
  const [isCopied, setIsCopied] = React.useState(false);
  const [shareOptions, setShareOptions] = React.useState({
    includeSteps: true,
    includeVariables: true,
    includeMetrics: true,
    includeGraph: true
  });
  const [exportFormat, setExportFormat] = React.useState('url');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [exportProgress, setExportProgress] = React.useState(0);
  const flowContainerRef = React.useRef(null);
  const reactFlowInstance = React.useRef(null);

  const exportFormats = [
    {
      id: 'url',
      label: 'Share URL',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>,
      description: 'Generate a shareable URL with the current visualization state'
    },
    {
      id: 'json',
      label: 'JSON Export',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>,
      description: 'Download the visualization data as a JSON file'
    },
    {
      id: 'image',
      label: 'Image Export',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      description: 'Export the visualization as a PNG image'
    },
    {
      id: 'pdf',
      label: 'PDF Report',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>,
      description: 'Generate a detailed PDF report of the visualization'
    }
  ];

  const generateShareableData = () => {
    const data = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.data?.type,
        label: node.data?.label,
        variables: shareOptions.includeVariables ? node.data?.variables : undefined,
        position: node.position
      })),
      edges: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        type: edge.type
      })),
      currentStep: shareOptions.includeSteps ? currentStep : undefined,
      timestamp: new Date().toISOString()
    };

    return JSON.stringify(data);
  };

  const handleShare = async () => {
    setIsGenerating(true);
    setExportProgress(0);
    try {
      const data = generateShareableData();
      // Compress the data by removing whitespace and shortening property names
      const compressedData = data
        .replace(/\s+/g, '')
        .replace(/"position":/g, '"p":')
        .replace(/"variables":/g, '"v":')
        .replace(/"currentStep":/g, '"s":')
        .replace(/"timestamp":/g, '"t":')
        .replace(/"type":/g, '"y":')
        .replace(/"label":/g, '"l":')
        .replace(/"source":/g, '"s":')
        .replace(/"target":/g, '"t":');
      
      const encodedData = btoa(compressedData);
      const url = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        setExportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setShareUrl(url);
    } catch (error) {
      console.error('Error generating share URL:', error);
    }
    setIsGenerating(false);
    setExportProgress(0);
  };

  const captureVisualization = async () => {
    if (!flowContainerRef.current) return null;
    
    // Wait for ReactFlow to be ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get the ReactFlow container
    const flowContainer = flowContainerRef.current.querySelector('.react-flow');
    if (!flowContainer) return null;

    // Temporarily show the container
    flowContainerRef.current.style.display = 'block';
    flowContainerRef.current.style.position = 'absolute';
    flowContainerRef.current.style.left = '-9999px';
    flowContainerRef.current.style.width = '1200px';
    flowContainerRef.current.style.height = '800px';

    try {
      const canvas = await html2canvas(flowContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0F172A',
        logging: false,
        allowTaint: true,
        onclone: (clonedDoc) => {
          // Ensure all elements are visible in the clone
          const elements = clonedDoc.getElementsByClassName('react-flow');
          if (elements.length > 0) {
            elements[0].style.opacity = '1';
            elements[0].style.visibility = 'visible';
          }
        }
      });
      
      return canvas;
    } finally {
      // Hide the container again
      flowContainerRef.current.style.display = 'none';
    }
  };

  const handleExport = async () => {
    setIsGenerating(true);
    setExportProgress(0);
    try {
      const data = generateShareableData();
      
      switch (exportFormat) {
        case 'json':
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `visualization-${new Date().toISOString()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          break;
          
        case 'image':
          setExportProgress(20);
          const canvas = await captureVisualization();
          if (canvas) {
            setExportProgress(60);
            const imageUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `visualization-${new Date().toISOString()}.png`;
            link.href = imageUrl;
            link.click();
            setExportProgress(100);
          }
          break;
          
        case 'pdf':
          setExportProgress(20);
          const pdfCanvas = await captureVisualization();
          if (pdfCanvas) {
            setExportProgress(60);
            
            // Calculate dimensions to maintain aspect ratio
            const imgWidth = 297; // A4 width in mm
            const imgHeight = (pdfCanvas.height * imgWidth) / pdfCanvas.width;
            
            const pdf = new jsPDF({
              orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
              unit: 'mm',
              format: 'a4'
            });
            
            // Add visualization image
            pdf.addImage(
              pdfCanvas.toDataURL('image/png', 1.0),
              'PNG',
              0,
              0,
              imgWidth,
              imgHeight
            );
            
            // Add metadata
            pdf.setProperties({
              title: 'Visualization Export',
              subject: 'Algorithm Visualization',
              author: 'Visual Debugger',
              keywords: 'algorithm, visualization, debug',
              creator: 'Visual Debugger'
            });
            
            // Add timestamp
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            pdf.text(
              `Generated on ${new Date().toLocaleString()}`,
              10,
              imgHeight - 10
            );
            
            setExportProgress(80);
            pdf.save(`visualization-${new Date().toISOString()}.pdf`);
            setExportProgress(100);
          }
          break;
      }
    } catch (error) {
      console.error('Error exporting:', error);
    }
    setIsGenerating(false);
    setExportProgress(0);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  return (
    <div className="share-visualization space-y-6">
      {/* Share Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Share Options</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(shareOptions).map(([key, value]) => (
            <motion.div
              key={key}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              whileHover={{ scale: 1.02 }}
            >
              <span className="text-sm text-slate-300">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <motion.button
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  value ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                onClick={() => setShareOptions(prev => ({ ...prev, [key]: !value }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-4 h-4 bg-white rounded-full"
                  animate={{ x: value ? 24 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-200">Export Format</h3>
        <div className="grid grid-cols-2 gap-4">
          {exportFormats.map(format => (
            <motion.div
              key={format.id}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                exportFormat === format.id
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50'
              }`}
              onClick={() => setExportFormat(format.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  exportFormat === format.id ? 'bg-emerald-500/20' : 'bg-slate-700/50'
                }`}>
                  {React.cloneElement(format.icon, {
                    className: `w-5 h-5 ${
                      exportFormat === format.id ? 'text-emerald-400' : 'text-slate-400'
                    }`
                  })}
                </div>
                <span className={`text-sm font-medium ${
                  exportFormat === format.id ? 'text-emerald-400' : 'text-slate-300'
                }`}>
                  {format.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">{format.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          className="flex-1 p-3 rounded-lg bg-emerald-500 text-white font-medium"
          onClick={handleShare}
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </div>
          ) : (
            'Generate Share Link'
          )}
        </motion.button>
        <motion.button
          className="flex-1 p-3 rounded-lg bg-blue-500 text-white font-medium"
          onClick={handleExport}
          disabled={isGenerating}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Exporting...</span>
            </div>
          ) : (
            `Export ${exportFormat.toUpperCase()}`
          )}
        </motion.button>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-300">{exportProgress}%</span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${exportProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Share URL */}
      {shareUrl && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-200">Share URL</h3>
            <motion.button
              className={`p-2 rounded-lg ${
                isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 text-slate-400'
              }`}
              onClick={handleCopy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCopied ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              )}
            </motion.button>
          </div>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-300 break-all">{shareUrl}</p>
          </div>
        </motion.div>
      )}

      {/* QR Code */}
      {shareUrl && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="p-4 rounded-lg bg-white">
            <QRCodeSVG
              value={shareUrl}
              size={128}
              level="L"
              includeMargin={true}
              imageSettings={{
                src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBCODQxIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDIyYzUuNTIzIDAgMTAtNC40NzcgMTAtMTBTMTcuNTIzIDIgMTIgMiAyIDYuNDc3IDIgMTJzNC40NzcgMTAgMTAgMTB6Ii8+PHBhdGggZD0iTTEyIDh2OCIvPjxwYXRoIGQ9Ik04IDEyaDgiLz48L3N2Zz4=",
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Add ref to the flow container */}
      <div ref={flowContainerRef} style={{ display: 'none' }}>
        <ReactFlowProvider>
          <FlowContent 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={() => {}} 
            currentStep={currentStep} 
            loader={false} 
            customizationSettings={customizationSettings}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};

const CustomizeVisualization = ({ onSettingsChange, currentSettings }) => {
  const [settings, setSettings] = React.useState(currentSettings || {
    theme: 'dark',
    nodeStyle: 'default',
    edgeStyle: 'default',
    animationSpeed: 'normal',
    showLabels: true,
    showGrid: true,
    showControls: true,
    nodeSize: 'medium',
    edgeThickness: 'normal',
    colorScheme: 'emerald',
    layout: 'auto',
    compactMode: false,
    showTooltips: true,
    highlightActive: true,
    showMetrics: true
  });

  const [activeTab, setActiveTab] = React.useState('general');

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const colorSchemes = {
    emerald: {
      primary: '#10B981',
      secondary: '#059669',
      accent: '#34D399',
      background: '#064E3B',
      text: '#ECFDF5',
      muted: '#6EE7B7',
      border: '#059669'
    },
    blue: {
      primary: '#3B82F6',
      secondary: '#2563EB',
      accent: '#60A5FA',
      background: '#1E3A8A',
      text: '#EFF6FF',
      muted: '#93C5FD',
      border: '#2563EB'
    },
    purple: {
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#A78BFA',
      background: '#4C1D95',
      text: '#F5F3FF',
      muted: '#C4B5FD',
      border: '#7C3AED'
    },
    rose: {
      primary: '#F43F5E',
      secondary: '#E11D48',
      accent: '#FB7185',
      background: '#881337',
      text: '#FFF1F2',
      muted: '#FDA4AF',
      border: '#E11D48'
    },
    amber: {
      primary: '#F59E0B',
      secondary: '#D97706',
      accent: '#FBBF24',
      background: '#78350F',
      text: '#FFFBEB',
      muted: '#FCD34D',
      border: '#D97706'
    },
    teal: {
      primary: '#14B8A6',
      secondary: '#0D9488',
      accent: '#2DD4BF',
      background: '#134E4A',
      text: '#F0FDFA',
      muted: '#5EEAD4',
      border: '#0D9488'
    },
    indigo: {
      primary: '#6366F1',
      secondary: '#4F46E5',
      accent: '#818CF8',
      background: '#312E81',
      text: '#EEF2FF',
      muted: '#A5B4FC',
      border: '#4F46E5'
    }
  };

  const nodeStyles = [
    { id: 'default', label: 'Default', icon: '○' },
    { id: 'minimal', label: 'Minimal', icon: '□' },
    { id: 'rounded', label: 'Rounded', icon: '◐' },
    { id: 'sharp', label: 'Sharp', icon: '◇' }
  ];

  const edgeStyles = [
    { id: 'default', label: 'Default', icon: '━' },
    { id: 'dashed', label: 'Dashed', icon: '┄' },
    { id: 'dotted', label: 'Dotted', icon: '┈' },
    { id: 'curved', label: 'Curved', icon: '⌒' }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Theme</label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-700/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Color Scheme</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(colorSchemes).map(([key, colors]) => (
              <motion.button
                key={key}
                className={`p-2 rounded-lg border ${
                  settings.colorScheme === key
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-slate-700/50 hover:border-slate-600/50'
                }`}
                onClick={() => handleSettingChange('colorScheme', key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.primary }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.secondary }} />
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.accent }} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Node Style</label>
          <div className="grid grid-cols-4 gap-2">
            {nodeStyles.map(style => (
              <motion.button
                key={style.id}
                className={`p-2 rounded-lg border ${
                  settings.nodeStyle === style.id
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-slate-700/50 hover:border-slate-600/50'
                }`}
                onClick={() => handleSettingChange('nodeStyle', style.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{style.icon}</span>
              </motion.button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Edge Style</label>
          <div className="grid grid-cols-4 gap-2">
            {edgeStyles.map(style => (
              <motion.button
                key={style.id}
                className={`p-2 rounded-lg border ${
                  settings.edgeStyle === style.id
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-slate-700/50 hover:border-slate-600/50'
                }`}
                onClick={() => handleSettingChange('edgeStyle', style.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{style.icon}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Animation Speed</label>
          <select
            value={settings.animationSpeed}
            onChange={(e) => handleSettingChange('animationSpeed', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-700/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Layout</label>
          <select
            value={settings.layout}
            onChange={(e) => handleSettingChange('layout', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-700/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          >
            <option value="auto">Auto</option>
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
            <option value="radial">Radial</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderDisplaySettings = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Node Size</label>
          <select
            value={settings.nodeSize}
            onChange={(e) => handleSettingChange('nodeSize', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-700/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Edge Thickness</label>
          <select
            value={settings.edgeThickness}
            onChange={(e) => handleSettingChange('edgeThickness', e.target.value)}
            className="w-full bg-slate-800 text-slate-200 rounded-lg px-3 py-2 text-sm border border-slate-700/50 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
          >
            <option value="thin">Thin</option>
            <option value="normal">Normal</option>
            <option value="thick">Thick</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Show Labels</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.showLabels ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('showLabels', !settings.showLabels)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.showLabels ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Show Grid</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.showGrid ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('showGrid', !settings.showGrid)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.showGrid ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Show Controls</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.showControls ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('showControls', !settings.showControls)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.showControls ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Show Tooltips</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.showTooltips ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('showTooltips', !settings.showTooltips)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.showTooltips ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Highlight Active</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.highlightActive ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('highlightActive', !settings.highlightActive)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.highlightActive ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Show Metrics</span>
          <motion.button
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              settings.showMetrics ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
            onClick={() => handleSettingChange('showMetrics', !settings.showMetrics)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full"
              animate={{ x: settings.showMetrics ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="customize-visualization space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50">
        {['general', 'display'].map(tab => (
          <motion.button
            key={tab}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab
                ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-300'
            }`}
            onClick={() => setActiveTab(tab)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="p-4">
        {activeTab === 'general' ? renderGeneralSettings() : renderDisplaySettings()}
      </div>
    </div>
  );
};

// Update VisualDebuggerGraph component to include customization
const VisualDebuggerGraph = ({
  nodes = [],
  edges = [],
  onNodesChange = () => {},
  loader = false,
  currentStep = 0,
  middleWidth = 33.33,
  onFullscreen = () => {},
  showVariableSpace = false,
  customizationSettings = defaultCustomizationSettings,
}) => {
  const [totalSteps, setTotalSteps] = React.useState(0);
  const [markers, setMarkers] = React.useState({});
  const [metrics, setMetrics] = React.useState({
    totalTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    complexity: 'O(1)',
    timeHistory: [],
    memoryHistory: [],
    cpuHistory: [],
    heapUsage: 0,
    stackUsage: 0,
    externalUsage: 0,
    averageTime: 0,
    minTime: 0,
    maxTime: 0,
    startTime: Date.now()
  });
  const [activeView, setActiveView] = React.useState('visualization');
  const [explanation, setExplanation] = React.useState('');
  const [quiz, setQuiz] = React.useState(null);
  const [activeFeature, setActiveFeature] = React.useState(null);

  const toggleFeature = (feature) => {
    setActiveFeature(activeFeature === feature ? null : feature);
  };

  const featureButtons = [
    { id: 'timeline', icon: History, label: 'Timeline', tooltip: 'Show execution timeline' },
    { id: 'metrics', icon: Gauge, label: 'Metrics', tooltip: 'Show performance metrics' },
    { id: 'multiView', icon: Layers, label: 'Multi-View', tooltip: 'Toggle multi-view visualization' },
    { id: 'learning', icon: BookOpen, label: 'Learning', tooltip: 'Show learning features' },
    { id: 'sharing', icon: Share, label: 'Share', tooltip: 'Share visualization' },
    { id: 'customization', icon: Settings, label: 'Customize', tooltip: 'Customize visualization' },
    { id: 'debugging', icon: Bug, label: 'Debug', tooltip: 'Show debugging tools' },
    { id: 'comparison', icon: GitCompare, label: 'Compare', tooltip: 'Compare algorithms' },
    { id: 'export', icon: FileText, label: 'Export', tooltip: 'Export visualization' },
    { id: 'accessibility', icon: Accessibility, label: 'Accessibility', tooltip: 'Accessibility options' }
  ];

  const views = [
    { 
      id: 'visualization', 
      label: 'Visualization',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      content: (
        <div className="w-full h-full" style={{ minHeight: '400px' }}>
          <ReactFlowProvider>
            <FlowContent 
              nodes={nodes} 
              edges={edges} 
              onNodesChange={onNodesChange} 
              currentStep={currentStep} 
              loader={loader}
              customizationSettings={customizationSettings}
            />
          </ReactFlowProvider>
        </div>
      )
    },
    { 
      id: 'memory', 
      label: 'Memory State',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>,
      content: (
        <div className="memory-view p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-200">Memory State</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Total Memory:</span>
              <span className="text-sm font-medium text-emerald-400">
                {formatMemory(nodes.reduce((acc, node) => acc + (node.data?.memoryUsage || 0), 0))}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {nodes.map((node, index) => (
              <motion.div
                key={index}
                className="memory-item glass-pro p-4 rounded-xl border border-slate-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-200">Node {index + 1}</span>
                  </div>
                  <span className="text-sm text-slate-400">
                    {formatMemory(node.data?.memoryUsage || 0)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(node.data || {}).map(([key, value]) => (
                    key !== 'memoryUsage' && (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-slate-200 font-medium">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      </div>
                    )
                  ))}
                </div>

                {node.data?.memoryUsage && (
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-400">Memory Usage</span>
                      <span className="text-xs text-slate-300">
                        {((node.data.memoryUsage / nodes.reduce((acc, n) => acc + (n.data?.memoryUsage || 0), 0)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(node.data.memoryUsage / nodes.reduce((acc, n) => acc + (n.data?.memoryUsage || 0), 0)) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    { 
      id: 'callstack', 
      label: 'Call Stack',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>,
      content: <CallStackView nodes={nodes} currentStep={currentStep} />
    },
    { 
      id: 'sharing', 
      label: 'Share',
      icon: <Share className="w-4 h-4" />,
      content: (
        <ShareVisualization 
          nodes={nodes} 
          edges={edges} 
          currentStep={currentStep}
          customizationSettings={customizationSettings}
        />
      )
    }
  ];

  const handleCustomizationChange = (newSettings) => {
    setCustomizationSettings(newSettings);
    // Apply settings to the visualization
    // This will be implemented based on your specific needs
  };

  // Helper functions for metrics calculation
  const calculateComplexity = (nodes) => {
    if (!nodes || nodes.length === 0) return 'O(1)';

    // Count different types of operations
    const operationCounts = {
      comparisons: nodes.filter(n => n.data?.type === 'comparison').length,
      swaps: nodes.filter(n => n.data?.type === 'swap').length,
      recursive: nodes.filter(n => n.data?.type === 'recursive').length,
      arrayAccess: nodes.filter(n => n.data?.type === 'arrayAccess').length,
      loops: nodes.filter(n => n.data?.type === 'loop').length,
      nestedLoops: nodes.filter(n => n.data?.type === 'nestedLoop').length
    };

    const n = nodes.length;
    const totalOperations = Object.values(operationCounts).reduce((a, b) => a + b, 0);

    // Calculate space complexity
    const spaceComplexity = calculateSpaceComplexity(nodes);

    // Check for exponential complexity
    if (operationCounts.recursive > 0 && operationCounts.recursive > Math.log2(n)) {
      return `O(2ⁿ) | Space: ${spaceComplexity}`;
    }

    // Check for cubic complexity
    if (operationCounts.nestedLoops > 0 && totalOperations > n * n * n) {
      return `O(n³) | Space: ${spaceComplexity}`;
    }

    // Check for quadratic complexity
    if (operationCounts.loops > 0 && totalOperations > n * n) {
      return `O(n²) | Space: ${spaceComplexity}`;
    }

    // Check for linearithmic complexity
    if (operationCounts.comparisons > n * Math.log2(n)) {
      return `O(n log n) | Space: ${spaceComplexity}`;
    }

    // Check for linear complexity
    if (totalOperations > n) {
      return `O(n) | Space: ${spaceComplexity}`;
    }

    // Check for logarithmic complexity
    if (operationCounts.comparisons > Math.log2(n)) {
      return `O(log n) | Space: ${spaceComplexity}`;
    }

    // Default to constant time
    return `O(1) | Space: ${spaceComplexity}`;
  };

  const calculateSpaceComplexity = (nodes) => {
    const n = nodes.length;
    const memoryUsage = nodes.reduce((acc, node) => acc + (node.data?.memoryUsage || 0), 0);
    const heapUsage = nodes.reduce((acc, node) => acc + (node.data?.heapUsage || 0), 0);
    const stackUsage = nodes.reduce((acc, node) => acc + (node.data?.stackUsage || 0), 0);

    // Check for exponential space
    if (memoryUsage > Math.pow(2, n)) {
      return 'O(2ⁿ)';
    }

    // Check for quadratic space
    if (memoryUsage > n * n) {
      return 'O(n²)';
    }

    // Check for linear space
    if (memoryUsage > n) {
      return 'O(n)';
    }

    // Check for logarithmic space
    if (stackUsage > Math.log2(n)) {
      return 'O(log n)';
    }

    // Default to constant space
    return 'O(1)';
  };

  // Calculate metrics whenever nodes or currentStep changes
  React.useEffect(() => {
    if (nodes.length > 0) {
      const steps = nodes.length;
      setTotalSteps(steps);

      // Calculate memory usage from node data with proper null checks
      const memoryData = nodes.map(node => ({
        heap: node.data?.heapUsage || 0,
        stack: node.data?.stackUsage || 0,
        external: node.data?.externalUsage || 0,
        total: (node.data?.heapUsage || 0) + (node.data?.stackUsage || 0) + (node.data?.externalUsage || 0)
      }));

      // Calculate CPU usage based on operation complexity
      const cpuData = nodes.map(node => {
        const baseUsage = 10; // Base CPU usage
        const operationMultiplier = {
          'comparison': 5,
          'swap': 8,
          'recursive': 15,
          'arrayAccess': 3,
          'edgeCase': 7,
          'loop': 10,
          'nestedLoop': 20
        };
        const operationType = node.data?.type || 'default';
        return baseUsage + (operationMultiplier[operationType] || 0);
      });

      // Calculate current metrics with proper initialization
      const currentMetrics = {
        ...metrics, // Preserve existing metrics
        totalTime: Date.now() - metrics.startTime,
        memoryUsage: memoryData.reduce((acc, curr) => acc + (curr.total || 0), 0),
        cpuUsage: Math.min(100, Math.max(0, cpuData.reduce((acc, curr) => acc + curr, 0) / nodes.length)),
        complexity: calculateComplexity(nodes),
        timeHistory: [...(metrics.timeHistory || []), Date.now() - metrics.startTime].slice(-10),
        memoryHistory: [...(metrics.memoryHistory || []), memoryData.reduce((acc, curr) => acc + (curr.total || 0), 0)].slice(-10),
        cpuHistory: [...(metrics.cpuHistory || []), Math.min(100, Math.max(0, cpuData.reduce((acc, curr) => acc + curr, 0) / nodes.length))].slice(-10),
        heapUsage: memoryData.reduce((acc, curr) => acc + (curr.heap || 0), 0),
        stackUsage: memoryData.reduce((acc, curr) => acc + (curr.stack || 0), 0),
        externalUsage: memoryData.reduce((acc, curr) => acc + (curr.external || 0), 0),
        averageTime: calculateAverageTime(nodes),
        minTime: calculateMinTime(nodes),
        maxTime: calculateMaxTime(nodes),
        memoryDistribution: {
          heap: memoryData.reduce((acc, curr) => acc + (curr.heap || 0), 0),
          stack: memoryData.reduce((acc, curr) => acc + (curr.stack || 0), 0),
          external: memoryData.reduce((acc, curr) => acc + (curr.external || 0), 0)
        }
      };

      setMetrics(currentMetrics);
    }
  }, [nodes, currentStep]);

  const calculateAverageTime = (nodes) => {
    const times = nodes.map(node => node.data?.executionTime || 0);
    return times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  };

  const calculateMinTime = (nodes) => {
    const times = nodes.map(node => node.data?.executionTime || 0);
    return times.length ? Math.min(...times) : 0;
  };

  const calculateMaxTime = (nodes) => {
    const times = nodes.map(node => node.data?.executionTime || 0);
    return times.length ? Math.max(...times) : 0;
  };

  return (
    <div className="visual-debugger-graph w-full h-full relative">
      <div className="feature-toolbar glass-pro absolute top-4 right-4 z-10 flex gap-2 p-2 rounded-lg border border-slate-700/50">
        {featureButtons.map(({ id, icon: Icon, label, tooltip }) => (
          <Tooltip key={id} title={tooltip}>
            <button
              className={`feature-button p-2 rounded-lg transition-all duration-200 ${
                activeFeature === id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
              }`}
              onClick={() => toggleFeature(id)}
            >
              <Icon className="w-4 h-4" />
            </button>
          </Tooltip>
        ))}
      </div>

      <div className="main-visualization h-full" style={{ minHeight: '400px' }}>
        <ReactFlowProvider>
          <FlowContent 
            nodes={nodes} 
            edges={edges} 
            onNodesChange={onNodesChange} 
            currentStep={currentStep} 
            loader={loader}
            customizationSettings={customizationSettings}
          />
        </ReactFlowProvider>
      </div>

      <AnimatePresence>
        {activeFeature && (
          <FloatingWindow
            isVisible={true}
            onClose={() => setActiveFeature(null)}
            title={featureButtons.find(f => f.id === activeFeature)?.label || ''}
          >
            {activeFeature === 'timeline' && (
              <Timeline 
                currentStep={currentStep}
                totalSteps={totalSteps}
                onStepChange={(step) => {
                  if (typeof onNodesChange === 'function') {
                    onNodesChange([{ type: 'step', step }]);
                  }
                }}
                markers={markers}
              />
            )}
            {activeFeature === 'metrics' && (
              <PerformanceMetrics metrics={metrics} />
            )}
            {activeFeature === 'multiView' && (
              <MultiViewContainer 
                views={views}
                activeView={activeView}
                onViewChange={setActiveView}
              />
            )}
            {activeFeature === 'learning' && (
              <LearningFeatures 
                currentStep={currentStep}
                explanation={explanation}
                quiz={quiz}
                nodeData={nodes[currentStep]?.data}
              />
            )}
            {activeFeature === 'sharing' && (
              <ShareVisualization
                nodes={nodes}
                edges={edges}
                currentStep={currentStep}
                customizationSettings={customizationSettings}
              />
            )}
            {activeFeature === 'customization' && (
              <CustomizeVisualization
                onSettingsChange={handleCustomizationChange}
                currentSettings={customizationSettings}
              />
            )}
          </FloatingWindow>
        )}
      </AnimatePresence>
      
      {activeFeature === 'performance' && (
        <FloatingWindow
          isVisible={true}
          onClose={() => setActiveFeature(null)}
          title="Performance Metrics"
        >
          <PerformanceMetrics metrics={metrics} />
        </FloatingWindow>
      )}
    </div>
  );
};

export default VisualDebuggerGraph; 