import React from 'react';
import { motion } from 'framer-motion';
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
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
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

  return (
    <footer className="relative bg-navy-950 border-t border-slate-800/50">
      
      {/* Pre-Footer Professional CTA Section */}
      <section className="relative py-20 bg-gradient-to-b from-navy-950 via-navy-950 to-navy-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold">
                <span className="text-slate-100">Ready to Master</span>
                <br />
                <span className="gradient-text">Algorithms & Data Structures?</span>
              </h2>
              
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Join thousands of developers who have transformed their programming skills 
                with CodeStream's interactive learning platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/algorithms">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group btn-primary px-8 py-4 rounded-xl font-semibold flex items-center gap-2 interactive-element"
                >
                  <Code2 className="w-5 h-5" />
                  Start Learning Today
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>

              <Link to="/docs">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary px-8 py-4 rounded-xl font-semibold flex items-center gap-2 interactive-element"
                >
                  <Book className="w-5 h-5" />
                  View Documentation
                  <ExternalLink className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>

            {/* Professional Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 pt-8">
              <div className="flex items-center gap-2 text-sm text-slate-500 interactive-element">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>50K+ Active Learners</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 interactive-element">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                <span>98% Success Rate</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 interactive-element">
                <Book className="w-4 h-4 text-blue-400" />
                <span>15+ Languages Supported</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Professional Footer */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-6 gap-12">
            
            {/* Professional Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
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
                  <span className="text-2xl font-bold gradient-text">
                    CodeStream
                  </span>
                </div>
                
                <p className="text-slate-400 leading-relaxed mb-6">
                  The premier platform for mastering algorithms and data structures through 
                  interactive visualizations and AI-powered learning assistance.
                </p>

                {/* Professional Social Links */}
                <div className="flex gap-4">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className={`w-10 h-10 ${social.color} glass-pro border border-slate-700 hover:border-blue-500/50 rounded-xl flex items-center justify-center transition-all duration-300 interactive-element`}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Professional Links Grid */}
            <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
              {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-slate-100 text-lg">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        {link.href.startsWith('/') ? (
                          <Link to={link.href}>
                            <motion.span
                              whileHover={{ x: 4, color: "#3B82F6" }}
                              className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all duration-300 text-sm interactive-element"
                            >
                              <span>{link.name}</span>
                              {link.isNew && (
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                                  New
                                </span>
                              )}
                            </motion.span>
                          </Link>
                        ) : (
                          <motion.a
                            href={link.href}
                            whileHover={{ x: 4, color: "#3B82F6" }}
                            className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all duration-300 text-sm interactive-element"
                          >
                            <span>{link.name}</span>
                            {link.isNew && (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                                New
                              </span>
                            )}
                          </motion.a>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Professional Bottom Bar */}
      <section className="py-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>© 2025 CodeStream. Crafted with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="w-4 h-4 text-emerald-500 fill-current" />
              </motion.div>
              <span>for developers worldwide.</span>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy">
                <motion.span
                  whileHover={{ color: "#3B82F6" }}
                  className="text-slate-500 hover:text-blue-400 transition-colors duration-300 interactive-element"
                >
                  Privacy Policy
                </motion.span>
              </Link>
              <Link to="/terms">
                <motion.span
                  whileHover={{ color: "#3B82F6" }}
                  className="text-slate-500 hover:text-blue-400 transition-colors duration-300 interactive-element"
                >
                  Terms of Service
                </motion.span>
              </Link>
              <Link to="/cookies">
                <motion.span
                  whileHover={{ color: "#3B82F6" }}
                  className="text-slate-500 hover:text-blue-400 transition-colors duration-300 interactive-element"
                >
                  Cookie Settings
                </motion.span>
              </Link>
              <Link to="/help">
                <motion.span
                  whileHover={{ color: "#3B82F6" }}
                  className="text-slate-500 hover:text-blue-400 transition-colors duration-300 interactive-element"
                >
                  Help Center
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Professional Background Elements */}
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
    </footer>
  );
};

export default Footer;