import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Code2, 
  Book, 
  Users, 
  ArrowRight,
  ExternalLink,
  Heart,
  ChevronUp,
  Globe,
  Sparkles,
  Star,
  Zap,
  Shield,
  Award,
  Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [email, setEmail] = useState('');
  const { scrollYProgress } = useScroll();
  
  // Optimize scroll progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 50, // Reduced from 100
    damping: 20,   // Reduced from 30
    restDelta: 0.001
  });

  // Smooth scroll progress bar
  const progressBar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Parallax effect for background elements
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Optimize animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reduced from 0.1
        delayChildren: 0.1     // Reduced from 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 }, // Reduced y from 20
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,  // Reduced from 100
        damping: 10     // Reduced from 15
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const footerLinks = {
    Product: [
      { name: "Visual Debugger", href: "/debugger", isNew: false },
      { name: "AI Assistant", href: "/ai-assistant", isNew: true },
      { name: "Algorithm Library", href: "/algorithms", isNew: false },
      { name: "Interactive Demos", href: "#", isNew: false },
      { name: "Documentation", href: "/docs", isNew: false },
      { name: "Changelog", href: "/changelog", isNew: false },
    ],
    Resources: [
      { name: "Documentation", href: "#", isNew: false },
      { name: "Learning Paths", href: "#", isNew: false },
      { name: "Blog & Tutorials", href: "#", isNew: false },
      { name: "Community Forum", href: "/forum", isNew: false },
    ],
    Company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Documentation", href: "/docs" },
    ],
    Support: [
      { name: "Help Center", href: "/help", isNew: false },
      { name: "Privacy Policy", href: "/privacy", isNew: false },
      { name: "Terms of Service", href: "/terms", isNew: false },
      { name: "Cookie Settings", href: "/cookies", isNew: false },
    ]
  };

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub", color: "hover:text-slate-300" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-500" },
    { icon: Mail, href: "#", label: "Email", color: "hover:text-emerald-400" },
  ];

  const stats = [
    { icon: Users, value: "50K+", label: "Active Learners", color: "text-emerald-400" },
    { icon: Star, value: "4.9", label: "User Rating", color: "text-yellow-400" },
    { icon: Zap, value: "98%", label: "Success Rate", color: "text-blue-400" },
    { icon: Award, value: "15+", label: "Languages", color: "text-purple-400" }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setShowNewsletter(false);
    setEmail('');
  };

  return (
    <footer className="relative bg-navy-950 border-t border-slate-800/50 overflow-hidden">
      {/* Optimized Progress Bar */}
      <motion.div
        className="scroll-progress"
        style={{ 
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '2px', // Reduced from 3px
          background: 'linear-gradient(to right, #3B82F6, #10B981)',
          transformOrigin: '0%',
          zIndex: 9999
        }}
      />

      {/* Optimized Background Elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y }}
      >
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" /> {/* Reduced size and blur */}
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl" /> {/* Reduced size and blur */}
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl" /> {/* Reduced size and blur */}
      </motion.div>

      {/* Main Footer Content */}
      <section className="py-12 relative overflow-hidden"> {/* Reduced padding */}
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl" // Reduced size and blur
            animate={{
              scale: [1, 1.1, 1], // Reduced scale
              rotate: [0, 30, 0], // Reduced rotation
              opacity: [0.2, 0.3, 0.2] // Reduced opacity
            }}
            transition={{
              duration: 15, // Increased duration
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gradient-to-tr from-emerald-500/5 to-blue-500/5 rounded-full blur-2xl" // Reduced size and blur
            animate={{
              scale: [1, 1.05, 1], // Reduced scale
              rotate: [0, -30, 0], // Reduced rotation
              opacity: [0.2, 0.3, 0.2] // Reduced opacity
            }}
            transition={{
              duration: 12, // Increased duration
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-6 gap-12">
            {/* Brand Section */}
            <motion.div 
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-blue-glow"
                >
                  <Code2 className="w-full h-full text-white" />
                </motion.div>
                <motion.span 
                  className="text-2xl font-bold gradient-text"
                  whileHover={{ scale: 1.02 }}
                >
                  CodeStream
                </motion.span>
              </div>
              
              <motion.p 
                className="text-slate-400 leading-relaxed mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                The premier platform for mastering algorithms and data structures through 
                interactive visualizations and AI-powered learning assistance.
              </motion.p>

              {/* Social Links */}
              <motion.div 
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 ${social.color} glass-pro border border-slate-700 hover:border-blue-500/50 rounded-xl flex items-center justify-center transition-all duration-300 interactive-element group`}
                  >
                    <social.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>

            {/* Links Grid */}
            <motion.div 
              className="lg:col-span-4 grid md:grid-cols-4 gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <motion.h3 
                    className="font-semibold text-slate-100 text-lg flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    {category}
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1.2, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  </motion.h3>
                  <ul className="space-y-4">
                    {links.map((link, linkIndex) => (
                      <motion.li 
                        key={linkIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: linkIndex * 0.1 }}
                      >
                        {link.href.startsWith('/') ? (
                          <Link to={link.href}>
                            <motion.span
                              whileHover={{ 
                                x: 4, 
                                color: "#3B82F6",
                                scale: 1.02
                              }}
                              className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all duration-300 text-sm interactive-element group"
                            >
                              <span>{link.name}</span>
                              {link.isNew && (
                                <motion.span 
                                  className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30"
                                  whileHover={{ scale: 1.1 }}
                                >
                                  New
                                </motion.span>
                              )}
                              <motion.div
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={{ x: -10 }}
                                animate={{ x: 0 }}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </motion.div>
                            </motion.span>
                          </Link>
                        ) : (
                          <motion.a
                            href={link.href}
                            whileHover={{ 
                              x: 4, 
                              color: "#3B82F6",
                              scale: 1.02
                            }}
                            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all duration-300 text-sm interactive-element group"
                          >
                            <span>{link.name}</span>
                            {link.isNew && (
                              <motion.span 
                                className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30"
                                whileHover={{ scale: 1.1 }}
                              >
                                New
                              </motion.span>
                            )}
                            <motion.div
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              initial={{ x: -10 }}
                              animate={{ x: 0 }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </motion.div>
                          </motion.a>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Optimized Newsletter Section */}
      <AnimatePresence>
        {showNewsletter && (
          <motion.section
            initial={{ opacity: 0, y: 30 }} // Reduced y
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }} // Reduced y
            transition={{
              type: "spring",
              stiffness: 50, // Reduced from 100
              damping: 15    // Reduced from 20
            }}
            className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 border-y border-slate-800/50"
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl mx-auto px-6 py-12"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <motion.div variants={itemVariants} className="space-y-4">
                  <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    Stay Updated
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1.2, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </motion.div>
                  </h3>
                  <p className="text-slate-400">Get the latest updates and news directly in your inbox.</p>
                </motion.div>
                <motion.form
                  variants={itemVariants}
                  onSubmit={handleNewsletterSubmit}
                  className="flex gap-4 w-full md:w-auto"
                >
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    required
                  />
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    <Send className="w-4 h-4" />
                    Subscribe
                  </motion.button>
                </motion.form>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Optimized Bottom Bar */}
      <section className="py-6 border-t border-slate-800/50 relative overflow-hidden"> {/* Reduced padding */}
        {/* Optimized Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute bottom-0 left-1/4 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl" // Reduced size and blur
            animate={{
              scale: [1, 1.1, 1], // Reduced scale
              opacity: [0.2, 0.3, 0.2] // Reduced opacity
            }}
            transition={{
              duration: 10, // Increased duration
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-6"
          >
            {/* Copyright Section */}
            <motion.div 
              className="flex items-center gap-3 text-sm text-slate-400"
              whileHover={{ scale: 1.02 }}
            >
              <span>© 2025 CodeStream.</span>
              <motion.div
                className="flex items-center gap-1"
                whileHover={{ scale: 1.1 }}
              >
                <span>Crafted with</span>
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <Heart className="w-4 h-4 text-emerald-500 fill-current" />
                </motion.div>
                <span>for developers worldwide.</span>
              </motion.div>
            </motion.div>

            {/* Links Section */}
            <motion.div 
              className="flex flex-wrap items-center gap-6 text-sm"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Link to="/privacy">
                <motion.span
                  whileHover={{ 
                    color: "#3B82F6",
                    x: 4
                  }}
                  className="text-slate-400 hover:text-blue-400 transition-all duration-300 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </motion.span>
              </Link>
              <Link to="/terms">
                <motion.span
                  whileHover={{ 
                    color: "#3B82F6",
                    x: 4
                  }}
                  className="text-slate-400 hover:text-blue-400 transition-all duration-300 flex items-center gap-2"
                >
                  <Book className="w-4 h-4" />
                  Terms of Service
                </motion.span>
              </Link>
              <Link to="/cookies">
                <motion.span
                  whileHover={{ 
                    color: "#3B82F6",
                    x: 4
                  }}
                  className="text-slate-400 hover:text-blue-400 transition-all duration-300 flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Cookie Settings
                </motion.span>
              </Link>
              <Link to="/help">
                <motion.span
                  whileHover={{ 
                    color: "#3B82F6",
                    x: 4
                  }}
                  className="text-slate-400 hover:text-blue-400 transition-all duration-300 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Help Center
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Optimized Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }} // Changed from 0.5
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ 
          scale: 1.05, // Reduced from 1.1
          y: -3,      // Reduced from -5
          boxShadow: "0 0 15px rgba(59, 130, 246, 0.2)" // Reduced shadow
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 z-50" // Reduced padding and shadow
      >
        <motion.div
          animate={{
            y: [0, -2, 0] // Reduced movement
          }}
          transition={{
            duration: 2, // Increased duration
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <ChevronUp className="w-5 h-5" /> {/* Reduced size */}
        </motion.div>
      </motion.button>
    </footer>
  );
};

export default Footer;