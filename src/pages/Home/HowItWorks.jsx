import React, { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Edit3, Target, Eye, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const stepsRef = useRef(null);
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

    sr.reveal(stepsRef.current, {
      delay: 400,
      distance: '60px',
      duration: 1000,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      origin: 'bottom',
      interval: 100
    });

    return () => {
      sr.destroy();
    };
  }, []);

  const steps = [
    {
      icon: Edit3,
      title: "Write Your Code",
      description: "Start with any algorithm or data structure. Our intelligent editor supports multiple programming languages with syntax highlighting.",
      code: "function bubbleSort(arr) {\n  for(let i = 0; i < arr.length; i++) {\n    // Implementation here\n  }\n}",
      delay: 0.1
    },
    {
      icon: Target,
      title: "Automatic Algorithm Selection",
      description: "Let our AI intelligently detect the type of algorithm you're implementing—whether it's sorting, searching, recursion or graph-based—so you can focus on writing logic, not labels.",
      code: "Algorithm: Bubble Sort\nComplexity: O(n²)\nType: Sorting\nOptimal for: Small datasets",
      delay: 0.2
    },
    {
      icon: Eye,
      title: "Watch It Visualize",
      description: "See your algorithm come to life with step-by-step visualizations. Track variables, function calls, and data flow.",
      code: "Step 1: Compare arr[0] with arr[1]\nStep 2: Swap if needed\nStep 3: Move to next pair\n✓ Visualization active",
      delay: 0.3
    },
    {
      icon: MessageSquare,
      title: "Get AI Insights",
      description: "Receive detailed explanations, optimization suggestions, and learn why each step happens the way it does.",
      code: "💡 Optimization tip:\nQuickSort would be O(n log n)\n\n🎯 Learning insight:\nBubble sort demonstrates comparison sorting",
      delay: 0.4
    }
  ];

  return (
    <section ref={sectionRef} className="relative py-24 bg-gradient-to-b from-navy-900 to-navy-950">
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
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300">Simple Process</span>
          </motion.div>

          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <span className="text-slate-100">How</span>{" "}
            <span className="gradient-text">CodeStream</span>{" "}
            <span className="text-slate-100">Works</span>
          </h2>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Transform your learning experience in four simple steps. From writing code 
            to gaining deep algorithmic insights.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div ref={stepsRef} className="grid lg:grid-cols-2 gap-12 items-start">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: step.delay }}
              className="group"
            >
              {/* Step Card */}
              <motion.div
                whileHover={{ y: -4 }}
                className="relative p-8 glass-pro rounded-2xl border border-slate-700/50 hover:border-blue-500/30 interactive-card"
              >
                <div className="flex items-start gap-6">
                  
                  {/* Step Icon & Number */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-4 shadow-blue-glow"
                    >
                      <step.icon className="w-full h-full text-white" />
                    </motion.div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-emerald-glow">
                      {index + 1}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-semibold text-slate-100 group-hover:text-blue-300 transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-slate-400 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Interactive Demo Button */}
                    <motion.button
                      whileHover={{ x: 5 }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors duration-300 interactive-element"
                    >
                      <span>Try This Step</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Code Preview */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="mt-6 code-block p-4"
                >
                  <pre className="text-sm text-slate-300 font-mono">
                    <code>{step.code}</code>
                  </pre>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-20"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary px-8 py-4 rounded-xl font-semibold interactive-element"
          >
            Start Your Learning Journey
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;