import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { HelpCircle, Search, BookOpen, MessageCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const HelpCenter = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [expandedSections, setExpandedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpen,
      color: 'text-emerald-400',
      articles: [
        {
          title: 'How to Create an Account',
          content: `Creating an account on CodeStream is easy:

          1. Click the "Sign Up" button in the top right corner
          2. Enter your email address and choose a password
          3. Verify your email address
          4. Complete your profile information
          5. Start exploring CodeStream!`
        },
        {
          title: 'Understanding the Interface',
          content: `The CodeStream interface is designed to be intuitive:

          • Navigation Bar: Access different sections
          • Code Editor: Write and test your code
          • Visualization Panel: See algorithm animations
          • Progress Tracker: Monitor your learning
          • Settings: Customize your experience`
        }
      ]
    },
    {
      id: 'features',
      title: 'Features & Tools',
      icon: HelpCircle,
      color: 'text-blue-400',
      articles: [
        {
          title: 'Interactive Algorithm Visualizations',
          content: `Our interactive visualizations help you understand algorithms:

          • Step-by-step animations
          • Real-time code execution
          • Visual representation of data structures
          • Performance metrics
          • Customizable visualization settings`
        },
        {
          title: 'Code Editor Features',
          content: `The CodeStream code editor includes:

          • Syntax highlighting
          • Auto-completion
          • Error detection
          • Code formatting
          • Multiple language support
          • Custom themes`
        }
      ]
    },
    {
      id: 'support',
      title: 'Support & Contact',
      icon: MessageCircle,
      color: 'text-purple-400',
      articles: [
        {
          title: 'Contacting Support',
          content: `Need help? Here's how to reach us:

          • Email: support@codestream.com
          • Live Chat: Available 24/7
          • Community Forum: Get help from other users
          • Documentation: Detailed guides and tutorials
          • Social Media: Follow us for updates`
        },
        {
          title: 'Reporting Issues',
          content: `Found a bug or have a suggestion?

          1. Click the "Report Issue" button
          2. Select the issue type
          3. Provide detailed description
          4. Include screenshots if possible
          5. Submit and track your report`
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <section ref={sectionRef} className="relative min-h-screen pt-64 pb-24 bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-emerald-500/20 mb-8 interactive-element"
          >
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300">Help Center</span>
          </motion.div>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <span className="text-slate-100">How can we</span>{" "}
            <span className="gradient-text">help you?</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12">
            Find answers to common questions, learn about our features, and get support 
            for any issues you might encounter.
          </p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/50 transition-colors duration-300"
              />
              <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Help Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {filteredCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              className="glass-pro rounded-2xl border border-slate-700/50 overflow-hidden"
            >
              <motion.button
                onClick={() => toggleSection(category.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-800/50 transition-colors duration-300"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    className={`w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 ${category.color} shadow-soft`}
                  >
                    <category.icon className="w-full h-full" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-slate-100">
                    {category.title}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: expandedSections[category.id] ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {expandedSections[category.id] ? (
                    <ChevronUp className="w-6 h-6 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                  )}
                </motion.div>
              </motion.button>

              <motion.div
                initial={false}
                animate={{
                  height: expandedSections[category.id] ? 'auto' : 0,
                  opacity: expandedSections[category.id] ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 space-y-6">
                  {category.articles.map((article, articleIndex) => (
                    <motion.div
                      key={articleIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: articleIndex * 0.1 }}
                      className="glass-pro rounded-xl border border-slate-700/30 p-6"
                    >
                      <h4 className="text-lg font-semibold text-slate-100 mb-4">
                        {article.title}
                      </h4>
                      <div className="prose prose-invert max-w-none">
                        <pre className="text-slate-300 whitespace-pre-wrap font-sans">
                          {article.content}
                        </pre>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-slate-400 mb-6">
            Still need help? Our support team is here for you.
          </p>
          <motion.a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact Support
            <ExternalLink className="w-5 h-5" />
          </motion.a>
        </motion.div>

        {/* Background Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </section>
  );
};

export default HelpCenter; 