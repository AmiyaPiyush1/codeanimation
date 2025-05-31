import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles,
  Bug,
  Zap,
  Star,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Code2,
  Bot,
  Brain,
  FileCode,
  Terminal,
  Book,
  Users,
  Settings,
  Shield,
  Lock,
  Globe,
  Clock,
  History
} from 'lucide-react';

const Changelog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const changelogData = [
    {
      version: '1.2.0',
      date: 'March 15, 2025',
      type: 'major',
      title: 'Major Feature Update',
      description: 'The initial release of CodeStream, bringing powerful algorithm visualization and learning tools to developers worldwide.',
      features: [
        {
          icon: Code2,
          title: 'Visual Debugger',
          description: 'Interactive visualization of algorithms with step-by-step execution'
        },
        {
          icon: Bot,
          title: 'AI Assistant',
          description: 'Smart coding assistant for algorithm explanations and solutions'
        },
        {
          icon: Brain,
          title: 'Algorithm Library',
          description: 'Comprehensive collection of algorithms with detailed explanations'
        }
      ],
      improvements: [
        'Initial platform setup and infrastructure',
        'Core visualization engine implementation',
        'Basic user authentication system'
      ],
      fixes: [
        'Performance optimization for large datasets',
        'UI responsiveness improvements'
      ]
    },
    {
      version: '1.1.0',
      date: 'March 1, 2025',
      type: 'beta',
      title: 'Performance Improvements',
      description: 'Final beta release before our official launch, featuring enhanced stability and performance improvements.',
      features: [
        {
          icon: FileCode,
          title: 'Code Editor',
          description: 'Advanced code editor with syntax highlighting and auto-completion'
        },
        {
          icon: Terminal,
          title: 'Interactive Console',
          description: 'Real-time code execution and debugging capabilities'
        }
      ],
      improvements: [
        'Enhanced algorithm visualization performance',
        'Improved user interface responsiveness',
        'Extended documentation coverage'
      ],
      fixes: [
        'Fixed memory leaks in visualization engine',
        'Resolved UI scaling issues on high-DPI displays'
      ]
    },
    {
      version: '1.0.0',
      date: 'February 15, 2025',
      type: 'beta',
      title: 'Initial Release',
      description: 'Introducing community features and enhanced collaboration tools.',
      features: [
        {
          icon: Users,
          title: 'Community Forum',
          description: 'Discussion platform for algorithm enthusiasts'
        },
        {
          icon: Book,
          title: 'Learning Paths',
          description: 'Structured learning journeys for different skill levels'
        }
      ],
      improvements: [
        'Enhanced user profile system',
        'Improved content organization',
        'Better search functionality'
      ],
      fixes: [
        'Fixed authentication token refresh issues',
        'Resolved forum post formatting problems'
      ]
    }
  ];

  const getVersionColor = (type) => {
    switch (type) {
      case 'major':
        return 'from-purple-500 to-purple-600';
      case 'beta':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getVersionIcon = (type) => {
    switch (type) {
      case 'major':
        return <Sparkles className="w-5 h-5" />;
      case 'beta':
        return <Zap className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
      {/* Hero Section */}
      <section className="relative pt-64 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-purple-500/20 mb-8 interactive-element">
              <History className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Version History</span>
            </div>

            <motion.h1 
              className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.2] min-h-[1.2em]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.span 
                className="text-slate-200/90 inline-block align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Product
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Changelog
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Track the evolution of CodeStream. From major releases to minor updates,
              stay informed about the latest features, improvements, and fixes.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Changelog Entries */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-12">
            {changelogData.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-pro rounded-2xl border border-slate-700/50 overflow-hidden"
              >
                {/* Version Header */}
                <div className="p-6 border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getVersionColor(entry.type)} rounded-xl p-3`}>
                        {getVersionIcon(entry.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-slate-100">
                            v{entry.version}
                          </h2>
                          <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-sm rounded-full">
                            {entry.type}
                          </span>
                        </div>
                        <p className="text-slate-400">
                          {entry.date}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-slate-300">
                    {entry.description}
                  </p>
                </div>

                {/* Features */}
                {entry.features && entry.features.length > 0 && (
                  <div className="p-6 border-b border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">
                      New Features
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {entry.features.map((feature, featureIndex) => (
                        <div
                          key={featureIndex}
                          className="flex items-start gap-3 p-4 bg-slate-800/30 rounded-xl"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-1.5 flex-shrink-0">
                            <feature.icon className="w-full h-full text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-200">
                              {feature.title}
                            </h4>
                            <p className="text-sm text-slate-400">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Improvements */}
                {entry.improvements && entry.improvements.length > 0 && (
                  <div className="p-6 border-b border-slate-700/50">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">
                      Improvements
                    </h3>
                    <ul className="space-y-2">
                      {entry.improvements.map((improvement, improvementIndex) => (
                        <li key={improvementIndex} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300">
                            {improvement}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fixes */}
                {entry.fixes && entry.fixes.length > 0 && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-slate-200 mb-4">
                      Bug Fixes
                    </h3>
                    <ul className="space-y-2">
                      {entry.fixes.map((fix, fixIndex) => (
                        <li key={fixIndex} className="flex items-start gap-2">
                          <Bug className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300">
                            {fix}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Changelog; 