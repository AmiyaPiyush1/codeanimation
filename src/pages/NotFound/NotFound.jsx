import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Search, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950 flex items-center justify-center px-6">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* 404 Text */}
          <div className="space-y-4">
            <h1 className="text-9xl font-bold gradient-text">404</h1>
            <h2 className="text-3xl font-semibold text-slate-200">
              Page Not Found
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Oops! The page you're looking for doesn't exist or has been moved.
              Let's get you back on track.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group btn-primary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                <Home className="w-5 h-5" />
                Back to Home
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link to="/help">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-secondary px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
              >
                <HelpCircle className="w-5 h-5" />
                Get Help
              </motion.button>
            </Link>
          </div>

          {/* Search Suggestion */}
          <div className="mt-12 p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-slate-200">
                Try searching for what you need
              </h3>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search CodeStream..."
                className="w-full px-4 py-3 pl-12 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-8">
            <h4 className="text-sm font-medium text-slate-400 mb-4">
              Popular Pages
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { name: 'Documentation', href: '/docs' },
                { name: 'Visual Debugger', href: '/debugger' },
                { name: 'Community Forum', href: '/forum' },
                { name: 'Blog', href: '/blog' }
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default NotFound; 