import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, transform } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";  // Importing useNavigate if you're using React Router
import MonacoEditor from "@monaco-editor/react";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import axios from "axios";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "./VisualDebuggerBoiler.css";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

dagreGraph.setGraph({
  rankdir: "TB", // Can be dynamically changed ("TB", "LR", "RL", "BT")
  nodesep: 50,  // Spacing between nodes
  ranksep: 100, // Spacing between ranks
  marginx: 20,  
  marginy: 20,
});

const applyDagreLayout = (nodes, edges, layoutOptions = {}) => {
  const { rankdir = "TB", nodesep = 50, ranksep = 100 } = layoutOptions;

  // Update graph layout properties dynamically
  dagreGraph.setGraph({ rankdir, nodesep, ranksep, marginx: 20, marginy: 20 });
  
  // Add nodes to the graph with dynamic sizing
  nodes.forEach((node) => {
    const width = node.width || 150; // Default width
    const height = node.height || 60; // Default height
    dagreGraph.setNode(node.id, { width, height });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, { weight: edge.weight || 1 });
  });

  // Compute layout
  dagre.layout(dagreGraph);

  // Update node positions with computed layout
  const positionedNodes = nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return { ...node, position: { x, y } };
  });

  return { nodes: positionedNodes, edges };
};

const VisualDebuggerBoiler = () => {
// Layout and state variables
const [leftWidth, setLeftWidth] = useState(33.33);
const [middleWidth, setMiddleWidth] = useState(33.33);
const [rightWidth, setRightWidth] = useState(33.33);
const [copied, setCopied] = useState(false);
const [fullscreen, setFullscreen] = useState(false);
const [isRunning, setIsRunning] = useState(false);
const [isPaused, setIsPaused] = useState(false);
const [isReadOnly, setIsReadOnly] = useState(false);
const monacoInstance = useRef(null);
const [debuggedQueue, setDebuggedQueue] = useState([]);
const [code, setCode] = useState('');
const [loader, setLoader] = useState(false);
const [execute, setExecute] = useState(false);
const [nodes, setNodes] = useState([]);
const [edges, setEdges] = useState([]);
const [dragging, setDragging] = useState(null);
const [language, setLanguage] = useState('');
const [currentStep, setCurrentStep] = useState(0);
const location = useLocation();
const editorRef = useRef(null);
const hasRun = useRef(false);
const processRef = useRef(null);
const {problemType, specificType} = location.state || {};
const [Trace,setTrace] = useState();

// Detect language based on code contents
const detectLanguage = (code) => {
if (/^\s*#include\s+[<"]/.test(code) || /\bint\s+main\s*\(/.test(code)) {
  return "cpp";
} else if (/^\s*import\s+\w+/.test(code) || /\bdef\s+\w+\s*\(/.test(code)) {
  return "python";
} else if (/^\s*public\s+class\s+\w+/.test(code) || /\bSystem\.out\.print/.test(code)) {
  return "java";
} else if (/^\s*function\s+\w+\(/.test(code) || /\bconsole\.log/.test(code)) {
  return "javascript";
} else if (/\bSELECT\b.*\bFROM\b/i.test(code) || /\bINSERT\s+INTO\b/i.test(code)) {
  return "sql";
}
return "plaintext";
};

const handleEditorDidMount = (editor) => {
editorRef.current = editor;
editorRef.current.decorations = []; // Initialize decorations
};

// First useEffect to get code from localStorage on mount
useEffect(() => {
const userCode = localStorage.getItem('code');

if (userCode) {
  setCode(userCode); // Set the code from localStorage
  setLanguage(detectLanguage(userCode)); // Detect language based on the code
}
}, []); // Empty dependency array: will run only once on component mount

useEffect(() => {
if (!hasRun.current && code) {
  const executeButton = document.querySelector('#execute'); // Target the execute button
  if (executeButton && location.pathname !== "/debugger") {
    executeButton.click(); // Simulate the button click
  }
  hasRun.current = true; // Mark as executed
}
}, [code]);  // Empty dependency array: will run only once on component mount

// Second useEffect to update localStorage whenever code changes
useEffect(() => {
if (code === '') {
  // If the code is empty, remove it from localStorage
  localStorage.removeItem('code');
} else {
  // Update localStorage with the current code
  localStorage.setItem('code', code);
}

// Update the language based on the code
setLanguage(detectLanguage(code));

}, [code]); // This will run every time the 'code' changes

const handleChange = (value, e) => {
if (value !== undefined) {
  setCode(value);
  setExecute(false);
} else {
  console.error('Monaco editor value is undefined');
}
};

const FlowController = ({ currentStep, nodes }) => {
  const { setCenter } = useReactFlow();

  useEffect(() => {
      if (nodes.length > 0 && nodes[currentStep]) {
          const activeNode = nodes[currentStep];
          
          // Apply manual adjustments to X and Y positions
          const adjustedX = activeNode.position.x + 80; // Adjust X position
          const adjustedY = activeNode.position.y + 80; // Adjust Y position
          
          // Smooth transition to the adjusted node position
          setCenter(adjustedX, adjustedY, {
              zoom: 1.25,
              duration: 500, // Smooth transition duration
              easing: (t) => t * (2 - t), // Ease-out effect
          });
      }
  }, [currentStep, nodes, setCenter]);

  return null;
};

useEffect(() => {
  if (editorRef.current) {
    editorRef.current.getModel()?.setLanguage(language);
  }
}, [language]);

const handleMouseDown = (section) => (e) => {
  e.preventDefault(); // Prevents unwanted text selection
  setDragging({ section, startX: e.clientX });
};

const handleMouseMove = (e) => {
  if (!dragging) return;

  const { section, startX } = dragging;
  const dx = e.clientX - startX;
  const totalWidth = window.innerWidth;
  const percentChange = (dx / totalWidth) * 100;

  if (section === "left") {
    setLeftWidth((prev) => Math.max(10, prev + percentChange));
    setMiddleWidth((prev) => Math.max(10, prev - percentChange));
  } else if (section === "middle") {
    setMiddleWidth((prev) => Math.max(10, prev + percentChange));
    setRightWidth((prev) => Math.max(10, prev - percentChange));
  }

  setDragging({ section, startX: e.clientX }); // Update dragging position
};

const handleMouseUp = () => {
  setDragging(null);
};

useEffect(() => {
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  
  return () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
}, [dragging]); // `dragging` needs to be in dependency for smooth updates

// Handle React Flow node changes
const onNodesChange = useCallback(
  (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
  []
);

// Effect hook to update editor options when `isReadOnly` changes
useEffect(() => {
if (monacoInstance.current) {
  monacoInstance.current.updateOptions({ readOnly: isReadOnly });
}
}, [isReadOnly]); // Run this effect whenever `isReadOnly` state changes

// Toggle Read-Only Mode
const toggleReadOnly = () => {
setIsReadOnly((prev) => !prev); // Toggle the read-only state
};


// Copy editor content
const copyToClipboard = async () => {
  if (editorRef.current) {
    const code = editorRef.current.getValue();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      // Reset to original icon after 1 seconds
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy code: ", err);
    }
  }
};

// Undo last code change
const handleUndo = () => {
if (editorRef.current) {
  const editor = editorRef.current;
  editor.trigger("keyboard", "undo");
}
};

// Redo last undone change
const handleRedo = () => {
if (editorRef.current) {
  const editor = editorRef.current;
  editor.trigger("keyboard", "redo");
}
};

const handleShare = async () => {
  if (!editorRef.current) return;

  const code = editorRef.current.getValue();
  const language = detectLanguage(code) || "txt";
  const fileName = `code-snippet.${language}`;
  const shareText = `Check out this code snippet (${language.toUpperCase()}):\n\n${code}`;
  const shareFile = new Blob([code], { type: "text/plain" });
  const fileObject = new File([shareFile], fileName, { type: "text/plain" });

  // Share data object
  const shareData = {
    title: "Shared Code",
    text: shareText,
    files: [fileObject],
  };

  try {
    // Use Web Share API if supported
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return;
    }

    // Fallback: Copy text to clipboard
    await navigator.clipboard.writeText(shareText);

    // Auto-download the code snippet file
    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(shareFile);
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

  } catch (error) {
    console.error("Error sharing code:", error);
  }
};

// Smoothly toggle full-screen mode for the Monaco editor with Escape key support
const handleFullscreen = (id) => {
  const editorSection = document.getElementById(id);
  if (!editorSection) return;

  // Check if in fullscreen mode
  const isFullscreen = () => !!document.fullscreenElement;

  // Get section position
  const getPositionClass = () => {
  const rect = editorSection.getBoundingClientRect();
  const screenWidth = window.innerWidth;
  const sectionCenter = rect.left + rect.width / 2;

  if (sectionCenter < screenWidth * 0.33) {
    return "fullscreen-left";  // Section is in the left third of the screen
  } else if (sectionCenter > screenWidth * 0.66) {
    return "fullscreen-right"; // Section is in the right third of the screen
  } else {
    return "fullscreen-center"; // Section is in the middle third
  }
};

// Handle fullscreen change
const handleFullscreenChange = () => {
  if (!isFullscreen()) {
    editorSection.classList.remove("fullscreen-active", "fullscreen-left", "fullscreen-center", "fullscreen-right");
    setFullscreen(false);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }
};

// Escape key handler
const handleKeyDown = (e) => {
  if (e.key === "Escape") {
    exitFullscreen();
  }
};

// Enter fullscreen with animation based on position
const enterFullscreen = () => {
  if (editorSection.requestFullscreen) {
    editorSection.requestFullscreen()
      .then(() => {
        const positionClass = getPositionClass(); // Get the appropriate animation class
        setTimeout(() => {
          editorSection.classList.add("fullscreen-active", positionClass);
          setFullscreen(true);
        }, 300);

        // Add event listeners
        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
      })
      .catch((err) => console.error("Error enabling fullscreen:", err));
  } else {
    console.error("Fullscreen API not supported");
  }
};

// Exit fullscreen
const exitFullscreen = () => {
  if (isFullscreen() && document.exitFullscreen) {
    document.exitFullscreen()
      .catch((err) => console.error("Error exiting fullscreen:", err));
  }
};

// Toggle fullscreen state
isFullscreen() ? exitFullscreen() : enterFullscreen();
};

const handleNext = () => {
  if (currentStep < debuggedQueue.length - 1) {
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    const step = debuggedQueue[nextStep];

    // Update nodes: Remove previous highlights and apply only to the current ones
    setNodes(prevNodes =>
      prevNodes.map(node => ({
        ...node,
        className:
          node.id === step.processedNode || step.childNodes.includes(node.id)
            ? `${node.className} highlighted-node`
            : node.className.replace(" highlighted-node", ""),
      }))
    );
  } else {
    console.log("No more steps to display.");
  }
};


const handlePrev = () => {
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1); // Just move the highlight
  }
};

