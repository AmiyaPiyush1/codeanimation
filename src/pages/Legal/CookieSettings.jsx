import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Cookie, 
  Shield, 
  BarChart2, 
  Target, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Settings,
  Lock,
  UserCheck,
  Zap,
  Loader2
} from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const CookieSettings = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const [expandedSections, setExpandedSections] = useState({});
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Essential cookies are always enabled
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { number: "100%", label: "Cookie Control", icon: Cookie, color: "text-blue-400" },
    { number: "256-bit", label: "Encryption", icon: Lock, color: "text-emerald-400" },
    { number: "24/7", label: "Security", icon: Shield, color: "text-purple-400" },
    { number: "0", label: "Third-Party Sharing", icon: AlertCircle, color: "text-rose-400" }
  ];

  const sections = [
    {
      id: 'essential',
      title: 'Essential Cookies',
      icon: Shield,
      color: 'text-blue-400',
      content: 'These cookies are necessary for the website to function properly. They enable basic functions like page navigation and access to secure areas of the website.',
      required: true
    },
    {
      id: 'analytics',
      title: 'Analytics Cookies',
      icon: BarChart2,
      color: 'text-emerald-400',
      content: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      required: false
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      icon: Target,
      color: 'text-purple-400',
      content: 'These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for individual users.',
      required: false
    },
    {
      id: 'preferences',
      title: 'Preference Cookies',
      icon: Settings,
      color: 'text-rose-400',
      content: 'These cookies enable the website to remember information that changes the way the website behaves or looks, like your preferred language or region.',
      required: false
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleCookie = (cookieType) => {
    if (cookieType === 'essential') return; // Essential cookies cannot be disabled
    setCookiePreferences(prev => ({
      ...prev,
      [cookieType]: !prev[cookieType]
    }));
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically save the preferences to your backend
      console.log('Saving cookie preferences:', cookiePreferences);
      
      setSaveStatus('success');
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

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
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-emerald-500/20 mb-8 interactive-element"
            >
              <Cookie className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Cookie Settings</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold">
              <span className="text-slate-100">Cookie</span>{" "}
              <span className="gradient-text">Preferences</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Take control of your privacy by managing your cookie preferences.
              Choose which cookies you want to allow on your device.
            </p>

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

      {/* Cookie Settings Sections */}
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
              <span className="text-slate-100">Manage Your</span>{" "}
              <span className="gradient-text">Cookies</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Customize your cookie preferences to enhance your browsing experience
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
                <p className="text-slate-400 text-center mb-6">
                  {section.content}
                </p>
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleCookie(section.id)}
                    disabled={section.required}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                      cookiePreferences[section.id]
                        ? 'bg-emerald-500'
                        : 'bg-slate-600'
                    } ${section.required ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        cookiePreferences[section.id] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="flex justify-center mt-12"
          >
            <motion.button
              onClick={savePreferences}
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                  Saving...
                </>
              ) : saveStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Preferences Saved!
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </motion.button>
          </motion.div>
          {saveStatus === 'error' && (
            <p className="text-red-400 text-center mt-4 flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Failed to save preferences. Please try again.
            </p>
          )}
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
                We regularly review and update our cookie policy to ensure it reflects our current practices
                and complies with applicable privacy laws and regulations.
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

export default CookieSettings; 