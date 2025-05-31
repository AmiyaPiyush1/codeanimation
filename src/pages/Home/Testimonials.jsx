import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote, Users, Award, TrendingUp, CheckCircle } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const Testimonials = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '60px',
      duration: 1000,
      delay: 200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reset: false
    });

    // Configure different animations for different elements
    sr.reveal(headerRef.current, {
      delay: 200,
      distance: '40px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'top'
    });

    sr.reveal(statsRef.current, {
      delay: 400,
      distance: '40px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom',
      interval: 100
    });

    sr.reveal(testimonialsRef.current, {
      delay: 600,
      distance: '60px',
      duration: 1000,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom',
      interval: 100
    });

    sr.reveal(ctaRef.current, {
      delay: 800,
      distance: '40px',
      duration: 800,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom'
    });

    return () => {
      sr.destroy();
    };
  }, []);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      company: "Stanford University",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b9f23f9b?w=150&h=150&fit=crop&crop=face",
      content: "CodeStream transformed my understanding of algorithms. The visual debugging feature made complex concepts like dynamic programming finally click.",
      rating: 5,
      impact: "Improved test scores by 40%"
    },
    {
      name: "Marcus Rodriguez",
      role: "Software Engineer",
      company: "Google",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      content: "The AI tutor helped me understand the 'why' behind each algorithm. CodeStream was instrumental in landing my dream job at Google.",
      rating: 5,
      impact: "Landed job at Google"
    },
    {
      name: "Emily Wang",
      role: "Bootcamp Graduate",
      company: "Self-taught Developer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      content: "Coming from a non-CS background, CodeStream made algorithms accessible. The step-by-step visualizations are incredibly intuitive.",
      rating: 5,
      impact: "Mastered DSA in 3 months"
    },
    {
      name: "David Kim",
      role: "Teaching Assistant",
      company: "MIT",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "I use CodeStream in my algorithm classes. Students grasp complex concepts 3x faster with the interactive visualizations.",
      rating: 5,
      impact: "3x faster learning"
    },
    {
      name: "Alex Thompson",
      role: "Senior Developer",
      company: "Microsoft",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      content: "The AI explanations are incredibly detailed and accurate. It's like having a personal algorithms tutor available 24/7.",
      rating: 5,
      impact: "Promoted to Senior Dev"
    },
    {
      name: "Lisa Johnson",
      role: "Full Stack Developer",
      company: "Tech Startup",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
      content: "CodeStream helped optimize our core algorithms. The performance insights and suggestions saved significant server costs.",
      rating: 5,
      impact: "Reduced costs by 60%"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Learners", icon: Users, color: "text-blue-400" },
    { number: "98%", label: "Success Rate", icon: Award, color: "text-emerald-400" },
    { number: "4.9/5", label: "Average Rating", icon: Star, color: "text-yellow-400" },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <motion.div
          ref={headerRef}
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
            <Quote className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300">Success Stories</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <span className="text-slate-100">Trusted by</span>{" "}
            <span className="gradient-text">Developers</span>
            <br />
            <span className="text-slate-100">Worldwide</span>
          </h2>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who have accelerated their careers and 
            deepened their understanding of algorithms with CodeStream.
          </p>
        </motion.div>

        {/* Professional Stats */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -4, scale: 1.02 }}
              className="text-center p-8 glass-pro rounded-2xl border border-slate-700/50 hover:border-blue-500/30 interactive-card"
            >
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-4 ${stat.color} shadow-soft`}
              >
                <stat.icon className="w-full h-full" />
              </motion.div>
              <div className="text-3xl font-bold text-slate-100 mb-2">{stat.number}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Professional Testimonials Grid */}
        <motion.div
          ref={testimonialsRef}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative h-full"
            >
              {/* Professional Testimonial Card */}
              <div className="relative h-full p-8 glass-pro rounded-2xl border border-slate-700/50 hover:border-blue-500/30 interactive-card overflow-hidden">
                
                {/* Professional Quote Icon */}
                <motion.div
                  className="absolute top-6 right-6 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 rounded-full flex items-center justify-center"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <Quote className="w-4 h-4 text-blue-400" />
                </motion.div>

                <div className="space-y-6">
                  {/* Professional Rating */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 + i * 0.05 }}
                        whileHover={{ scale: 1.2 }}
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <p className="text-slate-300 leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  {/* Professional Impact Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full border border-emerald-500/20">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">
                      {testimonial.impact}
                    </span>
                  </div>

                  {/* Professional Profile */}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/30 interactive-element"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="font-semibold text-slate-100">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {testimonial.role}
                      </div>
                      <div className="text-xs text-blue-400 font-medium">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Professional Bottom CTA */}
        <motion.div
          ref={ctaRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary px-8 py-4 rounded-xl font-semibold interactive-element"
          >
            Join the CodeStream Community
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;