const handleFirst = () => {
  setCurrentStep(0);
};

const handleLast = () => {
  setCurrentStep(debuggedQueue.length - 1);
};

useEffect(() => {
  setNodes((prevNodes) => {
    const updatedNodes = prevNodes.map((node, index) => ({
      ...node,
      style: {
        ...node.style,
        border: index === currentStep ? "1.7px solid #555" : "1.5px solid transparent",
        transition: "border 0.1s ease-out"
      },
    }));

    // Reapply layout for better visual arrangement
    const layouted = applyDagreLayout(updatedNodes, edges);
    
    return layouted.nodes;
  });
}, [currentStep, edges]);

useEffect(() => {
  if (!editorRef.current || debuggedQueue.length === 0) return;

  const editor = editorRef.current;
  const model = editor.getModel();
  if (!model) return;

  const lineNumber = debuggedQueue[currentStep]?.line || 1; // Default to line 1

  // Remove previous decorations
  editorRef.current.decorations = editor.deltaDecorations(
    editorRef.current.decorations || [],
    []
  );

  // Apply new decoration for highlighting
  editorRef.current.decorations = editor.deltaDecorations(
    [],
    [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, model.getLineMaxColumn(lineNumber)),
        options: {
          isWholeLine: true,
          className: "highlight-line",
        },
      },
    ]
  );

  // Ensure smooth scrolling to the highlighted line
  editor.revealLineInCenter(lineNumber);
}, [currentStep, debuggedQueue]);

