import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { CSSPlugin } from "gsap/CSSPlugin";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css";

gsap.registerPlugin(ScrollTrigger, CSSPlugin);

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileImageLoaded, setProfileImageLoaded] = useState(false);
  const navigate = useNavigate();
  const navbarRef = useRef(null);
  const logoRef = useRef(null);
  const mainLinksRef = useRef(null);
  const authLinksRef = useRef(null);
  const { 
    user, 
    loading, 
    authError, 
    userPreferences,
    handleGoogleCallback, 
    logout,
    updateUserProfile 
  } = useAuth();

  useEffect(() => {
    // Scroll handler
    const handleScroll = () => {
      const scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
      const shouldBeScrolled = scrollPosition > 20;
      
      if (shouldBeScrolled !== isScrolled) {
        setIsScrolled(shouldBeScrolled);

        // Create timeline for smooth transitions
        const tl = gsap.timeline({
          onStart: () => {
            // Set initial transform origin
            gsap.set(navbarRef.current, {
              transformOrigin: "center center",
            });
          }
        });

        if (shouldBeScrolled) {
          // Scrolling down animation
          tl.to(navbarRef.current, {
            y: 0,
            scale: 1,
            opacity: 1,
            width: "90%",
            maxWidth: "1200px",
            padding: "clamp(0.2rem, 0.5vw, 0.4rem)",
            borderRadius: "50px",
            backgroundColor: "rgba(255,255,255, 0.05)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            backdropFilter: "blur(20px)",
            top: "0.5rem",
            duration: 0.2,
            ease: "power2.out",
            immediateRender: true,
            force3D: true,
          });

          // Animate content sections with stable positioning
          const sections = [logoRef.current, mainLinksRef.current, authLinksRef.current];
          sections.forEach((section, index) => {
            if(section){
              if (index === 0) {
                // Logo section - make it smaller
                tl.fromTo(section,
                  {
                    scale: 0.98,
                    opacity: 0.9
                  },
                  {
                    scale: 0.9,
                    opacity: 1,
                    duration: 0.2,
                    ease: "power2.out",
                    delay: index * 0.02,
                  },
                  "-=0.1"
                );
              } else {
                // Other sections - normal size
                tl.fromTo(section,
                  {
                    scale: 0.98,
                    opacity: 0.9
                  },
                  {
                    scale: 1,
                    opacity: 1,
                    duration: 0.2,
                    ease: "power2.out",
                    delay: index * 0.02,
                  },
                  "-=0.1"
                );
              }
            }
          });
        } else {
          // Scrolling up animation (mirror of scroll down)
          tl.to(navbarRef.current, {
            y: 0,
            scale: 1,
            opacity: 1,
            width: "90%",
            maxWidth: "1200px",
            padding: "clamp(0.2rem, 0.5vw, 0.4rem)",
            borderRadius: 0,
            backgroundColor: "transparent",
            boxShadow: "none",
            backdropFilter: "none",
            top: "0.5rem",
            duration: 0.15,
            ease: "power2.out",
            immediateRender: true,
            force3D: true,
          });

          // Animate content sections with stable positioning
          const sections = [logoRef.current, mainLinksRef.current, authLinksRef.current];
          sections.forEach((section, index) => {
            if(section){
              tl.fromTo(section,
                {
                  scale: index === 0 ? 0.9 : 0.98,
                  opacity: 0.9
                },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.15,
                  ease: "power2.out",
                  delay: index * 0.05,
                },
                "-=0.1"
              );
            }
          });
        }
      }
    };

    // Add scroll event listener
    document.addEventListener('scroll', handleScroll, true);

    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    document.addEventListener('scroll', scrollListener, { passive: true });
    
    // Initial check
    handleScroll();

    // Remove the ScrollTrigger for gap transition as it's causing issues
    return () => {
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', scrollListener);
    };
  }, [isScrolled]);

  // Preload profile image with error handling
  useEffect(() => {
    if (user?.picture) {
      const img = new Image();
      img.src = `https://images.weserv.nl/?url=${encodeURIComponent(user.picture)}&w=28&h=28&fit=cover&mask=circle&output=webp`;
      img.onload = () => {
        setProfileImageLoaded(true);
      };
      img.onerror = () => {
        console.error('Error preloading profile image');
        setProfileImageLoaded(false);
      };
    }
  }, [user?.picture]);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const decodedToken = jwtDecode(credentialResponse.credential);
      await handleGoogleCallback(credentialResponse.credential);
      navigate("/dashboard");
    } catch (error) {
      console.error('Error during Google login:', error);
      logout('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    logout('You have been successfully logged out.');
    navigate("/");
  };

  const handleProfileUpdate = async (updates) => {
    try {
      const updatedUser = await updateUserProfile(updates);
      if (updatedUser) {
        // Show success message or handle UI update
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleHover = (element) => {
    const block = element.querySelector('.hover-block');
    const innerBlock = element.querySelector('.hover-block-inner');
    const glowBlock = element.querySelector('.hover-glow');
    const link = element.querySelector('a');
    const icon = element.querySelector('svg');
    
    if (block) {
      gsap.to(block, {
        scaleX: 1,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
        force3D: true
      });
    }

    if (innerBlock) {
      gsap.to(innerBlock, {
        scaleX: 1,
        opacity: 1,
        duration: 0.5,
        delay: 0.1,
        ease: "power2.out",
        force3D: true
      });
    }

    if (glowBlock) {
      gsap.to(glowBlock, {
        scale: 1.2,
        opacity: 0.8,
        duration: 0.6,
        ease: "power2.out",
        force3D: true
      });
    }

    if (link && !element.id) {
      gsap.to(link, {
        color: "#ffffff",
        duration: 0.3,
        ease: "power2.out"
      });
    }

    if (icon) {
      gsap.to(icon, {
        scale: 1.1,
        stroke: "#ffffff",
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleHoverOut = (element) => {
    const block = element.querySelector('.hover-block');
    const innerBlock = element.querySelector('.hover-block-inner');
    const glowBlock = element.querySelector('.hover-glow');
    const link = element.querySelector('a');
    const icon = element.querySelector('svg');
    
    if (block) {
      gsap.to(block, {
        scaleX: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.inOut",
        force3D: true
      });
    }

    if (innerBlock) {
      gsap.to(innerBlock, {
        scaleX: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        force3D: true
      });
    }

    if (glowBlock) {
      gsap.to(glowBlock, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        force3D: true
      });
    }

    if (link && !element.id) {
      gsap.to(link, {
        color: "#ffffff",
        duration: 0.3,
        ease: "power2.out"
      });
    }

    if (icon) {
      gsap.to(icon, {
        scale: 1,
        stroke: "#ffffff",
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  return (
    <nav
      ref={navbarRef}
      className="navbar"
      style={{
        position: "fixed",
        top: "0.5rem",
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "90%",
        maxWidth: "1200px",
        padding: "clamp(0.2rem, 0.5vw, 0.4rem)",
        margin: "0 auto",
        gap: "8rem",
        willChange: "transform, background-color",
        backfaceVisibility: "hidden",
        backgroundColor: isScrolled ? "rgba(255,255,255, 0.01)" : "transparent",
        boxShadow: isScrolled ? "0 8px 32px rgba(0, 0, 0, 0.12)" : "none",
        backdropFilter: isScrolled ? "blur(20px)" : "none",
        borderRadius: isScrolled ? "50px" : 0,
        transform: "translateZ(0)",
        transition: "all 0.2s ease-out",
        transformOrigin: "center center",
        WebkitFontSmoothing: "antialiased"
      }}
    >
      <div 
        ref={logoRef}
        className="logo-section"
      >
        <Link to="/" className="logo">
          <img 
            src="/logo.png" 
            alt="CodeStream"
          />
          <span>CodeStream</span>
        </Link>
      </div>

      <div 
        ref={mainLinksRef}
        className="main-nav-links"
      >
        <div 
          onMouseEnter={(e) => handleHover(e.currentTarget)}
          onMouseLeave={(e) => handleHoverOut(e.currentTarget)}
          style={{
            position: "relative",
            padding: "0.5rem 0.4rem",
            borderRadius: "2rem",
            overflow: "hidden"
          }}
        >
          <div 
            className="hover-block"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0.05) 100%)",
              transform: "scaleX(0)",
              transformOrigin: "left",
              opacity: 0,
              borderRadius: "16px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(26, 110, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(26, 110, 255, 0.15)",
              overflow: "hidden"
            }}
          >
            <div 
              className="hover-block-inner"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                transform: "scaleX(0)",
                transformOrigin: "left",
                opacity: 0,
                borderRadius: "16px",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            />
            <div 
              className="hover-glow"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0) 70%)",
                transform: "translate(-50%, -50%) scale(0.8)",
                opacity: 0,
                borderRadius: "50%",
                filter: "blur(15px)",
                pointerEvents: "none"
              }}
            />
          </div>
          <Link to="/" style={{ 
            position: "relative", 
            zIndex: 1, 
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem",
            fontWeight: "500",
            letterSpacing: "0.01em",
            transition: "all 0.3s ease"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house" style={{ transition: "all 0.3s ease", stroke: "#ffffff" }}>
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg> Home
          </Link>
        </div>
        <div 
          onMouseEnter={(e) => handleHover(e.currentTarget)}
          onMouseLeave={(e) => handleHoverOut(e.currentTarget)}
          style={{
            position: "relative",
            padding: "0.5rem 0.4rem",
            borderRadius: "2rem",
            overflow: "hidden"
          }}
        >
          <div 
            className="hover-block"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0.05) 100%)",
              transform: "scaleX(0)",
              transformOrigin: "left",
              opacity: 0,
              borderRadius: "16px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(26, 110, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(26, 110, 255, 0.15)",
              overflow: "hidden"
            }}
          >
            <div 
              className="hover-block-inner"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                transform: "scaleX(0)",
                transformOrigin: "left",
                opacity: 0,
                borderRadius: "16px",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            />
            <div 
              className="hover-glow"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0) 70%)",
                transform: "translate(-50%, -50%) scale(0.8)",
                opacity: 0,
                borderRadius: "50%",
                filter: "blur(15px)",
                pointerEvents: "none"
              }}
            />
          </div>
          <Link to="/about" style={{ 
            position: "relative", 
            zIndex: 1, 
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem",
            fontWeight: "500",
            letterSpacing: "0.01em",
            transition: "all 0.3s ease"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info" style={{ transition: "all 0.3s ease" }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg> About
          </Link>
        </div>
        <div 
          onMouseEnter={(e) => handleHover(e.currentTarget)}
          onMouseLeave={(e) => handleHoverOut(e.currentTarget)}
          style={{
            position: "relative",
            padding: "0.5rem 0.4rem",
            borderRadius: "2rem",
            overflow: "hidden"
          }}
        >
          <div 
            className="hover-block"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0.05) 100%)",
              transform: "scaleX(0)",
              transformOrigin: "left",
              opacity: 0,
              borderRadius: "16px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 4px 20px rgba(26, 110, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(26, 110, 255, 0.15)",
              overflow: "hidden"
            }}
          >
            <div 
              className="hover-block-inner"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                transform: "scaleX(0)",
                transformOrigin: "left",
                opacity: 0,
                borderRadius: "16px",
                backdropFilter: "blur(8px)",
                boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.15)"
              }}
            />
            <div 
              className="hover-glow"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0) 70%)",
                transform: "translate(-50%, -50%) scale(0.8)",
                opacity: 0,
                borderRadius: "50%",
                filter: "blur(15px)",
                pointerEvents: "none"
              }}
            />
          </div>
          <Link to="/contact" style={{ 
            position: "relative", 
            zIndex: 1, 
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.95rem",
            fontWeight: "500",
            letterSpacing: "0.01em",
            transition: "all 0.3s ease"
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone" style={{ transition: "all 0.3s ease" }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg> Contact
          </Link>
        </div>
      </div>

      <div 
        ref={authLinksRef}
        className="auth-links"
      >
        {loading ? (
          <div className="loading-spinner">
            <svg className="animate-spin" width="24" height="24" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : user ? (
          <>
            <div 
              onMouseEnter={(e) => !isScrolled && handleHover(e.currentTarget)}
              onMouseLeave={(e) => !isScrolled && handleHoverOut(e.currentTarget)}
              style={{
                position: "relative",
                padding: isScrolled ? "0" : "0.5rem 0.4rem",
                borderRadius: "2rem",
                overflow: "hidden"
              }}
            >
              <div 
                className="hover-block"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(90deg, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0.05) 100%)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  opacity: 0,
                  borderRadius: "16px",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 4px 20px rgba(26, 110, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(26, 110, 255, 0.15)",
                  overflow: "hidden",
                  display: isScrolled ? "none" : "block"
                }}
              >
                <div 
                  className="hover-block-inner"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    opacity: 0,
                    borderRadius: "16px",
                    backdropFilter: "blur(8px)",
                    boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    display: isScrolled ? "none" : "block"
                  }}
                />
                <div 
                  className="hover-glow"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "200%",
                    height: "200%",
                    background: "radial-gradient(circle, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0) 70%)",
                    transform: "translate(-50%, -50%) scale(0.8)",
                    opacity: 0,
                    borderRadius: "50%",
                    filter: "blur(15px)",
                    pointerEvents: "none",
                    display: isScrolled ? "none" : "block"
                  }}
                />
              </div>
              <Link to="/profile" style={{ 
                position: "relative", 
                zIndex: 1, 
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.3s ease"
              }}>
                {user.picture ? (
                  <div style={{
                    position: "relative",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "linear-gradient(45deg, #1a6eff20, #1a6eff40)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(26, 110, 255, 0.15)",
                      opacity: profileImageLoaded ? 0 : 1,
                      transition: "opacity 0.3s ease-in-out",
                      zIndex: 2
                    }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round" style={{ color: "#1a6eff" }}>
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 0 0-16 0" />
                      </svg>
                    </div>
                    <img 
                      src={`https://images.weserv.nl/?url=${encodeURIComponent(user.picture)}&w=28&h=28&fit=cover&mask=circle&output=webp`}
                      alt="Profile" 
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                        boxShadow: "0 2px 8px rgba(26, 110, 255, 0.15)",
                        opacity: profileImageLoaded ? 1 : 0,
                        transform: `scale(${profileImageLoaded ? 1 : 0.95})`,
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        zIndex: 1
                      }}
                      onError={(e) => {
                        console.error('Error loading profile picture:', e);
                        e.target.style.display = 'none';
                        setProfileImageLoaded(false);
                      }}
                      onLoad={() => {
                        setProfileImageLoaded(true);
                      }}
                    />
                  </div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round">
                    <circle cx="12" cy="8" r="5" />
                    <path d="M20 21a8 8 0 0 0-16 0" />
                  </svg>
                )}
                <span style={{
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  letterSpacing: "0.01em",
                  color: "#ffffff"
                }}>
                  {user.name || 'Profile'}
                </span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "0.5rem 0.4rem",
                fontSize: "0.95rem",
                fontWeight: "500",
                letterSpacing: "0.01em",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </>
        ) : (
          <Link 
            to="/login"
            style={{
              color: "#ffffff",
              textDecoration: "none",
              padding: "0.5rem 1rem",
              borderRadius: "2rem",
              background: "linear-gradient(90deg, rgba(26, 110, 255, 0.15) 0%, rgba(26, 110, 255, 0.05) 100%)",
              border: "1px solid rgba(26, 110, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.95rem",
              fontWeight: "500",
              letterSpacing: "0.01em",
              transition: "all 0.3s ease"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;