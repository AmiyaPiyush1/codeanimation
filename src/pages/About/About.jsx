import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Code2, 
  Users, 
  Rocket, 
  Target, 
  Award, 
  Heart, 
  ChevronRight,
  ArrowRight,
  Star,
  Sparkles,
  Lightbulb,
  Globe,
  Zap,
  BookOpen
} from 'lucide-react';

const About = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stats = [
    { number: "50K+", label: "Active Learners", icon: Users, color: "text-blue-400" },
    { number: "98%", label: "Success Rate", icon: Target, color: "text-emerald-400" },
    { number: "15+", label: "Languages", icon: Code2, color: "text-purple-400" },
    { number: "24/7", label: "Support", icon: Heart, color: "text-rose-400" }
  ];

  const values = [
    {
      title: "Innovation First",
      description: "We constantly push the boundaries of what's possible in coding education, leveraging cutting-edge technology to create immersive learning experiences.",
      icon: Sparkles,
      color: "text-blue-400"
    },
    {
      title: "Community Driven",
      description: "Our global community of learners and educators shapes the future of CodeStream, creating a collaborative environment for growth and success.",
      icon: Users,
      color: "text-emerald-400"
    },
    {
      title: "Excellence in Education",
      description: "We maintain the highest standards in our educational content, ensuring that every lesson is comprehensive, accurate, and engaging.",
      icon: Award,
      color: "text-purple-400"
    }
  ];

  const timeline = [
    {
      year: "2020",
      title: "The Beginning",
      description: "CodeStream was born from a vision to revolutionize how developers learn algorithms and data structures.",
      icon: Rocket,
      color: "text-blue-400"
    },
    {
      year: "2021",
      title: "Global Expansion",
      description: "We expanded our platform to support multiple programming languages and reached learners in over 50 countries.",
      icon: Globe,
      color: "text-emerald-400"
    },
    {
      year: "2022",
      title: "AI Integration",
      description: "Introduced AI-powered learning assistance to provide personalized guidance and real-time feedback.",
      icon: Zap,
      color: "text-purple-400"
    },
    {
      year: "2023",
      title: "Interactive Learning",
      description: "Launched our revolutionary interactive visualization system for algorithms and data structures.",
      icon: Lightbulb,
      color: "text-rose-400"
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
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-emerald-500/20 mb-8 interactive-element"
            >
              <Code2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Our Story</span>
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
                Transforming
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Code Learning
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              We're on a mission to make algorithm and data structure learning 
              accessible, interactive, and enjoyable for developers worldwide.
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

      {/* Values Section */}
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
              <span className="text-slate-100">Our</span>{" "}
              <span className="gradient-text">Values</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              These core principles guide everything we do at CodeStream
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="glass-pro rounded-2xl border border-slate-700/50 p-8 interactive-card"
              >
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-4 ${value.color} shadow-soft`}
                >
                  <value.icon className="w-full h-full" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-slate-100 mb-4 text-center">
                  {value.title}
                </h3>
                <p className="text-slate-400 text-center">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-slate-100">Our</span>{" "}
              <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              From humble beginnings to global impact
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500/50 to-emerald-500/50" />

            {timeline.map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`relative mb-12 ${index % 2 === 0 ? 'md:ml-auto md:mr-[50%] md:pr-12' : 'md:mr-auto md:ml-[50%] md:pl-12'} md:w-1/2`}
              >
                <div className="glass-pro rounded-2xl border border-slate-700/50 p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      className={`w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 ${event.color} shadow-soft`}
                    >
                      <event.icon className="w-full h-full" />
                    </motion.div>
                    <div>
                      <div className="text-sm font-medium text-slate-400">
                        {event.year}
                      </div>
                      <h3 className="text-xl font-semibold text-slate-100">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-slate-400">
                    {event.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
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
              <span className="text-slate-100">Join Our</span>{" "}
              <span className="gradient-text">Team</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              We're always looking for passionate individuals to join our mission
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.a
              href="/careers"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
            >
              View Open Positions
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default About; 