const toggleProcess = async () => {
  if (isRunning) {
    clearInterval(processRef.current);
    try {
      await axios.post("http://localhost:3000/stop-execution");
      console.log("Execution stopped and request sent to API");
    } catch (error) {
      console.error("Error stopping execution:", error);
    }
    setIsRunning(true);
    setIsPaused(false);
  } else {
    setIsRunning(true);
    setIsPaused(false);
    await handleExecute();
  }
};

const navigate = useNavigate(); // Using useNavigate hook

// Function to identify problem type and route accordingly
const identifyProblemAndRoute = useCallback(async (code) => {
  try {
    // Send code to backend for problem identification
    const response = await axios.post("http://localhost:3000/debugger/identifyproblem", {
        problem: code
    });

    const problemType = response.data.problemType.replace(/\s+/g, '').toLowerCase().trim();  // Directly use response.data.problemType
    const specificType = response.data.specificType.replace(/\s+/g, '').toLowerCase().trim();  // Get specificType

    // Route based on both problem type and specific type
    if (problemType === `${problemType}` && specificType === `${specificType}`) {
      navigate(`/debugger/${problemType}/${specificType}`, { state: { problemType, specificType } });
    } else {
      console.log("No specific handler for this problem type.");
    }
  } catch (error) {
    console.error("Error identifying problem type or routing:", error);
  }
}, [navigate]);

