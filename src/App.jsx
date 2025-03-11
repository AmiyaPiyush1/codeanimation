import React, { useState, useEffect, useCallback, useMemo } from "react";
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

const App = () => {
  const [leftWidth] = useState(33.33);
  const [middleWidth] = useState(33.33);
  const [rightWidth] = useState(33.33);
  const [debuggedQueue, setDebuggedQueue] = useState([]);
  const [code, setCode] = useState("// Write your code here...");
  const [loader, setLoader] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

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
          <a href="#">Explore</a>
          <a href="#">Problems</a>
          <a href="#" id="login">Sign in</a>
        </div>
      </nav>

      <div className="main-content">
        <div className="section" id="code-editor" style={{ width: `${leftWidth}%` }}>
          <MonacoEditor
            className="editor"
            language="javascript"
            value={code}
            onChange={(newCode) => setCode(newCode)}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
          <div className="buttons">
            <button>First</button>
            <button>Prev</button>
            <button id="execute" onClick={handleExecute}>Execute</button>
            <button>Next</button>
            <button>Last</button>
          </div>
        </div>

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

        <div className="section" id="variable-space" style={{ width: `${rightWidth}%` }}>
          Variable Space
        </div>
      </div>
    </div>
  );
};

export default App;