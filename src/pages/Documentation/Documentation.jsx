import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import useDebounce from '../../hooks/useDebounce';
import { 
  Search,
  BookOpen,
  Code2,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Info,
  Terminal,
  FileCode,
  Book,
  Users,
  Lightbulb,
  Zap,
  Star,
  Heart,
  MessageCircle,
  ThumbsUp,
  Loader2,
  ArrowRight,
  Github,
  Globe,
  Download,
  Play,
  Pause,
  Settings,
  HelpCircle,
  Menu,
  X,
  Bot,
  Sparkles,
  GitBranch,
  TestTube
} from 'lucide-react';

const Documentation = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('getting-started');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [filteredSections, setFilteredSections] = useState([]);

  // Add debounced search query with callback
  const debouncedSearchQuery = useDebounce(searchQuery, 300, (value) => {
    setIsLoading(true);
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter sections based on search query
  useEffect(() => {
    const filtered = sections.filter(section => {
      const matchesSearch = section.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                          section.items.some(item => 
                            item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                          );
      return matchesSearch;
    });

    setFilteredSections(filtered);
  }, [debouncedSearchQuery]);

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      items: [
        { id: 'introduction', title: 'Introduction', path: '#introduction' },
        { id: 'installation', title: 'Installation', path: '#installation' },
        { id: 'quick-start', title: 'Quick Start Guide', path: '#quick-start' },
        { id: 'configuration', title: 'Configuration', path: '#configuration' }
      ]
    },
    {
      id: 'core-concepts',
      title: 'Core Concepts',
      icon: Lightbulb,
      items: [
        { id: 'algorithms', title: 'Algorithms', path: '#algorithms' },
        { id: 'data-structures', title: 'Data Structures', path: '#data-structures' },
        { id: 'complexity', title: 'Time & Space Complexity', path: '#complexity' },
        { id: 'best-practices', title: 'Best Practices', path: '#best-practices' }
      ]
    },
    {
      id: 'features',
      title: 'Features',
      icon: Zap,
      items: [
        { id: 'visual-debugger', title: 'Visual Debugger', path: '#visual-debugger' },
        { id: 'ai-assistant', title: 'AI Assistant', path: '#ai-assistant' },
        { id: 'code-analysis', title: 'Code Analysis', path: '#code-analysis' },
        { id: 'performance', title: 'Performance Optimization', path: '#performance' }
      ]
    },
    {
      id: 'api-reference',
      title: 'API Reference',
      icon: Code2,
      items: [
        { id: 'endpoints', title: 'API Endpoints', path: '#endpoints' },
        { id: 'authentication', title: 'Authentication', path: '#authentication' },
        { id: 'rate-limits', title: 'Rate Limits', path: '#rate-limits' },
        { id: 'error-handling', title: 'Error Handling', path: '#error-handling' }
      ]
    },
    {
      id: 'tutorials',
      title: 'Tutorials',
      icon: Book,
      items: [
        { id: 'sorting', title: 'Sorting Algorithms', path: '#sorting' },
        { id: 'searching', title: 'Searching Algorithms', path: '#searching' },
        { id: 'graphs', title: 'Graph Algorithms', path: '#graphs' },
        { id: 'dynamic-programming', title: 'Dynamic Programming', path: '#dynamic-programming' }
      ]
    }
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement search logic
  };

  const handleCopyCode = (codeId) => {
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-6 left-6 z-50 p-3 rounded-xl bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 backdrop-blur-sm border border-slate-700/50 shadow-lg transition-all duration-200 hover:scale-105"
      >
        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed top-0 left-0 h-full w-45 bg-navy-900/95 border-r border-slate-800/50 z-40 overflow-y-auto backdrop-blur-sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-2.5">
              <BookOpen className="w-full h-full text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Documentation</span>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <section.icon className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-200 font-medium">{section.title}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      activeSection === section.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeSection === section.id && (
                  <div className="mt-2 ml-8 space-y-2">
                    {section.items.map((item) => (
                      <a
                        key={item.id}
                        href={item.path}
                        className="block py-2 text-slate-400 hover:text-emerald-400 transition-colors"
                      >
                        {item.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`lg:ml-80 min-h-screen ${isSidebarOpen ? 'ml-80' : 'ml-0'} pt-24`}>
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-slate-100">
                Welcome to CodeStream Documentation
              </h1>
              <p className="text-xl text-slate-400">
                Your comprehensive guide to using CodeStream's powerful features for algorithm visualization and learning.
              </p>
            </div>

            {/* Quick Links */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Zap,
                  title: "Quick Start",
                  description: "Get up and running in minutes",
                  href: "#quick-start"
                },
                {
                  icon: Code2,
                  title: "API Reference",
                  description: "Detailed API documentation",
                  href: "#api-reference"
                },
                {
                  icon: Book,
                  title: "Tutorials",
                  description: "Step-by-step guides",
                  href: "#tutorials"
                }
              ].map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-pro rounded-2xl border border-slate-700/50 p-6 space-y-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3">
                    <link.icon className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">
                      {link.title}
                    </h3>
                    <p className="text-slate-400">
                      {link.description}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.section>

          {/* Installation */}
          <motion.section
            id="installation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-100">
                Installation
              </h2>
              <p className="text-slate-400">
                Get started with CodeStream by installing it in your project.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-200">
                Using npm
              </h3>
              <div className="relative">
                <button
                  onClick={() => handleCopyCode('npm')}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {copiedCode === 'npm' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                  <code className="text-slate-300">
                    npm install codestream
                  </code>
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-200">
                Using yarn
              </h3>
              <div className="relative">
                <button
                  onClick={() => handleCopyCode('yarn')}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {copiedCode === 'yarn' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
                <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                  <code className="text-slate-300">
                    yarn add codestream
                  </code>
                </pre>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-200">
                Requirements
              </h3>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Node.js 16.0 or higher
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Modern web browser with JavaScript enabled
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Internet connection for AI features
                </li>
              </ul>
            </div>
          </motion.section>

          {/* API Reference */}
          <motion.section
            id="api-reference"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-100">
                API Reference
              </h2>
              <p className="text-slate-400">
                Comprehensive documentation of CodeStream's API endpoints and methods.
              </p>
            </div>

            {/* Visual Debugger API */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Visual Debugger
              </h3>
              <div className="space-y-4">
                <div className="glass-pro rounded-xl border border-slate-700/50 p-6">
                  <h4 className="text-lg font-medium text-slate-200 mb-2">
                    initializeDebugger
                  </h4>
                  <p className="text-slate-400 mb-4">
                    Initializes the visual debugger with custom configuration options.
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => handleCopyCode('init-debugger')}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {copiedCode === 'init-debugger' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                      <code className="text-slate-300">
                        {`const debugger = new CodeStream.Debugger({
  speed: 'medium',
  theme: 'dark',
  showVariables: true,
  showCallStack: true
});`}
                      </code>
                    </pre>
                  </div>
                </div>

                <div className="glass-pro rounded-xl border border-slate-700/50 p-6">
                  <h4 className="text-lg font-medium text-slate-200 mb-2">
                    startVisualization
                  </h4>
                  <p className="text-slate-400 mb-4">
                    Starts the visualization of an algorithm with the provided input data.
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => handleCopyCode('start-viz')}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {copiedCode === 'start-viz' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                      <code className="text-slate-300">
                        {`debugger.startVisualization({
  algorithm: 'quicksort',
  input: [5, 2, 9, 1, 5, 6],
  options: {
    highlightActive: true,
    showComparisons: true
  }
});`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Assistant API */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                AI Assistant
              </h3>
              <div className="space-y-4">
                <div className="glass-pro rounded-xl border border-slate-700/50 p-6">
                  <h4 className="text-lg font-medium text-slate-200 mb-2">
                    askAI
                  </h4>
                  <p className="text-slate-400 mb-4">
                    Sends a query to the AI assistant and returns a response.
                  </p>
                  <div className="relative">
                    <button
                      onClick={() => handleCopyCode('ask-ai')}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {copiedCode === 'ask-ai' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                      <code className="text-slate-300">
                        {`const response = await CodeStream.AI.ask({
  query: "Explain how quicksort works",
  context: "I'm learning sorting algorithms",
  options: {
    includeCode: true,
    includeVisualization: true
  }
});`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tutorials */}
          <motion.section
            id="tutorials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-100">
                Tutorials
              </h2>
              <p className="text-slate-400">
                Step-by-step guides to help you master CodeStream's features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Getting Started with Visual Debugger",
                  description: "Learn how to use the visual debugger to understand algorithms",
                  icon: Code2,
                  href: "#tutorial-debugger"
                },
                {
                  title: "Using the AI Assistant",
                  description: "Master the AI assistant for better learning",
                  icon: Bot,
                  href: "#tutorial-ai"
                },
                {
                  title: "Creating Custom Visualizations",
                  description: "Build your own algorithm visualizations",
                  icon: Sparkles,
                  href: "#tutorial-custom"
                },
                {
                  title: "Advanced Features",
                  description: "Explore advanced features and techniques",
                  icon: Zap,
                  href: "#tutorial-advanced"
                }
              ].map((tutorial, index) => (
                <motion.a
                  key={index}
                  href={tutorial.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-pro rounded-2xl border border-slate-700/50 p-6 space-y-4 hover:border-purple-500/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3">
                    <tutorial.icon className="w-full h-full text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200">
                      {tutorial.title}
                    </h3>
                    <p className="text-slate-400">
                      {tutorial.description}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.section>

          {/* Best Practices */}
          <motion.section
            id="best-practices"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-100">
                Best Practices
              </h2>
              <p className="text-slate-400">
                Follow these guidelines to get the most out of CodeStream.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  title: "Optimize Performance",
                  description: "Use appropriate data structures and algorithms for your use case. Consider time and space complexity when choosing solutions.",
                  icon: Zap
                },
                {
                  title: "Write Clean Code",
                  description: "Follow consistent coding style and naming conventions. Document your code with clear comments and examples.",
                  icon: Code2
                },
                {
                  title: "Use Version Control",
                  description: "Keep track of your changes and collaborate effectively using version control systems like Git.",
                  icon: GitBranch
                },
                {
                  title: "Test Thoroughly",
                  description: "Write comprehensive tests for your code. Include edge cases and error handling in your test suite.",
                  icon: TestTube
                }
              ].map((practice, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-pro rounded-xl border border-slate-700/50 p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-2 flex-shrink-0">
                      <practice.icon className="w-full h-full text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200">
                        {practice.title}
                      </h3>
                      <p className="text-slate-400 mt-2">
                        {practice.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Feedback Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16"
          >
            <div className="glass-pro rounded-2xl border border-slate-700/50 p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">
                Was this documentation helpful?
              </h2>
              <div className="flex items-center justify-center gap-4">
                <button className="px-6 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
                  Yes
                </button>
                <button className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                  No
                </button>
              </div>
            </div>
          </motion.section>

          {/* Getting Started Section */}
          <motion.section
            id="getting-started"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-100">
                Getting Started
              </h2>
              <p className="text-slate-400">
                Learn the basics of CodeStream and get started with algorithm visualization.
              </p>
            </div>

            {/* Introduction */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Introduction
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  CodeStream is a powerful platform for learning and visualizing algorithms. It provides:
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Interactive algorithm visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    AI-powered code assistance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Comprehensive algorithm library
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Real-time debugging capabilities
                  </li>
                </ul>
              </div>
            </div>

            {/* Quick Start Guide */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Quick Start Guide
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-slate-200">
                    1. Install CodeStream
                  </h4>
                  <div className="relative">
                    <button
                      onClick={() => handleCopyCode('quick-start-install')}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {copiedCode === 'quick-start-install' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                      <code className="text-slate-300">
                        npm install codestream
                      </code>
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-slate-200">
                    2. Initialize the Visual Debugger
                  </h4>
                  <div className="relative">
                    <button
                      onClick={() => handleCopyCode('quick-start-init')}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {copiedCode === 'quick-start-init' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                      <code className="text-slate-300">
                        {`import { VisualDebugger } from 'codestream';

const debugger = new VisualDebugger({
  container: '#visualization',
  theme: 'dark'
});`}
                      </code>
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-slate-200">
                    3. Start Visualizing
                  </h4>
                  <div className="relative">
                    <button
                      onClick={() => handleCopyCode('quick-start-viz')}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {copiedCode === 'quick-start-viz' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                      <code className="text-slate-300">
                        {`debugger.visualize({
  algorithm: 'quicksort',
  input: [5, 2, 9, 1, 5, 6]
});`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Configuration
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  CodeStream can be configured to match your preferences and requirements.
                </p>
                <div className="relative">
                  <button
                    onClick={() => handleCopyCode('config')}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {copiedCode === 'config' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                  <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                    <code className="text-slate-300">
                      {`const config = {
  theme: 'dark',
  animationSpeed: 'medium',
  showVariables: true,
  showCallStack: true,
  language: 'javascript',
  autoPlay: false,
  highlightActive: true
};`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Core Concepts Section */}
          <motion.section
            id="core-concepts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-100">
                Core Concepts
              </h2>
              <p className="text-slate-400">
                Understand the fundamental concepts behind CodeStream's features.
              </p>
            </div>

            {/* Algorithms */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Algorithms
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  CodeStream supports a wide range of algorithms across different categories:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Sorting', examples: 'QuickSort, MergeSort, HeapSort' },
                    { name: 'Searching', examples: 'Binary Search, Linear Search' },
                    { name: 'Graph', examples: 'Dijkstra, BFS, DFS' },
                    { name: 'Dynamic Programming', examples: 'Knapsack, LCS, Matrix Chain' }
                  ].map((category, index) => (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-xl">
                      <h4 className="text-lg font-medium text-slate-200 mb-2">
                        {category.name}
                      </h4>
                      <p className="text-slate-400">
                        {category.examples}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Data Structures */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Data Structures
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  Visualize and understand common data structures:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Arrays & Lists', complexity: 'O(1) access, O(n) search' },
                    { name: 'Trees', complexity: 'O(log n) operations' },
                    { name: 'Graphs', complexity: 'O(V + E) traversal' },
                    { name: 'Hash Tables', complexity: 'O(1) average case' }
                  ].map((structure, index) => (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-xl">
                      <h4 className="text-lg font-medium text-slate-200 mb-2">
                        {structure.name}
                      </h4>
                      <p className="text-slate-400">
                        {structure.complexity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Time & Space Complexity */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Time & Space Complexity
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  Understanding algorithm complexity is crucial for optimization:
                </p>
                <div className="space-y-4">
                  {[
                    { notation: 'O(1)', description: 'Constant time - operations take the same time regardless of input size' },
                    { notation: 'O(log n)', description: 'Logarithmic time - operations are divided in half each time' },
                    { notation: 'O(n)', description: 'Linear time - operations grow linearly with input size' },
                    { notation: 'O(n log n)', description: 'Linearithmic time - common in efficient sorting algorithms' },
                    { notation: 'O(n²)', description: 'Quadratic time - operations grow exponentially with input size' }
                  ].map((complexity, index) => (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-xl">
                      <h4 className="text-lg font-medium text-slate-200 mb-2">
                        {complexity.notation}
                      </h4>
                      <p className="text-slate-400">
                        {complexity.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section
            id="features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-100">
                Features
              </h2>
              <p className="text-slate-400">
                Explore CodeStream's powerful features for algorithm visualization and learning.
              </p>
            </div>

            {/* Visual Debugger */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Visual Debugger
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  Step through algorithms with our interactive visual debugger:
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Real-time variable tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Step-by-step execution
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Call stack visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Memory usage tracking
                  </li>
                </ul>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                AI Assistant
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  Get intelligent assistance with your algorithms:
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Code optimization suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Algorithm explanations
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Bug detection and fixes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Best practice recommendations
                  </li>
                </ul>
              </div>
            </div>

            {/* Code Analysis */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Code Analysis
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  Analyze your code for performance and quality:
                </p>
                <ul className="space-y-2 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Complexity analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Code quality metrics
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Performance profiling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    Memory usage analysis
                  </li>
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Tutorials Section */}
          <motion.section
            id="tutorials"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-slate-100">
                Tutorials
              </h2>
              <p className="text-slate-400">
                Step-by-step guides to help you master different algorithms and features.
              </p>
            </div>

            {/* Sorting Algorithms */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Sorting Algorithms
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  Learn about different sorting algorithms and their implementations:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'QuickSort', complexity: 'O(n log n)', description: 'Efficient comparison-based sorting' },
                    { name: 'MergeSort', complexity: 'O(n log n)', description: 'Stable sorting with guaranteed performance' },
                    { name: 'HeapSort', complexity: 'O(n log n)', description: 'In-place sorting using binary heap' },
                    { name: 'BubbleSort', complexity: 'O(n²)', description: 'Simple but inefficient sorting' }
                  ].map((algorithm, index) => (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-xl">
                      <h4 className="text-lg font-medium text-slate-200 mb-2">
                        {algorithm.name}
                      </h4>
                      <p className="text-slate-400 text-sm mb-2">
                        {algorithm.complexity}
                      </p>
                      <p className="text-slate-400">
                        {algorithm.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Searching Algorithms */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Searching Algorithms
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  Master different searching techniques:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Binary Search', complexity: 'O(log n)', description: 'Efficient search in sorted arrays' },
                    { name: 'Linear Search', complexity: 'O(n)', description: 'Simple sequential search' },
                    { name: 'Jump Search', complexity: 'O(√n)', description: 'Block-based search in sorted arrays' },
                    { name: 'Interpolation Search', complexity: 'O(log log n)', description: 'Improved binary search for uniform distributions' }
                  ].map((algorithm, index) => (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-xl">
                      <h4 className="text-lg font-medium text-slate-200 mb-2">
                        {algorithm.name}
                      </h4>
                      <p className="text-slate-400 text-sm mb-2">
                        {algorithm.complexity}
                      </p>
                      <p className="text-slate-400">
                        {algorithm.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Graph Algorithms */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-200">
                Graph Algorithms
              </h3>
              <div className="glass-pro rounded-xl border border-slate-700/50 p-6 space-y-4">
                <p className="text-slate-400">
                  Explore graph algorithms and their applications:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Dijkstra\'s Algorithm', complexity: 'O((V + E) log V)', description: 'Shortest path in weighted graphs' },
                    { name: 'Breadth-First Search', complexity: 'O(V + E)', description: 'Level-order traversal and shortest path' },
                    { name: 'Depth-First Search', complexity: 'O(V + E)', description: 'Graph traversal and cycle detection' },
                    { name: 'Kruskal\'s Algorithm', complexity: 'O(E log E)', description: 'Minimum spanning tree' }
                  ].map((algorithm, index) => (
                    <div key={index} className="p-4 bg-slate-800/30 rounded-xl">
                      <h4 className="text-lg font-medium text-slate-200 mb-2">
                        {algorithm.name}
                      </h4>
                      <p className="text-slate-400 text-sm mb-2">
                        {algorithm.complexity}
                      </p>
                      <p className="text-slate-400">
                        {algorithm.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Documentation; 