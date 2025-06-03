import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Target, Eye, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const HowItWorks = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const stepsRef = useRef(null);
  const ctaRef = useRef(null);

  // Configure ScrollReveal animations
  useEffect(() => {
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '40px',
      duration: 600,
      delay: 0,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reset: false,
      mobile: true,
      viewFactor: 0.2,
      beforeReveal: (el) => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
      },
      beforeReset: (el) => {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px) scale(0.98) rotate(1deg)';
      }
    });

    // Header section animations
    sr.reveal(badgeRef.current, {
      delay: 0,
      distance: '30px',
      duration: 500,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.98,
      opacity: 0,
      rotate: { x: 5, z: 1 }
    });

    sr.reveal(titleRef.current, {
      delay: 50,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.98,
      opacity: 0,
      rotate: { x: 3, y: 1 }
    });

    sr.reveal(descriptionRef.current, {
      delay: 100,
      distance: '35px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.98,
      opacity: 0,
      rotate: { x: 2 }
    });

    // Steps grid animations
    sr.reveal(stepsRef.current, {
      delay: 150,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      interval: 50,
      scale: 0.98,
      opacity: 0,
      rotate: { y: 3, z: 1 }
    });

    // CTA section animation
    sr.reveal(ctaRef.current, {
      delay: 200,
      distance: '40px',
      duration: 600,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.98,
      opacity: 0,
      rotate: { y: 3, z: 1 }
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
    <section ref={sectionRef} className="relative py-20 bg-gradient-to-b from-navy-900 to-navy-950">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
          <motion.div
            ref={badgeRef}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-emerald-500/20 mb-8 interactive-element"
            whileHover={{
              scale: 1.02,
              borderColor: "rgba(16, 185, 129, 0.4)",
              boxShadow: "0 0 30px rgba(16, 185, 129, 0.2)",
              transition: { duration: 0.3 }
            }}
          >
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-slate-300">Simple Process</span>
          </motion.div>

          <h2 ref={titleRef} className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <span className="text-slate-100">How</span>{" "}
            <span className="gradient-text">CodeStream</span>{" "}
            <span className="text-slate-100">Works</span>
          </h2>

          <p ref={descriptionRef} className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Transform your learning experience in four simple steps. From writing code 
            to gaining deep algorithmic insights.
          </p>
        </div>

        {/* Steps Grid */}
        <div ref={stepsRef} className="grid lg:grid-cols-2 gap-8 items-start">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="group"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Card */}
              <motion.div
                className="relative p-6 glass-pro rounded-xl border border-slate-700/50 hover:border-blue-500/30 interactive-card"
                whileHover={{
                  boxShadow: "0 0 30px rgba(124, 124, 243, 0.1)",
                  borderColor: "rgba(124, 124, 243, 0.3)",
                  transition: { duration: 0.3 }
                }}
              >
                <div className="flex items-start gap-4">
                  
                  {/* Step Icon & Number */}
                  <div className="relative flex-shrink-0">
                    <motion.div
                      whileHover={{ scale: 1.03, rotate: 3 }}
                      transition={{ duration: 0.3 }}
                      className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-blue-glow"
                    >
                      <step.icon className="w-full h-full text-white" />
                    </motion.div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-emerald-glow">
                      {index + 1}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold text-slate-100 group-hover:text-blue-300 transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-slate-400 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Interactive Demo Button */}
                    <motion.button
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.3 }}
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
                  transition={{ duration: 0.3 }}
                  className="mt-4 code-block p-3"
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
        <div ref={ctaRef} className="text-center mt-16">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="btn-primary px-8 py-4 rounded-xl font-semibold interactive-element"
          >
            Start Your Learning Journey
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;