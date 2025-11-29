import React, { useState, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import * as d3 from 'd3';
import { useCodeSharing } from '../../hooks/useCodeSharing';
import './graph.css';

const GraphMat = () => {
  const [code, setCode]       = useState(localStorage.getItem('code') || 'Write Your code here...');
  const [trace, setTrace]     = useState([]);            // full trace from API
  const [step, setStep]       = useState(0);             // current step index
  const [loader, setLoader]   = useState(false);

  const editorRef = useRef(null);
  const svgRef    = useRef(null);
  const { toast, handleShare } = useCodeSharing();

  const handleChange = (value) => {
    setCode(value);
  };

  const handleExecute = async () => {
    setLoader(true);
    localStorage.setItem('code', code);
    try {
      const response = await axios.post(
        'https://code-backend-xruc.onrender.com/debugger/graphs/main',
        { codeInput: code },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const traceVal = response.data.trace || [];
      setTrace(traceVal);
      setStep(0);
    } catch (error) {
      console.error('API call failed:', error);
      setTrace([]);
      setStep(0);
    }
    setLoader(false);
  };

  const handleShareClick = () => {
    handleShare(editorRef, svgRef);
  };

  // Step controls
  const handleFirst    = () => setStep(0);
  const handlePrevious = () => setStep(s => Math.max(s - 1, 0));
  const handleNext     = () => setStep(s => Math.min(s + 1, trace.length - 1));
  const handleLast     = () => setStep(trace.length - 1);

  // Draw graph whenever the adjacency list or visited-array for the current step changes
  useEffect(() => {
    const current = trace[step] || { adjacencyList: {}, visited: [] };
    drawGraph(current.adjacencyList, current.visited);
  }, [trace, step]);

  function drawGraph(adjacencyList, visitedArr) {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width  = svgRef.current.clientWidth  || 400;
    const height = svgRef.current.clientHeight || 400;

    // Build nodes and links
    const nodesSet = new Set();
    Object.entries(adjacencyList).forEach(([src, targets]) => {
      nodesSet.add(src.toString());
      targets.forEach(t => nodesSet.add(t.toString()));
    });
    const nodes = Array.from(nodesSet).map(id => ({ id }));
    const links = [];
    Object.entries(adjacencyList).forEach(([src, targets]) => {
      targets.forEach(t => {
        links.push({ source: src.toString(), target: t.toString() });
      });
    });

    // Create a Set of the currently visited node IDs
    const visitedSet = new Set(
      visitedArr
        .map((v, i) => (v === 'V' ? nodes[i]?.id : null))
        .filter(Boolean)
    );

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link',   d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke',      '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2)
      .attr('stroke',       'orange');

    const node = svg.append('g')
      .attr('stroke',      '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r',    12)
      .attr('fill', d => visitedSet.has(d.id) ? 'lightgreen' : 'gray')
      .call(drag(simulation));

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.id)
      .attr('font-size', 12)
      .attr('dy',        4)
      .attr('dx',       -6)
      .attr('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    function drag(sim) {
      return d3.drag()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag',  (event, d) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on('end',   (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        });
    }
  }

  const currentVisited = trace[step]?.visited || [];
  const currentQueue = trace[step]?.queue || [];
  const desc = trace[step]?.description || "";

  return (
    <div className="container" style={{ backgroundColor: '#f7f7f7', height: '100vh' }}>
      {toast.show && (
        <div 
          className={`toast ${toast.type}`}
          style={{
            position:  'fixed',
            top:       '20px',
            right:     '20px',
            padding:   '10px 20px',
            borderRadius: '4px',
            backgroundColor: toast.type === 'error' ? '#ff4444' : '#4CAF50',
            color:     'white',
            zIndex:    1000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {toast.message}
        </div>
      )}
      <div className="main-content">
        {/* Code Editor Section */}
        <div className="section" id="code-editor" style={{ width: '33.33%' }}>
          <div className="monaco-editor-toolbar">
            <button className="editor-button" onClick={handleShareClick}>
              {/* share icon */}
            </button>
            <button className="editor-button">Read Only</button>
            <button className="editor-button">Undo</button>
            <button className="editor-button" onClick={handleExecute}>Execute</button>
            <button className="editor-button" onClick={handleNext}>Next</button>
            <button className="editor-button" onClick={handleLast}>Last</button>
          </div>

          <MonacoEditor
            language="javascript"
            value={code}
            onChange={handleChange}
            options={{
              automaticLayout: true,
              minimap:         { enabled: false },
              readOnly:        false,
              fontSize:        14,
              wordWrap:        'on'
            }}
            onMount={editor => { editorRef.current = editor; }}
            className="editor"
          />

          <div className="buttons">
            <button className="back"    onClick={handleFirst}>First</button>
            <button className="back"    onClick={handlePrevious}>Prev</button>
            <button className="execute" onClick={handleExecute}>Execute</button>
            <button className="forward" onClick={handleNext}>Next</button>
            <button className="forward" onClick={handleLast}>Last</button>
          </div>
        </div>

        <div className="resizer" />

        {/* Visual Debugger Section */}
        <div className="section" id="visual-debugger" style={{ width: '66.66%', display: 'flex', flexDirection: 'column' }}>
          <div>{loader ? 'loading...' : 'loaded'}</div>
          <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
            <div>Visited : </div>
            {currentVisited.length > 0
              ? currentVisited.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      width:       '30px',
                      height:      '30px',
                      backgroundColor: item === 'V' ? 'lightgreen' : '#ddd',
                      display:     'flex',
                      justifyContent: 'center',
                      alignItems:  'center',
                      borderRadius:'4px',
                      fontWeight:  'bold',
                      color:       '#333',
                      boxShadow:   '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    {idx}
                  </div>
                ))
              : <span>no visited nodes</span>
            }
          </div>
          <div style={{ display: 'flex', gap: '8px', margin: '16px 0' }}>
            <div>{currentQueue.length > 0?"queue : ": "" }</div>
            {currentQueue.length > 0
              ? currentQueue.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      width:       '30px',
                      height:      '30px',
                      backgroundColor: 'lightgreen',
                      display:     'flex',
                      justifyContent: 'center',
                      alignItems:  'center',
                      borderRadius:'4px',
                      fontWeight:  'bold',
                      color:       '#333',
                      boxShadow:   '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    {idx}
                  </div>
                ))
              : <span></span>
            }
          </div>
          
          <span>{desc}</span>
          <div style={{ display: 'flex -left ', flexDirection: 'column', flexGrow: 1 }}>
            <svg
              ref={svgRef}
              style={{ width: '40%', height : "100vh", border: '1px solid #ccc' }}
            />
            <div style={{ padding: '8px', background: '#fafafa' }} />
          </div>
        </div>
        
        <div className="resizer" />
      </div>
    </div>
  );
};

export default GraphMat;
