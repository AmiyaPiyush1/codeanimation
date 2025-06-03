import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { CSSPlugin } from "gsap/CSSPlugin";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css";
import { motion, AnimatePresence } from "framer-motion";
import debounce from 'lodash/debounce';

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

  // Optimize scroll handler
  const handleScroll = useCallback(() => {
    const scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
    const shouldBeScrolled = scrollPosition > 20;
    
    if (shouldBeScrolled !== isScrolled) {
      setIsScrolled(shouldBeScrolled);

      // Create timeline for smooth transitions
      const tl = gsap.timeline({
        onStart: () => {
          gsap.set(navbarRef.current, {
            transformOrigin: "center center",
          });
        }
      });

      if (shouldBeScrolled) {
        // Scrolling down animation - optimized
        tl.to(navbarRef.current, {
          y: 0,
          scale: 1,
          opacity: 1,
          width: "90%",
          maxWidth: "1200px",
          padding: "clamp(0.2rem, 0.5vw, 0.4rem)",
          borderRadius: "50px",
          backgroundColor: "rgba(255,255,255, 0.05)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)", // Reduced shadow
          backdropFilter: "blur(10px)", // Reduced blur
          top: "0.5rem",
          duration: 0.15, // Reduced duration
          ease: "power2.out",
          immediateRender: true,
          force3D: true,
        });

        // Animate content sections with stable positioning - optimized
        const sections = [logoRef.current, mainLinksRef.current, authLinksRef.current];
        sections.forEach((section, index) => {
          if(section){
            if (index === 0) {
              tl.fromTo(section,
                {
                  scale: 0.98,
                  opacity: 0.9
                },
                {
                  scale: 0.95, // Reduced scale
                  opacity: 1,
                  duration: 0.15, // Reduced duration
                  ease: "power2.out",
                  delay: index * 0.01, // Reduced delay
                },
                "-=0.1"
              );
            } else {
              tl.fromTo(section,
                {
                  scale: 0.98,
                  opacity: 0.9
                },
                {
                  scale: 1,
                  opacity: 1,
                  duration: 0.15, // Reduced duration
                  ease: "power2.out",
                  delay: index * 0.01, // Reduced delay
                },
                "-=0.1"
              );
            }
          }
        });
      } else {
        // Scrolling up animation - optimized
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
          duration: 0.1, // Reduced duration
          ease: "power2.out",
          immediateRender: true,
          force3D: true,
        });

        const sections = [logoRef.current, mainLinksRef.current, authLinksRef.current];
        sections.forEach((section, index) => {
          if(section){
            tl.fromTo(section,
              {
                scale: index === 0 ? 0.95 : 0.98, // Reduced scale
                opacity: 0.9
              },
              {
                scale: 1,
                opacity: 1,
                duration: 0.1, // Reduced duration
                ease: "power2.out",
                delay: index * 0.02, // Reduced delay
              },
              "-=0.1"
            );
          }
        });
      }
    }
  }, [isScrolled]);

  // Debounced scroll handler
  const debouncedScrollHandler = useMemo(
    () => debounce(handleScroll, 10, { leading: true, trailing: true }),
    [handleScroll]
  );

  useEffect(() => {
    // Add scroll event listener with passive flag
    window.addEventListener('scroll', debouncedScrollHandler, { passive: true });
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedScrollHandler);
      debouncedScrollHandler.cancel();
    };
  }, [debouncedScrollHandler]);

  // Memoize profile image preloading
  const preloadProfileImage = useCallback(() => {
    if (user?.picture) {
      // Check if image is already cached
      const cachedImage = localStorage.getItem('cachedProfileImage');
      if (cachedImage === user.picture) {
        setProfileImageLoaded(true);
        return;
      }

      const img = new Image();
      img.src = user.picture;
      img.onload = () => {
        setProfileImageLoaded(true);
        // Cache the image URL
        localStorage.setItem('cachedProfileImage', user.picture);
      };
      img.onerror = () => {
        console.error('Error preloading profile image');
        setProfileImageLoaded(false);
        localStorage.removeItem('cachedProfileImage');
      };
    }
  }, [user?.picture]);

  useEffect(() => {
    preloadProfileImage();
  }, [preloadProfileImage]);

  // Memoize handlers
  const handleLoginSuccess = useCallback(async (credentialResponse) => {
    try {
      const decodedToken = jwtDecode(credentialResponse.credential);
      await handleGoogleCallback(credentialResponse.credential);
      navigate("/dashboard");
    } catch (error) {
      console.error('Error during Google login:', error);
      logout('Login failed. Please try again.');
    }
  }, [handleGoogleCallback, logout, navigate]);

  const handleLogout = useCallback(() => {
    logout('You have been successfully logged out.');
    navigate("/");
  }, [logout, navigate]);

  const handleProfileUpdate = useCallback(async (updates) => {
    try {
      const updatedUser = await updateUserProfile(updates);
      if (updatedUser) {
        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [updateUserProfile]);

  // Optimize hover handlers
  const handleHover = useCallback((element) => {
    const block = element.querySelector('.hover-block');
    const innerBlock = element.querySelector('.hover-block-inner');
    const glowBlock = element.querySelector('.hover-glow');
    const link = element.querySelector('a');
    const icon = element.querySelector('svg');
    
    if (block) {
      gsap.to(block, {
        scaleX: 1,
        opacity: 1,
        duration: 0.3, // Reduced duration
        ease: "power2.out",
        force3D: true
      });
    }

    if (innerBlock) {
      gsap.to(innerBlock, {
        scaleX: 1,
        opacity: 1,
        duration: 0.4, // Reduced duration
        delay: 0.05, // Reduced delay
        ease: "power2.out",
        force3D: true
      });
    }

    if (glowBlock) {
      gsap.to(glowBlock, {
        scale: 1.1, // Reduced scale
        opacity: 0.6, // Reduced opacity
        duration: 0.4, // Reduced duration
        ease: "power2.out",
        force3D: true
      });
    }

    if (link && !element.id) {
      gsap.to(link, {
        color: "#ffffff",
        duration: 0.2, // Reduced duration
        ease: "power2.out"
      });
    }

    if (icon) {
      gsap.to(icon, {
        scale: 1.05, // Reduced scale
        stroke: "#ffffff",
        duration: 0.2, // Reduced duration
        ease: "power2.out"
      });
    }
  }, []);

  const handleHoverOut = useCallback((element) => {
    const block = element.querySelector('.hover-block');
    const innerBlock = element.querySelector('.hover-block-inner');
    const glowBlock = element.querySelector('.hover-glow');
    const link = element.querySelector('a');
    const icon = element.querySelector('svg');
    
    if (block) {
      gsap.to(block, {
        scaleX: 0,
        opacity: 0,
        duration: 0.3, // Reduced duration
        ease: "power2.inOut",
        force3D: true
      });
    }

    if (innerBlock) {
      gsap.to(innerBlock, {
        scaleX: 0,
        opacity: 0,
        duration: 0.2, // Reduced duration
        ease: "power2.inOut",
        force3D: true
      });
    }

    if (glowBlock) {
      gsap.to(glowBlock, {
        scale: 0.9, // Reduced scale
        opacity: 0,
        duration: 0.2, // Reduced duration
        ease: "power2.inOut",
        force3D: true
      });
    }

    if (link && !element.id) {
      gsap.to(link, {
        color: "#ffffff",
        duration: 0.2, // Reduced duration
        ease: "power2.out"
      });
    }

    if (icon) {
      gsap.to(icon, {
        scale: 1,
        stroke: "#ffffff",
        duration: 0.2, // Reduced duration
        ease: "power2.out"
      });
    }
  }, []);

  const handleImageError = (e) => {
    console.error('Error loading profile picture:', e);
    // Generate a fallback avatar using the user's name
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1f2937&color=fff&size=28`;
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
              borderRadius: "2rem",
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
                borderRadius: "2rem",
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
              borderRadius: "2rem",
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
                borderRadius: "2rem",
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
              borderRadius: "2rem",
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
                borderRadius: "2rem",
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
        <AnimatePresence mode="wait">
          {user ? (
            <motion.div
              key="auth-buttons"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex items-center gap-4"
            >
              <div 
                onMouseEnter={(e) => handleHover(e.currentTarget)}
                onMouseLeave={(e) => handleHoverOut(e.currentTarget)}
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
                    borderRadius: "2rem",
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
                      transform: "scaleX(0)",
                      transformOrigin: "left",
                      opacity: 0,
                      borderRadius: "2rem",
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
                  padding: "0 0.3rem",
                  transition: "all 0.3s ease"
                }}>
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "relative",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      overflow: "hidden"
                    }}
                  >
                    <motion.img
                      src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=28`}
                      alt={user.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        opacity: profileImageLoaded ? 1 : 0,
                        transition: "opacity 0.3s ease"
                      }}
                      onError={handleImageError}
                      onLoad={() => setProfileImageLoaded(true)}
                    />
                    {!profileImageLoaded && (
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
                        justifyContent: "center"
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#1a6eff" }}>
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                  <span style={{ 
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    letterSpacing: "0.01em",
                    opacity: isScrolled ? 0 : 1,
                    transform: `translateY(${isScrolled ? "100%" : "0"})`,
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "150px"
                  }}>
                    {user.name}
                  </span>
                </Link>
              </div>
              <div className="auth-buttons">
                <motion.button
                  id="logout"
                  onClick={handleLogout}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                    color: "#FFFAFA",
                    padding: "clamp(0.4rem, 0.5vw, 0.5rem) clamp(1.2rem, 1.6vw, 1.6rem)",
                    textDecoration: "none",
                    border: "none",
                    borderRadius: "clamp(1.2rem, 1.5vw, 1.5rem)",
                    transform: "scale(0.95)",
                    transition: "all 0.2s ease-out",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "clamp(0.8rem, 0.9vw, 0.9rem)",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    minWidth: "fit-content",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    boxShadow: "0 4px 20px rgba(79, 70, 229, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    letterSpacing: "0.02em",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      transition: "all 0.3s ease",
                      transform: "translateY(1px)",
                      filter: "drop-shadow(0 1px 2px rgba(79, 70, 229, 0.3))"
                    }}
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="login-button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex items-center gap-4"
            >
              <div className="auth-buttons">
                <motion.button
                  id="signup"
                  onClick={() => navigate("/signup")}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                  style={{
                    background: "linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)",
                    color: "#FFFAFA",
                    padding: "clamp(0.4rem, 0.5vw, 0.5rem) clamp(1.2rem, 1.6vw, 1.6rem)",
                    textDecoration: "none",
                    border: "1px solid rgba(79, 70, 229, 0.5)",
                    borderRadius: "clamp(1.2rem, 1.5vw, 1.5rem)",
                    transform: "scale(0.95)",
                    transition: "all 0.2s ease-out",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "clamp(0.8rem, 0.9vw, 0.9rem)",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    minWidth: "fit-content",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    boxShadow: "0 4px 20px rgba(79, 70, 229, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    letterSpacing: "0.02em",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      transition: "all 0.3s ease",
                      transform: "translateY(1px)",
                      filter: "drop-shadow(0 1px 2px rgba(79, 70, 229, 0.3))"
                    }}
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Sign Up
                </motion.button>
                <motion.button
                  id="login"
                  onClick={() => navigate("/login")}
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ 
                    scale: 0.98,
                    transition: { duration: 0.1 }
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                    color: "#FFFAFA",
                    padding: "clamp(0.4rem, 0.5vw, 0.5rem) clamp(1.2rem, 1.6vw, 1.6rem)",
                    textDecoration: "none",
                    border: "none",
                    borderRadius: "clamp(1.2rem, 1.5vw, 1.5rem)",
                    transform: "scale(0.95)",
                    transition: "all 0.2s ease-out",
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: "clamp(0.8rem, 0.9vw, 0.9rem)",
                    fontWeight: "600",
                    whiteSpace: "nowrap",
                    minWidth: "fit-content",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    boxShadow: "0 4px 20px rgba(79, 70, 229, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.1)",
                    letterSpacing: "0.02em",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    textRendering: "optimizeLegibility",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{
                      transition: "all 0.3s ease",
                      transform: "translateY(1px)",
                      filter: "drop-shadow(0 1px 2px rgba(79, 70, 229, 0.3))"
                    }}
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Login
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;