import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Shield, 
  Database, 
  Lock, 
  Share2, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Key,
  UserCheck
} from 'lucide-react';

const PrivacyPolicy = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { number: "100%", label: "Data Protection", icon: Shield, color: "text-blue-400" },
    { number: "256-bit", label: "Encryption", icon: Lock, color: "text-emerald-400" },
    { number: "24/7", label: "Security Monitoring", icon: Eye, color: "text-purple-400" },
    { number: "0", label: "Data Breaches", icon: CheckCircle2, color: "text-rose-400" }
  ];

  const sections = [
    {
      id: 'data-collection',
      title: 'Data Collection',
      icon: Database,
      color: 'text-blue-400',
      content: 'We collect information that you provide directly to us, including when you create an account, use our services, or communicate with us. This may include your name, email address, and other contact information.'
    },
    {
      id: 'data-usage',
      title: 'How We Use Your Data',
      icon: FileText,
      color: 'text-emerald-400',
      content: 'Your data helps us provide and improve our services, communicate with you, and ensure the security of our platform. We use your information to personalize your experience and send you relevant updates.'
    },
    {
      id: 'data-protection',
      title: 'Data Protection',
      icon: Lock,
      color: 'text-purple-400',
      content: 'We implement robust security measures to protect your data, including encryption, secure servers, and regular security audits. Your information is stored securely and accessed only by authorized personnel.'
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing',
      icon: Share2,
      color: 'text-rose-400',
      content: 'We do not sell your personal information. We may share your data with trusted service providers who assist us in operating our platform, subject to strict confidentiality obligations.'
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
              <Shield className="w-5 h-5 text-slate-400" />
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
                Privacy
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-slate-400 via-gray-400 to-zinc-400 bg-clip-text text-transparent align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Policy
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Learn about how we collect, use, and protect your personal information while using CodeStream.
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

      {/* Policy Sections */}
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
              <span className="text-slate-100">Our Privacy</span>{" "}
              <span className="gradient-text">Commitments</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              We are committed to protecting your privacy and ensuring transparency in how we handle your data
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
                We regularly review and update our privacy policy to ensure it reflects our current practices
                and complies with applicable laws and regulations.
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

export default PrivacyPolicy; 