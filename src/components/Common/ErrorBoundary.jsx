import React, { Component } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  ChevronDown, 
  ChevronUp,
  Home,
  Bug,
  HelpCircle,
  Share2,
  Download
} from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      isCopying: false,
      isReloading: false,
      showShareOptions: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary Caught:", error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    this.setState({ isReloading: true });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };

  copyErrorToClipboard = async () => {
    this.setState({ isCopying: true });
    const errorDetails = {
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      setTimeout(() => this.setState({ isCopying: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
      this.setState({ isCopying: false });
    }
  };

  handleShare = async () => {
    this.setState({ showShareOptions: true });
    try {
      const errorDetails = {
        error: this.state.error?.toString(),
        timestamp: new Date().toISOString()
      };
      await navigator.share({
        title: 'Error Report',
        text: `Error: ${errorDetails.error}`,
        url: window.location.href
      });
    } catch (err) {
      console.error('Failed to share:', err);
    }
    this.setState({ showShareOptions: false });
  };

  handleExport = () => {
    const errorDetails = {
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(errorDetails, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    const { hasError, error, errorInfo, showDetails, isCopying, isReloading, showShareOptions } = this.state;
    const { fallback } = this.props;

    if (hasError) {
      if (fallback) return fallback;

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950 flex items-center justify-center p-4 overflow-hidden"
        >
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-950/50 z-10" />
          
          {/* Floating Elements with Enhanced Animation */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none animate-[pulse_8s_ease-in-out_infinite_2s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-[pulse_8s_ease-in-out_infinite_4s]" />
          
          {/* Enhanced Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          
          {/* Animated Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white/10 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${5 + Math.random() * 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 max-w-4xl w-full"
          >
            <div className="glass-pro rounded-2xl border border-slate-700/50 p-8 md:p-12 backdrop-blur-xl bg-slate-900/30 relative overflow-hidden">
              {/* Inner Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-blue-500/5 opacity-50" />
              
              {/* Header Section with Enhanced Animation */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-12 relative"
              >
                <motion.div
                  initial={{ rotate: -10, y: 20 }}
                  animate={{ rotate: 0, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-28 h-28 mx-auto mb-8"
                >
                  {/* Outer glow */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-full blur-2xl animate-[pulse_4s_ease-in-out_infinite]" />
                  
                  {/* Middle glow */}
                  <div className="absolute -inset-2 bg-gradient-to-br from-rose-500/30 to-orange-500/30 rounded-full blur-xl animate-[pulse_4s_ease-in-out_infinite_1s]" />
                  
                  {/* Inner container */}
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/40 to-orange-500/40 rounded-3xl p-6 backdrop-blur-sm">
                    <div className="relative w-full h-full">
                      {/* Icon shadow */}
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-orange-500/20 blur-md" />
                      
                      {/* Icon */}
                      <AlertTriangle className="w-full h-full text-white drop-shadow-lg relative z-10" />
                      
                      {/* Animated rings */}
                      <div className="absolute inset-0 rounded-3xl border-2 border-rose-500/20 animate-[spin_8s_linear_infinite]" />
                      <div className="absolute inset-0 rounded-3xl border-2 border-orange-500/20 animate-[spin_8s_linear_infinite_reverse]" />
                    </div>
                  </div>
                  
                  {/* Floating particles */}
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white/30 rounded-full"
                      style={{
                        left: `${25 + i * 25}%`,
                        top: `${25 + i * 25}%`,
                      }}
                      animate={{
                        y: [0, -10, 0],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </motion.div>
                
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-6xl font-bold mb-6 relative"
                >
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-rose-400 via-orange-400 to-rose-400 bg-clip-text text-transparent relative z-10">
                      Oops!
                    </span>
                    <div className="absolute -inset-2 bg-gradient-to-r from-rose-500/30 to-orange-500/30 blur-xl -z-10 rounded-full" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 to-orange-500/20 blur-md -z-10 rounded-full" />
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl text-slate-300 mb-2 font-medium"
                >
                  Something went wrong
                </motion.p>
                
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-400 text-lg max-w-2xl mx-auto"
                >
                  We apologize for the inconvenience. An error has occurred in the application.
                </motion.p>
              </motion.div>

              {/* Error Details Section with Enhanced Styling */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-12"
                  >
                    <div className="glass-pro rounded-2xl border border-slate-700/50 p-8 backdrop-blur-xl bg-slate-900/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-blue-500/5 opacity-50" />
                      
                      <div className="flex items-center gap-4 mb-6 relative">
                        <div className="relative w-12 h-12">
                          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-rose-600/20 rounded-xl blur-md animate-[pulse_4s_ease-in-out_infinite]" />
                          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 to-rose-600/30 rounded-xl p-3 text-rose-400 backdrop-blur-sm">
                            <Bug className="w-full h-full drop-shadow-lg" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-white mb-1">
                            {error.name}
                          </h3>
                          <p className="text-slate-200">
                            {error.message}
                          </p>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {showDetails && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-6">
                              <div className="bg-slate-900/80 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-blue-500/5 opacity-50" />
                                <h4 className="text-sm font-medium text-white mb-3">Stack Trace</h4>
                                <pre className="text-sm text-slate-200 overflow-x-auto p-4 bg-slate-800/80 rounded-lg relative font-mono">
                                  {error.stack}
                                </pre>
                              </div>
                              {errorInfo && (
                                <div className="bg-slate-900/80 rounded-xl p-6 backdrop-blur-xl relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-blue-500/5 opacity-50" />
                                  <h4 className="text-sm font-medium text-white mb-3">Component Stack</h4>
                                  <pre className="text-sm text-slate-200 overflow-x-auto p-4 bg-slate-800/80 rounded-lg relative font-mono">
                                    {errorInfo.componentStack}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons with Enhanced Styling */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleReload}
                  disabled={isReloading}
                  className="glass-pro rounded-xl border border-slate-700/50 p-5 flex items-center justify-center gap-3 text-slate-200 hover:border-emerald-500/50 transition-all backdrop-blur-xl bg-slate-900/30 hover:bg-emerald-500/10 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2 text-emerald-400 group-hover:from-emerald-500/30 group-hover:to-emerald-600/30 transition-all duration-300 backdrop-blur-sm">
                    <RefreshCw className={`w-full h-full drop-shadow-lg ${isReloading ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Reload Page</div>
                    <div className="text-sm text-slate-400">{isReloading ? 'Reloading...' : 'Try again'}</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.toggleDetails}
                  className="glass-pro rounded-xl border border-slate-700/50 p-5 flex items-center justify-center gap-3 text-slate-200 hover:border-blue-500/50 transition-all backdrop-blur-xl bg-slate-900/30 hover:bg-blue-500/10 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-2 text-blue-400 group-hover:from-blue-500/30 group-hover:to-blue-600/30 transition-all duration-300 backdrop-blur-sm">
                    {showDetails ? <ChevronUp className="w-full h-full drop-shadow-lg" /> : <ChevronDown className="w-full h-full drop-shadow-lg" />}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{showDetails ? 'Hide Details' : 'Show Details'}</div>
                    <div className="text-sm text-slate-400">View error information</div>
                  </div>
                </motion.button>

                <motion.a
                  href="/"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-pro rounded-xl border border-slate-700/50 p-5 flex items-center justify-center gap-3 text-slate-200 hover:border-violet-500/50 transition-all backdrop-blur-xl bg-slate-900/30 hover:bg-violet-500/10 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/20 p-2 text-violet-400 group-hover:from-violet-500/30 group-hover:to-violet-600/30 transition-all duration-300 backdrop-blur-sm">
                    <Home className="w-full h-full drop-shadow-lg" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Go Home</div>
                    <div className="text-sm text-slate-400">Return to homepage</div>
                  </div>
                </motion.a>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.copyErrorToClipboard}
                  disabled={isCopying}
                  className="glass-pro rounded-xl border border-slate-700/50 p-4 flex items-center justify-center gap-3 text-slate-200 hover:border-purple-500/50 transition-all backdrop-blur-xl bg-slate-900/30 hover:bg-purple-500/10 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-1.5 text-purple-400 group-hover:from-purple-500/30 group-hover:to-purple-600/30 transition-all duration-300 backdrop-blur-sm">
                    <Copy className="w-full h-full drop-shadow-lg" />
                  </div>
                  <span>{isCopying ? 'Copied!' : 'Copy Error'}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleShare}
                  className="glass-pro rounded-xl border border-slate-700/50 p-4 flex items-center justify-center gap-3 text-slate-200 hover:border-indigo-500/50 transition-all backdrop-blur-xl bg-slate-900/30 hover:bg-indigo-500/10 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 p-1.5 text-indigo-400 group-hover:from-indigo-500/30 group-hover:to-indigo-600/30 transition-all duration-300 backdrop-blur-sm">
                    <Share2 className="w-full h-full drop-shadow-lg" />
                  </div>
                  <span>Share Error</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={this.handleExport}
                  className="glass-pro rounded-xl border border-slate-700/50 p-4 flex items-center justify-center gap-3 text-slate-200 hover:border-cyan-500/50 transition-all backdrop-blur-xl bg-slate-900/30 hover:bg-cyan-500/10 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 p-1.5 text-cyan-400 group-hover:from-cyan-500/30 group-hover:to-cyan-600/30 transition-all duration-300 backdrop-blur-sm">
                    <Download className="w-full h-full drop-shadow-lg" />
                  </div>
                  <span>Export Report</span>
                </motion.button>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-slate-400 mt-8 text-sm"
              >
                If the problem persists, please contact our support team with the error details.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;