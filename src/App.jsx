import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import "./App.css";

const App = () => {
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);
  const [DebuggedData,setDebuggedData]=useState("");
  const [code, setCode] = useState("// Write your code here...");
  const [Execute,setExecute]=useState(0);
  const  [loader,setLoader]=useState(false);

  const containerRef = useRef(null);
  const isResizing = useRef(false);
  const currentResizer = useRef(null);

  const handleMouseDown = (event, resizer) => {
    isResizing.current = true;
    currentResizer.current = resizer;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (event) => {
    if (!isResizing.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    let newLeftWidth, newMiddleWidth, newRightWidth;

    if (currentResizer.current === "left") {
      newLeftWidth = ((event.clientX - containerRect.left) / containerRect.width) * 100;
      newMiddleWidth = 100 - newLeftWidth - rightWidth;
      if (newLeftWidth > 10 && newMiddleWidth > 10) {
        setLeftWidth(newLeftWidth);
        setMiddleWidth(newMiddleWidth);
      }
    } else if (currentResizer.current === "right") {
      newMiddleWidth = ((event.clientX - containerRect.left) / containerRect.width) * 100 - leftWidth;
      newRightWidth = 100 - leftWidth - newMiddleWidth;
      if (newMiddleWidth > 10 && newRightWidth > 10) {
        setMiddleWidth(newMiddleWidth);
        setRightWidth(newRightWidth);
      }
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    currentResizer.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Loader animation variants
  const loaderVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }, // Zoom-in effect
    exit: { scale: 0, opacity: 0, transition: { duration: 0.5, ease: "easeIn" } }, // Zoom-out effect
  };

  // Debugged Data animation variants
  const dataVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: "easeOut", delay: 0.1 } },
  };

  // for making the execute button send request
  const handleExecute = () => {
    setExecute((prev) => prev + 1);
  };
  

  // for showing code in code debugging section
  useEffect(() => {
    if (Execute === 0) return;
    setLoader(true);
  
    const showData = async () => {
      try {
        const response = await fetch("http://localhost:3000/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem: code }),
        });
  
        const data = await response.json();
        setDebuggedData(data);
      } catch (error) {
        console.error("Error executing:", error);
        setDebuggedData({ error: "Execution failed" });
      } finally {
        setLoader(false); // Ensuring loader stops after the API call completes
      }
    };
  
    showData();
  }, [Execute]);
  
  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <a href ="/" className="logo">
          <img src="logo.png" alt="CodeStream" />
        </a>
        <div className="search-bar">
          <input type="checkbox" id="checkbox" />
          <label for="checkbox" class="toggle">
              <div class="bars" id="bar1"></div>
              <div class="bars" id="bar2"></div>
              <div class="bars" id="bar3"></div>
          </label>
        </div>

        <div className="search-bar-menu">
          <div className="profile-section">
            <img src="profile.png" alt="Profile" />
            <div className="profile-name">John Doe</div>
          </div>
          <div className="options-section">
            <a href="#">Explore</a>
            <a href="#">Problems</a>
            <a href="#">Settings</a>
            <a href="#">Sign out</a>
          </div>
        </div>
        
        <div className="nav-links">
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>&nbsp;Home</a>
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>&nbsp; About</a>
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>&nbsp; Contact</a>
          <a href="#">Sign up</a>
          <a href="#" id="login">Log in</a>
        </div>
      </nav>

      {/* Resizable Sections */}
      <div className="main-content" ref={containerRef}>
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
          <MonacoEditor
              className="editor"
              language="javascript"
              value={code}
              onChange={(newCode) => setCode(newCode)}
              options={{ fontSize: 14, minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              roundedSelection: false,
              cursorBlinking: "smooth", 
              theme: "vs-light"}}
              
            />
          <div className="buttons">
            <button>First</button>
            <button>Prev</button>
            <button id="execute" onClick={handleExecute}>Execute</button>
            <button>Next</button>
            <button>Last</button>
          </div>
        </div>
        <div className="resizer" onMouseDown={(e) => handleMouseDown(e, "left")}></div>
        {/* Visual Debugger Section */}
        <div className="section" id="visual-debugger" style={{ width: `${middleWidth}%` }}>
          <p>Visual Debugging Section</p>
          <br /><br />
          
          <AnimatePresence mode="wait">
  {loader ? (
    <motion.div
      className="loader"
      variants={loaderVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    />
  ) : DebuggedData && (
    <motion.div
      className="debug-output"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.2 } // Stagger sections
        },
      }}
    >
      {[
        { label: "Problem Statement", value: DebuggedData.problem_statement },
        { label: "Key Concepts", value: DebuggedData.key_concepts },
        { label: "Approach", value: DebuggedData.approach },
        { label: "Time Complexity", value: DebuggedData.time_complexity },
        { label: "Code Solution", value: DebuggedData.code_solution },
        { label: "Explanation", value: DebuggedData.explanation }
      ].map((item, index) => (
        item.value && (
          <motion.div
            key={index}
            className="debug-section"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 } // Stagger each line inside the section
              },
            }}
          >
            <motion.div
              className="section-title"
              variants={{
                hidden: { y: 20, scale: 0.8, opacity: 0 },
                visible: { y: 0, scale: 1, opacity: 1, transition: { duration: 0.3 } }
              }}
            >
              <strong>{item.label}:</strong>
            </motion.div>
            {item.value.split("\n").map((line, lineIndex) => (
              <motion.div
                key={lineIndex}
                className="debug-line"
                variants={{
                  hidden: { y: 20, scale: 0.9, opacity: 0 }, // Bottom to top effect
                  visible: { y: 0, scale: 1, opacity: 1, transition: { duration: 0.25 }, ease: "easeOut" }
                }}
              >
                {line}
              </motion.div>
            ))}
      <br /> {/* Added break after each section */}
    </motion.div>
  )
))}
    </motion.div>
  )}
</AnimatePresence>
        </div>
        <div className="resizer" onMouseDown={(e) => handleMouseDown(e, "right")}></div>
        <div className="section" id="variable-space" style={{ width: `${rightWidth}%` }}>Variable Space</div>
      </div>
    </div>
  );
};

export default App;