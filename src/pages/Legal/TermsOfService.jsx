import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Scale, 
  FileText, 
  Shield, 
  AlertTriangle, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Lock,
  UserCheck,
  Zap
} from 'lucide-react';

const TermsOfService = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { number: "100%", label: "Legal Compliance", icon: Scale, color: "text-blue-400" },
    { number: "24/7", label: "Support Available", icon: Shield, color: "text-emerald-400" },
    { number: "30 Days", label: "Money Back Guarantee", icon: CheckCircle2, color: "text-purple-400" },
    { number: "0", label: "Hidden Fees", icon: AlertCircle, color: "text-rose-400" }
  ];

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: FileText,
      color: 'text-blue-400',
      content: 'By accessing and using CodeStream, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.'
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable Use',
      icon: Shield,
      color: 'text-emerald-400',
      content: 'You agree to use CodeStream only for lawful purposes and in accordance with these Terms. You must not use our platform in any way that violates any applicable laws or regulations.'
    },
    {
      id: 'user-content',
      title: 'User Content',
      icon: BookOpen,
      color: 'text-purple-400',
      content: 'You retain ownership of any content you submit to CodeStream. By submitting content, you grant us a license to use, modify, and display it in connection with our services.'
    },
    {
      id: 'limitations',
      title: 'Limitations of Liability',
      icon: AlertTriangle,
      color: 'text-rose-400',
      content: 'CodeStream is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of our platform or inability to access our services.'
    }
  ];

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
      {/* Hero Section with Parallax */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-950/50 z-10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-slate-500/20 mb-8 interactive-element"
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">Legal Information</span>
            </motion.div>

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
                Terms of
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-slate-400 via-gray-400 to-zinc-400 bg-clip-text text-transparent align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Service
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Read our terms of service to understand the rules and guidelines for using CodeStream's platform and services.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Terms Sections */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-slate-100">Key Terms &</span>{" "}
              <span className="gradient-text">Conditions</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Understanding your rights and responsibilities when using CodeStream
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="glass-pro rounded-2xl border border-slate-700/50 p-8 interactive-card"
              >
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-4 ${section.color} shadow-soft`}
                >
                  <section.icon className="w-full h-full" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-slate-100 mb-4 text-center">
                  {section.title}
                </h3>
                <p className="text-slate-400 text-center">
                  {section.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Last Updated Section */}
      <section className="py-24 bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="glass-pro rounded-2xl border border-slate-700/50 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-slate-100 mb-4">
                Last Updated: March 15, 2025
              </h3>
              <p className="text-slate-400">
                We may update these terms from time to time. We will notify you of any material changes
                by posting the new terms on this page and updating the "Last Updated" date.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default TermsOfService; 