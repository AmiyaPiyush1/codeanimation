import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./LandingPage.css";

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const codeLinesRef = useRef(null);

  useEffect(() => {
    // Clear any existing ScrollTriggers
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    // Set initial states
    gsap.set(heroRef.current.querySelector('.hero-content'), { opacity: 1, y: 50 });
    gsap.set(heroRef.current.querySelector('.hero-image'), { opacity: 1, x: 50 });
    gsap.set(featuresRef.current.querySelectorAll('.feature-card'), { opacity: 1, y: 50 });
    gsap.set(ctaRef.current.querySelector('.cta-content'), { opacity: 1, y: 50 });
    gsap.set(codeLinesRef.current.querySelectorAll('.code-line'), { width: 0 });
    gsap.set('.quote-content', { opacity: 1, y: 30 });

    // Hero section animations
    const heroTimeline = gsap.timeline({
      defaults: { ease: "power3.out" }
    });
    
    heroTimeline
      .to(heroRef.current.querySelector('.hero-content'), 
        { opacity: 1, y: 0, duration: 1 }
      )
      .to(heroRef.current.querySelector('.hero-image'),
        { opacity: 1, x: 0, duration: 1 },
        "-=0.5"
      );

    // Quote section animation
    const quoteTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.quote-section',
        start: "top bottom-=100",
        toggleActions: "play none none reverse"
      }
    });

    quoteTimeline
      .to('.quote-content', {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      })
      .fromTo('.quote-particle',
        { opacity: 1, scale: 0 },
        {
          opacity: 0.6,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=0.5"
      );

    // Animate code lines
    const codeLines = codeLinesRef.current.querySelectorAll('.code-line');
    codeLines.forEach((line, index) => {
      gsap.to(line, {
        width: line.dataset.width || "70%",
        duration: 1.5,
        delay: index * 0.1,
        ease: "power2.out",
        opacity: 1
      });
    });

    // Features section animations
    const featureCards = featuresRef.current.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: index * 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      });
    });

    // CTA section animation
    const ctaTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top bottom-=100",
        end: "bottom center",
        toggleActions: "play none none reverse"
      }
    });

    ctaTimeline
      .to(ctaRef.current.querySelector('.cta-content'), {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
      })
      .fromTo(ctaRef.current.querySelectorAll('.cta-particle'),
        { opacity: 0, scale: 0 },
        {
          opacity: 0.6,
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=0.5"
      );

    // Parallax effects
    gsap.to(heroRef.current.querySelector('.hero-bg'), {
      y: 100,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });

    gsap.to(ctaRef.current.querySelector('.cta-glow'), {
      y: 50,
      ease: "none",
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="gradient-text">
              <span className="highlight">Code</span> Stream
            </h1>
            <p className="hero-subtitle">
              Transform your code into interactive visual stories. Experience the power of real-time visualization.
            </p>
          </div>
          <div className="hero-buttons">
            <Link to="/debugger">
              <button className="primary-button">
                <span>Start Visualizing</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/>
                  <path d="m12 5 7 7-7 7"/>
                </svg>
              </button>
            </Link>
            <Link to="/about">
              <button className="secondary-button">
                <span>Learn More</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              </button>
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Languages</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <div className="code-animation">
            <div ref={codeLinesRef} className="code-lines">
              {[...Array(15)].map((_, i) => (
                <div 
                  key={i} 
                  className="code-line" 
                  data-width={`${Math.random() * 30 + 70}%`}
                  style={{ 
                    animationDelay: `${i * 0.1}s`
                  }}
                ></div>
              ))}
            </div>
            <div className="code-glow"></div>
            <div className="code-particles">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className="particle" 
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="quote-container">
          <div className="quote-content">
            <svg className="quote-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
            </svg>
            <blockquote>
                Everyone should know how to program a computer, because it teaches you how to think!
            </blockquote>
            <cite>- Steve Jobs</cite>
          </div>
          <div className="quote-decoration">
            <div className="quote-glow"></div>
            <div className="quote-particles">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="quote-particle" 
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="features-section">
        <div className="section-header">
          <h2>Why Choose Code Stream?</h2>
          <p className="section-subtitle">Experience the future of code visualization</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="m4.93 4.93 2.83 2.83"/>
                <path d="m16.24 16.24 2.83 2.83"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
                <path d="m4.93 19.07 2.83-2.83"/>
                <path d="m16.24 7.76 2.83-2.83"/>
              </svg>
            </div>
            <h3>Interactive Visualization</h3>
            <p>Watch your algorithms come to life with step-by-step visual feedback and real-time updates</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="m4.93 4.93 2.83 2.83"/>
                <path d="m16.24 16.24 2.83 2.83"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
                <path d="m4.93 19.07 2.83-2.83"/>
                <path d="m16.24 7.76 2.83-2.83"/>
              </svg>
            </div>
            <h3>Real-time Debugging</h3>
            <p>Debug your code with instant visual feedback and detailed insights at every step</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="m4.93 4.93 2.83 2.83"/>
                <path d="m16.24 16.24 2.83 2.83"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
                <path d="m4.93 19.07 2.83-2.83"/>
                <path d="m16.24 7.76 2.83-2.83"/>
              </svg>
            </div>
            <h3>Multi-language Support</h3>
            <p>Work with your favorite programming languages seamlessly with our extensive language support</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="cta-section">
        <div className="cta-content">
          <h2 className="gradient-text">Ready to Transform Your Code?</h2>
          <p>Start visualizing your algorithms and data structures today</p>
          <Link to="/debugger">
            <button className="primary-button">
              <span>Get Started Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/>
                <path d="m12 5 7 7-7 7"/>
              </svg>
            </button>
          </Link>
        </div>
        <div className="cta-decoration">
          <div className="cta-glow"></div>
          <div className="cta-particles">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="cta-particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;