// Execute and fetch the API response
const handleExecute = useCallback(async () => {
  setLoader(true);
  localStorage.setItem("code", code);

  try {
    // 1. Detect Language
    const detectedLang = detectLanguage(code);
    if (detectedLang === "plaintext") {
      setNodes([
        {
          id: "error",
          data: { label: "Syntax Error: Unrecognized programming language." },
          position: { x: 200, y: 200 },
          draggable: false,
          className: "error-node", // Use CSS class to style error node
        }
      ]);
      setEdges([]);
      setLoader(false);
      return;
    }

    // 2. Identify problem type and route based on `code`
    await identifyProblemAndRoute(code);

    // 3. Ensure we are on the correct path before fetching
    
   
    if (location.pathname === `/debugger/${problemType}/${specificType}`) {
      try {
        // 4. POST the code to your backend
        const response = await fetch(
          `http://localhost:3000/debugger/${problemType}/${specificType}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problem: code }),
          }
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        // 5. Parse the backend response
        const data = await response.json();
        // Expected structure: { inputArray, sortedArray, mergeSortTable }
        const { inputArray, sortedArray, mergeSortTable, executionTrace } = data;
        setTrace(executionTrace);
        if (!inputArray || !sortedArray || !mergeSortTable) {
          throw new Error("Invalid response format from backend.");
        }

        // 6. Build Nodes & Edges from mergeSortTable
        const backendNodes = mergeSortTable.nodes;
        const backendEdges = mergeSortTable.edges;

        // Compute a level (y-position) for each node based on the DAG dependencies.
        // First, compute in-degrees.
        const inDegree = {};
        backendNodes.forEach((node) => {
          inDegree[node.id] = 0;
        });
        backendEdges.forEach((edge) => {
          inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
        });

        // Nodes with in-degree 0 start at level 0.
        const levelMap = {}; // map of nodeId -> level
        const queue = [];
        backendNodes.forEach((node) => {
          if (inDegree[node.id] === 0) {
            levelMap[node.id] = 0;
            queue.push(node.id);
          }
        });

        // Prepare an array to store each debug step of the level calculation.
        const debugSteps = [];

        // Propagate levels: each child gets parent's level + 1.
        while (queue.length > 0) {
          const currentId = queue.shift();

          // Determine child nodes for the current node
          const childNodes = backendEdges
            .filter(edge => edge.source === currentId)
            .map(edge => edge.target);

          backendEdges.forEach((edge) => {
            if (edge.source === currentId) {
              const newLevel = levelMap[currentId] + 1;
              if (levelMap[edge.target] === undefined || newLevel > levelMap[edge.target]) {
                levelMap[edge.target] = newLevel;
              }
              // Only add the target to the queue if it isn't already present.
              if (!queue.includes(edge.target)) {
                queue.push(edge.target);
              }
            }
          });

          // Save a snapshot of the current step including the child nodes.
          debugSteps.push({
            processedNode: currentId,
            childNodes, // store child nodes for highlighting later
            currentLevelMap: { ...levelMap },
            remainingQueue: [...queue],
          });
        }
        // Save the debug steps to state so they can be accessed by handleNext.
        setDebuggedQueue(debugSteps);
        // Group nodes by level for horizontal positioning.
        const levelNodes = {};
        backendNodes.forEach((node) => {
          const lvl = levelMap[node.id] || 0;
          if (!levelNodes[lvl]) levelNodes[lvl] = [];
          levelNodes[lvl].push(node);
        });

        // Create new nodes with calculated positions.
        const newNodes = [];
        const newEdges = [];
        const levelGap = 100; // vertical spacing between levels
        const nodeGap = 120;  // horizontal spacing between nodes on same level

        Object.keys(levelNodes).forEach((lvlStr) => {
          const lvl = Number(lvlStr);
          const nodesAtLevel = levelNodes[lvl];
          nodesAtLevel.forEach((node, idx) => {
            let nodeClass = "default-node";
            if (node.id.includes("_merge")) {
              nodeClass = "merge-node";
            } else if (node.id.includes("_div")) {
              nodeClass = "div-node";
            }
            newNodes.push({
              id: node.id,
              data: { label: `${node.id}: ${JSON.stringify(node.state)}` },
              position: { x: idx * nodeGap, y: lvl * levelGap },
              draggable: false,
              className: nodeClass, // CSS class will control border, background, etc.
            });
          });
        });

        // Create new edges with moving animation and arrow markers.
        backendEdges.forEach((edge) => {
          newEdges.push({
            id: `${edge.source}-${edge.target}`,
            source: edge.source,
            target: edge.target,
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#000", // Arrow color; can be styled in CSS as well
            },
            className: "custom-edge", // Use CSS to add further styling if needed
          });
        });

        // Optionally, add a final node to show the sorted array.
        const maxLevel = Math.max(...Object.values(levelMap));
        newNodes.push({
          id: "sortedArray",
          data: { label: `Sorted Array: ${JSON.stringify(sortedArray)}` },
          position: { x: 100, y: (maxLevel + 1) * levelGap },
          draggable: false,
          className: "sorted-array-node",
        });


        // 8. Update React state to show nodes & edges in the UI
        setNodes(newNodes);
        setEdges(newEdges);
      } catch (error) {
        console.error("Error fetching merge sort data:", error);
      }
    }
  } catch (error) {
    console.error("Execution Error:", error);
  } finally {
    setLoader(false);
    setExecute(true);
    setIsRunning(false);
    setIsPaused(false);
    // Reset current debug step (so that next button starts from the first saved step)
    setCurrentStep(-1);
  }
}, [
  code,
  identifyProblemAndRoute,
  location.pathname,
  problemType,
  specificType,
]);

  return (
    <div className="container">

      <div className="main-content">
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%`}}>
            <div className="monaco-editor-toolbar">
              <button className="editor-button" onClick={handleShare}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>              
              </button>

              <button className="editor-button" onClick={toggleReadOnly}>
                {isReadOnly ? (
                  // Show Unlock Icon when in Read-Only mode
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil-off"><path d="m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982"/><path d="m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353"/><path d="m15 5 4 4"/><path d="m2 2 20 20"/></svg>                
                ) : (
                  // Show Lock Icon when in Editable mode
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>                
                )}
              </button>

              <button className="editor-button" onClick={handleUndo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-undo"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>              
              </button>

              <button className="editor-button" onClick={location.pathname === "/debugger" ? handleExecute : toggleProcess}>
                {isRunning ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>                  
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>              
                )}
              </button>

              <button className="editor-button" onClick={handleRedo}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-redo"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>              
              </button>
              
              <button className="editor-button" onClick={copyToClipboard}>
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-check" style={{ transform: "scale(1.15)" }}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard">
                    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  </svg>
                )}
              </button>
              
              <button className="editor-button" onClick={() => handleFullscreen("code-editor")}>
                {fullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>                
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                )}              
                </button>
            </div>
            
            <MonacoEditor
                className="editor"
                language={language}
                placeholder="Write your code here..."
                value={code}
                onChange={handleChange}
                options={{
                  fontSize: 14, // Increase font size for better readability
                  minimap: { enabled: false, scale: 1, side: "right" }, // Improve minimap visibility
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 0, bottom: 0, left: 0, right: 0 },
                  quickSuggestions: { other: true, comments: true, strings: true }, 
                  suggestOnTriggerCharacters: true,
                  inlineSuggest: true, // Enable inline suggestions
                  wordWrap: "on", // Enable word wrapping
                  folding: true, // Enable code folding
                  smoothScrolling: true, // Smooth scrolling for better experience
                  tabSize: 2, // Set tab size for better readability
                  // renderWhitespace: "all", // Show all whitespaces
                  overviewRulerBorder: false, // Remove ruler border for cleaner UI
                  autoClosingBrackets: "always", // Auto close brackets
                  autoClosingQuotes: "always", // Auto close quotes
                  matchBrackets: "always", // Highlight matching brackets
                  cursorStyle: "line-thin",
                  cursorBlinking: "smooth", // Smoother cursor blinking
                  cursorSmoothCaretAnimation: "on", // Smooth cursor movement
                  suggestSelection: "recentlyUsed", // Improve suggestion selection
                  parameterHints: { enabled: true }, // Show function parameter hints
                  glyphMargin: false, // Enable glyph margin for debugging indicators
                  lightbulb: { enabled: true }, // Show code action lightbulbs
                  formatOnType: true, // Auto-format code while typing
                  formatOnPaste: true, // Auto-format on paste
                  bracketPairColorization: { enabled: true }, // Colorize matching brackets
                  stickyScroll: { enabled: true }, // Enable sticky scroll for better navigation
                  lineNumbersMinChars: 3,
                  readOnly: isReadOnly,
                }}
                beforeMount={(monaco) => {
                  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
                  
                  // Define and apply a custom theme
                  monaco.editor.defineTheme("customTheme", {
                    base: "vs",
                    inherit: true,
                    rules: [],
                    colors: {
                      "editor.background": "#FFFFFF", // Your desired background color
                      "editor.lineHighlightBorder": "#FF5733"
                    },
                  });
                  
                  monaco.editor.setTheme("customTheme");
                }}
                onMount={handleEditorDidMount}
              />
              {!code && (
                <div style={{ position: "absolute", top: "4rem", left: "4.2rem", fontFamily: "Fira Code, monospace",
                  fontSize: 14, }}>
                  // Write your code here
                </div>
              )}
          <div className="buttons">
            <button className="back" onClick={handleFirst} disabled={currentStep === 0} >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-left"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
              &nbsp;First
              </button>
            <button className="back" onClick={handlePrev} disabled={currentStep === 0}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
              &nbsp;Prev
              </button>
            <button id="execute" onClick={location.pathname === "/debugger" ? handleExecute : toggleProcess}>
                {isRunning ? "Stop" : "Execute"} &nbsp;
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-code ${isRunning ? "rotate-animation" : ""}`}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </button>
            <button onClick={handleNext} disabled={currentStep >= debuggedQueue.length - 1} className="forward">
            Next&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            <button onClick={handleLast} disabled={currentStep === debuggedQueue.length} className="forward">
              Last&nbsp;
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
              </button>
          </div>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown("left")}></div>

        {/* Visual Debugger Section */}
        <div className="section" id="visual-debugger" style={{ width: `${middleWidth}%` }}>
              <button className="editor-button" id="react-flow-fullscreen" onClick={() => handleFullscreen("visual-debugger")}>
                {fullscreen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minimize"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>                
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-maximize"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                )}              
              </button>
          <AnimatePresence mode="wait">
            {loader ? (
              <motion.div
                className="loader"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.5 } }}
              />
            ) : (
              <ReactFlowProvider>
              <ReactFlow 
                nodes={nodes}
                edges={edges} 
                onNodesChange={onNodesChange} 
                fitView
              >
                <FlowController currentStep={currentStep} nodes={nodes} />
                <Controls />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
              </ReactFlowProvider>
            )}
          </AnimatePresence>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown("middle")}></div>

        {/* Variable Space Section */}
        <div
  className="section"
  id="variable-space"
  style={{
    width: `${rightWidth}%`,
    padding: "10px",
    backgroundColor: "#f7f7f7",
    borderRadius: "5px",
    fontFamily: "monospace",
    overflowX: "auto"
  }}
>
  {Trace && Array.isArray(Trace) && Trace[currentStep] ? (
    <div>
      <h3>Step {currentStep}</h3>
      <pre>{JSON.stringify(Trace[currentStep], null, 2)}</pre>
    </div>
  ) : (
    <p>Variable Space</p>
  )}
</div>


      </div>
    </div>
  );
};

export default VisualDebuggerBoiler;