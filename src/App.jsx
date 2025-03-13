import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  applyNodeChanges,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "./App.css";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setGraph({ rankdir: "TB" });
dagreGraph.setDefaultEdgeLabel(() => ({}));

const applyDagreLayout = (nodes, edges) => {
  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 180, height: 50 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => ({
      ...node,
      position: {
        x: dagreGraph.node(node.id).x,
        y: dagreGraph.node(node.id).y,
      },
    })),
    edges,
  };
};

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
  return "plaintext"; // Default fallback
};

const App = () => {
  const [leftWidth, setLeftWidth] = useState(33.33);
  const [middleWidth, setMiddleWidth] = useState(33.33);
  const [rightWidth, setRightWidth] = useState(33.33);
  const [debuggedQueue, setDebuggedQueue] = useState([]);
  const [code, setCode] = useState("// Write your code here...");
  const [loader, setLoader] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [language, setLanguage] = useState("plaintext");
  const editorRef = useRef(null);

  useEffect(() => {
    setLanguage(detectLanguage(code));
  }, [code]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.setModelLanguage(editor.getModel(), language);
  };

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  const handleMouseDown = (section) => (e) => {
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
    setDragging({ ...dragging, startX: e.clientX });
  };

  const handleMouseUp = () => setDragging(null);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const handleExecute = useCallback(async () => {
    setLoader(true);

    try {
      const response = await fetch("http://localhost:3000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: code }),
      });

      const data = await response.json();
      let extractedData = [];

      if (Array.isArray(data.loop)) {
        extractedData = data.loop.flatMap((step, index) =>
          Object.entries(step)
            .filter(([key]) => key.toLowerCase() !== "json")
            .map(([key, value]) => `Step ${index + 1} → ${key}: ${value}`)
        );
      } else if (typeof data.loop === "object") {
        extractedData = Object.entries(data.loop)
          .filter(([key]) => key.toLowerCase() !== "json")
          .map(([key, value]) => `${key}: ${value}`);
      } else if (typeof data.loop === "string") {
        extractedData = data.loop
          .replace(/```json|```/g, "")
          .replace(/[{}[\],"]/g, "")
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line);
      }

      setDebuggedQueue(extractedData);

      const newNodes = extractedData.map((line, index) => ({
        id: `${index}`,
        data: { label: line },
        position: { x: 100, y: index * 100 },
        draggable: true,
        style: {
          border: "2px solid #555",
          padding: 10,
          borderRadius: 8,
          fontSize: 14,
          boxShadow: "2px 4px 8px rgba(0, 0, 0, 0.2)",
          backgroundColor: line.includes("i++")
            ? "#DFF2BF"
            : line.includes("i<n")
            ? "#BDE0FE"
            : "#FFD3B6",
        },
      }));

      const newEdges = extractedData.slice(1).map((_, index) => ({
        id: `e${index}-${index + 1}`,
        source: `${index}`,
        target: `${index + 1}`,
        animated: true,
        type: "smoothstep",
        style: { stroke: "#555", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
        },
      }));

      const layoutedElements = applyDagreLayout(newNodes, newEdges);
      setNodes(layoutedElements.nodes);
      setEdges(layoutedElements.edges);
    } catch (error) {
      console.error("Execution Error:", error);
    } finally {
      setLoader(false);
    }
  }, [code]);

  return (
    <div className="container">
      <nav className="navbar">
        <a href="/" className="logo">
          <img src="logo.png" alt="CodeStream" />
        </a>
        <div className="nav-links">
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> &nbsp;Home</a>
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> &nbsp;About</a>
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> &nbsp;Contact</a>
          <a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user-round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg> &nbsp;Sign up</a>
          <a href="#" id="login">Sign in</a>
        </div>
      </nav>

      <div className="main-content">
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
            <MonacoEditor
              className="editor"
              language="{language}"
              value={code}
              onChange={(newCode) => setCode(newCode)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
              onMount={handleEditorDidMount}
            />
          <div className="buttons">
            <button>First</button>
            <button>Prev</button>
            <button id="execute" onClick={handleExecute}>Execute</button>
            <button>Next</button>
            <button>Last</button>
          </div>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown("left")}></div>

        <div className="section" id="visual-debugger" style={{ width: `${middleWidth}%` }}>
          <AnimatePresence mode="wait">
            {loader ? (
              <motion.div
                className="loader"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.3 } }}
                exit={{ scale: 0, opacity: 0, transition: { duration: 0.5 } }}
              />
            ) : (
              <ReactFlow 
                nodes={nodes}
                edges={edges} 
                onNodesChange={onNodesChange} 
                fitView
              >
                <Controls />
                <Background variant="dots" gap={12} size={1} />
              </ReactFlow>
            )}
          </AnimatePresence>
        </div>

        <div className="resizer" onMouseDown={handleMouseDown("middle")}></div>
        <div className="section" id="variable-space" style={{ width: `${rightWidth}%` }}>
          Variable Space
        </div>
      </div>
    </div>
  );
};

export default App;