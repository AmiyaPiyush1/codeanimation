import React, { useRef, useState, useEffect } from 'react';
import MonacoEditor from "@monaco-editor/react";
import ExecutionControls from './ExecutionControls';
import { useCodeSharing } from '../../hooks/useCodeSharing';
import Toast from '../Toast';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import "./VisualDebuggerBoiler.css";  // Import the existing CSS

const CodeEditor = ({ 
  code = '', 
  language = 'javascript', 
  onCodeChange = () => {}, 
  isReadOnly = false, 
  onEditorMount = () => {},
  onToggleReadOnly = () => {},
  onUndo = () => {},
  onRedo = () => {},
  onCopy = () => {},
  onFullscreen = () => {},
  copied = false,
  fullscreen = false,
  // Execution Controls props
  handleFirst = () => {},
  handlePrev = () => {},
  handleNext = () => {},
  handleLast = () => {},
  handleExecute = () => {},
  toggleProcess = () => {},
  currentStep = 0,
  debuggedQueue = [],
  isRunning = false,
  location = { pathname: '' },
  isTransitioning = false,
  leftWidth = 33.33,
}) => {
  const editorRef = useRef(null);
  const { toast, handleShare } = useCodeSharing();
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [editorSettings, setEditorSettings] = useState({
    lineNumbers: true,
    minimap: false,
    wordWrap: 'on',
    theme: 'dark'
  });
  const [showGoToLine, setShowGoToLine] = useState(false);
  const [goToLineValue, setGoToLineValue] = useState('');
  const fileInputRef = useRef(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const popupRef = useRef(null);
  
  // Create separate refs for each draggable popup
  const goToLineRef = useRef(null);
  const shortcutsRef = useRef(null);
  const settingsRef = useRef(null);

  // Add new state for line count
  const [totalLines, setTotalLines] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(() => {
    // Initialize from localStorage, default to false if not found
    return localStorage.getItem('toolbarHasScrolled') === 'true';
  });
  const toolbarRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editorRef.current.decorations = [];
    onEditorMount(editor);
    setTotalLines(editor.getModel().getLineCount());

    // Add id and name to the textarea element
    const textarea = editor.getContainerDomNode().querySelector('textarea');
    if (textarea) {
      textarea.id = 'monaco-editor-textarea';
      textarea.name = 'monaco-editor-textarea';
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      // Force Monaco Editor to re-layout when fullscreen state changes
      editorRef.current.layout();
    }
  }, [fullscreen]);

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  const toggleSetting = (setting) => {
    const newSettings = { ...editorSettings };
    
    switch (setting) {
      case 'lineNumbers':
        newSettings.lineNumbers = !newSettings.lineNumbers;
        if (editorRef.current) {
          editorRef.current.updateOptions({
            lineNumbers: newSettings.lineNumbers ? 'on' : 'off'
          });
        }
        break;
      
      case 'minimap':
        newSettings.minimap = !newSettings.minimap;
        if (editorRef.current) {
          editorRef.current.updateOptions({
            minimap: { enabled: newSettings.minimap }
          });
        }
        break;
      
      case 'wordWrap':
        newSettings.wordWrap = newSettings.wordWrap === 'on' ? 'off' : 'on';
        if (editorRef.current) {
          editorRef.current.updateOptions({
            wordWrap: newSettings.wordWrap
          });
        }
        break;
      
      case 'theme':
        newSettings.theme = newSettings.theme === 'dark' ? 'light' : 'dark';
        if (editorRef.current) {
          const monaco = window.monaco;
          if (monaco) {
            if (newSettings.theme === 'light') {
              monaco.editor.defineTheme("customLightTheme", {
                base: "vs",
                inherit: true,
                rules: [
                  { token: 'comment', foreground: '008000' },
                  { token: 'keyword', foreground: '0000FF' },
                  { token: 'string', foreground: 'A31515' },
                  { token: 'number', foreground: '098658' },
                  { token: 'type', foreground: '267F99' },
                  { token: 'function', foreground: '795E26' },
                  { token: 'variable', foreground: '001080' },
                  { token: 'operator', foreground: '000000' }
                ],
                colors: {
                  "editor.background": "#FFFFFF",
                  "editor.foreground": "#000000",
                  "editor.lineHighlightBackground": "#F0F0F0",
                  "editor.lineHighlightBorder": "transparent",
                  "editor.selectionBackground": "#ADD6FF",
                  "editor.inactiveSelectionBackground": "#E5EBF1",
                  "editorCursor.foreground": "#000000",
                  "editorWhitespace.foreground": "#A0A0A0",
                  "editorIndentGuide.background": "#D3D3D3",
                  "editorIndentGuide.activeBackground": "#939393",
                  "editorLineNumber.foreground": "#858585",
                  "editorLineNumber.activeForeground": "#000000",
                  "editorGutter.background": "#FFFFFF"
                },
              });
              monaco.editor.setTheme("customLightTheme");
            } else {
              monaco.editor.setTheme("customTheme");
            }
          }
        }
        break;
    }
    
    setEditorSettings(newSettings);
  };

  // Download code as file
  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Upload code from file
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target.result) {
        onCodeChange(evt.target.result.toString());
      }
    };
    reader.readAsText(file);
  };

  // Print code
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`<pre style='font-family:monospace;font-size:14px;'>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  // Enhanced go to line handler
  const handleGoToLine = () => {
    if (editorRef.current && goToLineValue) {
      const line = parseInt(goToLineValue, 10);
      if (!isNaN(line) && line > 0 && line <= totalLines) {
        editorRef.current.revealLineInCenter(line);
        editorRef.current.setPosition({ lineNumber: line, column: 1 });
        editorRef.current.focus();
        setShowGoToLine(false);
        setGoToLineValue('');
      }
    }
  };

  // Toggle folding
  const handleToggleFolding = () => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const maxLine = model.getLineCount();
        for (let i = 1; i <= maxLine; i++) {
          editorRef.current.trigger('', 'editor.foldAll', null);
        }
      }
    }
  };

  // Reset editor
  const handleReset = () => {
    onCodeChange('');
  };

  // Add keyboard shortcuts handler
  useEffect(() => {
    const handleKeyboardShortcut = (e) => {
      // Handle ESC key for closing popups
      if (e.key === 'Escape') {
        setShowGoToLine(false);
        setShowShortcuts(false);
        setShowSettings(false);
        return;
      }

      // Don't trigger shortcuts if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Check for Ctrl/Cmd key
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            handleDownload();
            break;
          case 'f':
            e.preventDefault();
            if (editorRef.current) {
              editorRef.current.getAction('actions.find').run();
            }
            break;
          case 'z':
            e.preventDefault();
            if (!e.shiftKey) {
              onUndo();
            }
            break;
          case 'y':
            e.preventDefault();
            onRedo();
            break;
          case 'g':
            e.preventDefault();
            setShowGoToLine(true);
            break;
          case 'p':
            e.preventDefault();
            handlePrint();
            break;
          case '/':
            e.preventDefault();
            if (editorRef.current) {
              editorRef.current.getAction('editor.action.commentLine').run();
            }
            break;
          case 'enter':
            e.preventDefault();
            handleExecute();
            break;
        }

        // Handle Ctrl/Cmd + Shift combinations
        if (e.shiftKey) {
          switch (e.key.toLowerCase()) {
            case 'f':
              e.preventDefault();
              handleFormat();
              break;
            case 'z':
              e.preventDefault();
              onRedo();
              break;
          }
        }
      }

      // Handle F11 for fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        onFullscreen('code-editor');
      }
    };

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyboardShortcut);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [onUndo, onRedo, handleFormat, handleDownload, handlePrint, onFullscreen, handleExecute]);

  // Update keyboard shortcuts list with categories
  const keyboardShortcuts = [
    {
      category: "File Operations",
      shortcuts: [
        { key: 'Ctrl/Cmd + S', desc: 'Save/Download code' },
        { key: 'Ctrl/Cmd + P', desc: 'Print code' }
      ]
    },
    {
      category: "Editor Navigation",
      shortcuts: [
        { key: 'Ctrl/Cmd + F', desc: 'Find in code' },
        { key: 'Ctrl/Cmd + G', desc: 'Go to line' },
        { key: 'F11', desc: 'Toggle fullscreen' }
      ]
    },
    {
      category: "Editing",
      shortcuts: [
        { key: 'Ctrl/Cmd + Z', desc: 'Undo' },
        { key: 'Ctrl/Cmd + Shift + Z', desc: 'Redo' },
        { key: 'Ctrl/Cmd + Y', desc: 'Redo (alternative)' },
        { key: 'Ctrl/Cmd + /', desc: 'Toggle comment' }
      ]
    },
    {
      category: "Execution",
      shortcuts: [
        { key: 'Ctrl/Cmd + Enter', desc: 'Run/Test code' }
      ]
    },
    {
      category: "Formatting",
      shortcuts: [
        { key: 'Ctrl/Cmd + Shift + F', desc: 'Format code' }
      ]
    }
  ];

  // Reorganized toolbar groups with Core in the middle
  const toolbarGroups = [
    {
      name: "Share",
      items: [
        {
          icon: copied ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <path d="m9 14 2 2 4-4"/>
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            </svg>
          ),
          tooltip: copied ? "Copied!" : "Copy Code (Ctrl+C)",
          onClick: onCopy
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="18" cy="5" r="3"/>
              <circle cx="6" cy="12" r="3"/>
              <circle cx="18" cy="19" r="3"/>
              <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
              <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
            </svg>
          ),
          tooltip: "Share Code",
          onClick: () => handleShare(editorRef, language)
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          ),
          tooltip: "Download Code (Ctrl+S)",
          onClick: handleDownload
        }
      ]
    },
    {
      name: "Core",
      items: [
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 7v6h6"/>
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
            </svg>
          ),
          tooltip: "Undo (Ctrl+Z)",
          onClick: onUndo
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21 7v6h-6"/>
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
            </svg>
          ),
          tooltip: "Redo (Ctrl+Y)",
          onClick: onRedo
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          ),
          tooltip: "Find (Ctrl+F)",
          onClick: () => editorRef.current && editorRef.current.getAction('actions.find').run()
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="21" x2="3" y1="6" y2="6"/>
              <line x1="15" x2="3" y1="12" y2="12"/>
              <line x1="17" x2="3" y1="18" y2="18"/>
            </svg>
          ),
          tooltip: "Format Code (Ctrl+Shift+F)",
          onClick: handleFormat
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M5 3v4"/>
              <path d="M3 5h4"/>
              <path d="M6 17v4"/>
              <path d="M4 19h4"/>
              <path d="M13 6l3.293-3.293a1 1 0 0 1 1.414 0l2.586 2.586a1 1 0 0 1 0 1.414L19 9"/>
              <path d="M19 13v3a2 2 0 0 1-2 2h-3"/>
              <path d="M11 18H8a2 2 0 0 1-2-2v-3"/>
              <path d="M5 11V8a2 2 0 0 1 2-2h3"/>
            </svg>
          ),
          tooltip: "Run/Test Code (Ctrl+Enter)",
          onClick: handleExecute
        }
      ]
    },
    {
      name: "Navigation",
      items: [
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M3 3h18v18H3z"/>
              <path d="M9 9h6v6H9z"/>
              <path d="M12 3v18"/>
              <path d="M3 12h18"/>
            </svg>
          ),
          tooltip: "Go to Line (Ctrl+G)",
          onClick: () => setShowGoToLine(true)
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          ),
          tooltip: "Toggle Folding",
          onClick: handleToggleFolding
        },
        {
          icon: fullscreen ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
            </svg>
          ),
          tooltip: fullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)",
          onClick: () => onFullscreen('code-editor')
        }
      ]
    },
    {
      name: "Tools",
      items: [
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ),
          tooltip: "Editor Settings",
          onClick: () => setShowSettings(!showSettings)
        },
        {
          icon: isReadOnly ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="m10 10-6.157 6.162a2 2 0 0 0-.5.833l-1.322 4.36a.5.5 0 0 0 .622.624l4.358-1.323a2 2 0 0 0 .83-.5L14 13.982"/>
              <path d="m12.829 7.172 4.359-4.346a1 1 0 1 1 3.986 3.986l-4.353 4.353"/>
              <path d="m15 5 4 4"/><path d="m2 2 20 20"/>
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
              <path d="m15 5 4 4"/>
            </svg>
          ),
          tooltip: isReadOnly ? "Unlock Editor" : "Lock Editor",
          onClick: onToggleReadOnly
        },
        {
          icon: (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="18" r="1.5"/>
            </svg>
          ),
          tooltip: "Keyboard Shortcuts",
          onClick: () => setShowShortcuts(true)
        }
      ]
    }
  ];

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowGoToLine(false);
        setShowSettings(false);
        setShowSearch(false);
        setShowShortcuts(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add scroll tracking
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const handleScroll = () => {
      if (toolbar.scrollLeft > 0) {
        setHasScrolled(true);
        localStorage.setItem('toolbarHasScrolled', 'true');
      }
    };

    toolbar.addEventListener('scroll', handleScroll);
    return () => toolbar.removeEventListener('scroll', handleScroll);
  }, []);

  // Add mouse wheel handler
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const handleWheel = (e) => {
      e.preventDefault();
      toolbar.scrollLeft += e.deltaY;
      // Update scroll state when using mouse wheel
      if (toolbar.scrollLeft > 0) {
        setHasScrolled(true);
        localStorage.setItem('toolbarHasScrolled', 'true');
      }
    };

    toolbar.addEventListener('wheel', handleWheel, { passive: false });
    return () => toolbar.removeEventListener('wheel', handleWheel);
  }, []);

  // Add mouse drag handler
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    let isDragging = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDragging = true;
      toolbar.style.cursor = 'grabbing';
      startX = e.pageX - toolbar.offsetLeft;
      scrollLeft = toolbar.scrollLeft;
    };

    const handleMouseUp = () => {
      isDragging = false;
      toolbar.style.cursor = 'grab';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - toolbar.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      toolbar.scrollLeft = scrollLeft - walk;
      // Update scroll state when dragging
      if (toolbar.scrollLeft > 0) {
        setHasScrolled(true);
        localStorage.setItem('toolbarHasScrolled', 'true');
      }
    };

    const handleMouseLeave = () => {
      isDragging = false;
      toolbar.style.cursor = 'grab';
    };

    toolbar.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    toolbar.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      toolbar.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      toolbar.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      className="section flex flex-col border border-slate-700/50 py-2 px-4 bg-[#0F172A]/80 backdrop-blur-md overflow-hidden rounded-xl transition-all duration-300"
      id="code-editor"
      style={{ width: `${leftWidth}%`, backgroundColor: '#0F172A' }}
    >
      <Toast {...toast} />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".js,.ts,.py,.java,.cpp,.txt,.json,.md,.html,.css"
        onChange={handleUpload}
      />
      {/* Enhanced Toolbar with horizontal scroll */}
      <div className="sticky top-0 z-30 w-full bg-[#10172a]/95 border-b border-slate-700/60 shadow-lg rounded-t-xl">
        <div className="relative w-full overflow-hidden">
          <div 
            ref={toolbarRef}
            className="flex items-center gap-3 px-4 py-2.5 overflow-x-auto cursor-grab hide-scrollbar"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              width: '100%',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollBehavior: 'smooth',
              minWidth: 'max-content',
              paddingBottom: '30px',
              width: '100%'
            }}
          >
            {toolbarGroups.map((group, groupIndex) => (
              <React.Fragment key={group.name}>
                {groupIndex > 0 && (
                  <div className="h-8 w-0.5 bg-slate-700/60 rounded-full" />
                )}
                <div className="flex items-center gap-2">
                  {group.items.map((item, itemIndex) => (
                    <motion.button
                      key={`${group.name}-${itemIndex}`}
                      className="group relative w-9 h-9 flex justify-center items-center z-10 p-2 bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-lg cursor-pointer transition-all duration-200 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300 active:bg-purple-500/30 active:border-purple-500/70 active:text-purple-200 shadow-sm hover:shadow-md"
                      onClick={item.onClick}
                      title={item.tooltip}
                      aria-label={item.tooltip}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="relative">
                        {item.icon}
                        <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 rounded-full transition-colors duration-200" />
                      </div>
                      <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 bg-slate-800/95 text-white px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-300 group-hover:opacity-100 group-hover:-top-12 shadow-lg border border-slate-700/50">
                        {item.tooltip}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>
          {/* Scroll indicator */}
          <AnimatePresence>
            {!hasScrolled && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-full shadow-lg border border-slate-700/50 z-50"
                style={{ pointerEvents: 'none' }}
              >
                <span className="text-xs text-slate-300 font-medium">More features</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-purple-400">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* Wrapper div for MonacoEditor */}
      <div className="flex-1 overflow-hidden relative">
        <MonacoEditor
          className="w-full h-full p-2.5 rounded-lg bg-[#0F172A]/90 backdrop-blur-sm shadow-inner"
          style={{ backgroundColor: '#0F172A' }}
          language={language}
          placeholder="Write your code here..."
          value={code}
          onChange={onCodeChange}
          id="monaco-code-editor"
          name="monaco-code-editor"
          options={{
            fontSize: 14,
            minimap: { enabled: editorSettings.minimap, scale: 1, side: "right" },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 0, bottom: 0, left: 0, right: 0 },
            quickSuggestions: { other: true, comments: true, strings: true },
            suggestOnTriggerCharacters: true,
            inlineSuggest: true,
            wordWrap: editorSettings.wordWrap,
            folding: true,
            smoothScrolling: true,
            tabSize: 2,
            overviewRulerBorder: false,
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            matchBrackets: "always",
            cursorStyle: "line-thin",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            suggestSelection: "recentlyUsed",
            parameterHints: { enabled: true },
            glyphMargin: false,
            lightbulb: { enabled: true },
            formatOnType: true,
            formatOnPaste: true,
            bracketPairColorization: { enabled: true },
            stickyScroll: { enabled: true },
            lineNumbersMinChars: 3,
            readOnly: isReadOnly,
            lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
          }}
          beforeMount={(monaco) => {
            monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
            monaco.editor.defineTheme("customTheme", {
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: 'comment', foreground: '6A9955' },
                { token: 'keyword', foreground: 'C586C0' },
                { token: 'string', foreground: 'CE9178' },
                { token: 'number', foreground: 'B5CEA8' },
                { token: 'type', foreground: '4EC9B0' },
                { token: 'function', foreground: 'DCDCAA' },
                { token: 'variable', foreground: '9CDCFE' },
                { token: 'operator', foreground: 'D4D4D4' }
              ],
              colors: {
                "editor.background": "#0F172A",
                "editor.foreground": "#E2E8F0",
                "editor.lineHighlightBackground": "#1E293B",
                "editor.lineHighlightBorder": "transparent",
                "editor.selectionBackground": "#4F46E5",
                "editor.inactiveSelectionBackground": "#4F46E5",
                "editorCursor.foreground": "#E2E8F0",
                "editorWhitespace.foreground": "#475569",
                "editorIndentGuide.background": "#475569",
                "editorIndentGuide.activeBackground": "#64748B",
                "editorLineNumber.foreground": "#64748B",
                "editorLineNumber.activeForeground": "#E2E8F0",
                "editorGutter.background": "#0F172A"
              },
            });
            monaco.editor.setTheme("customTheme");
          }}
          onMount={(editor, monaco) => {
            handleEditorDidMount(editor);
            monaco.editor.setTheme("customTheme");
          }}
        />

        {/* Go to Line Modal */}
        <AnimatePresence>
          {showGoToLine && (
            <div className="absolute inset-0 z-[100]">
              <Draggable
                nodeRef={goToLineRef}
                handle=".drag-handle"
                bounds="parent"
              >
                <motion.div
                  ref={goToLineRef}
                  className="absolute bg-slate-800/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 p-4 w-[320px] max-w-[90%] cursor-move"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    maxHeight: '90%',
                    overflowY: 'auto',
                    top: '60px',
                    left: '25%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between drag-handle cursor-move pb-2 border-b border-slate-700/50">
                      <div className="flex flex-col">
                        <h3 className="text-sm font-medium text-purple-300">Go to Line</h3>
                        <span className="text-xs text-slate-400">Jump to a specific line number</span>
                      </div>
                      <motion.button
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                        onClick={() => setShowGoToLine(false)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </motion.button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-slate-400">
                            <path d="M3 3h18v18H3z"/>
                            <path d="M9 9h6v6H9z"/>
                            <path d="M12 3v18"/>
                            <path d="M3 12h18"/>
                          </svg>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max={totalLines}
                          className="w-full bg-slate-900/50 text-slate-300 pl-10 pr-4 py-2 rounded-md border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                          value={goToLineValue}
                          onChange={e => {
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) {
                              const numValue = parseInt(value, 10);
                              if (value === '' || (numValue > 0 && numValue <= totalLines)) {
                                setGoToLineValue(value);
                              }
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleGoToLine();
                            }
                            if (e.key === 'Escape') {
                              setShowGoToLine(false);
                            }
                          }}
                          placeholder={`Enter line number (1-${totalLines})`}
                          autoFocus
                        />
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-md bg-slate-700/30">
                        <div className="text-xs text-slate-400">
                          <span className="text-slate-300 font-medium">Total Lines:</span> {totalLines}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">Enter</kbd>
                            <span>to go</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">Esc</kbd>
                            <span>to close</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <motion.button
                          className="flex-1 px-4 py-2 rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 transition-colors"
                          onClick={() => setShowGoToLine(false)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          className="flex-1 px-4 py-2 rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleGoToLine}
                          disabled={!goToLineValue || parseInt(goToLineValue, 10) < 1 || parseInt(goToLineValue, 10) > totalLines}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Go to Line
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Draggable>
            </div>
          )}
        </AnimatePresence>

        {/* Keyboard Shortcuts Modal */}
        <AnimatePresence>
          {showShortcuts && (
            <div className="absolute inset-0 z-[100]">
              <Draggable
                nodeRef={shortcutsRef}
                handle=".drag-handle"
                bounds="parent"
              >
                <motion.div
                  ref={shortcutsRef}
                  className="absolute bg-slate-800/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 p-6 w-[400px] max-w-[90%] cursor-move"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    maxHeight: '90%',
                    overflowY: 'auto',
                    top: '60px',
                    left: '25%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between drag-handle cursor-move pb-3 border-b border-slate-700/50">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-purple-300">Keyboard Shortcuts</h3>
                        <span className="text-xs text-slate-400">Available keyboard shortcuts for the editor</span>
                      </div>
                      <motion.button
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                        onClick={() => setShowShortcuts(false)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </motion.button>
                    </div>

                    <div className="space-y-6">
                      {keyboardShortcuts.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="space-y-3">
                          <h4 className="text-sm font-medium text-purple-300/80 px-2">
                            {category.category}
                          </h4>
                          <div className="space-y-2">
                            {category.shortcuts.map((shortcut, shortcutIndex) => (
                              <div 
                                key={shortcutIndex} 
                                className="flex justify-between items-center p-2 rounded-md hover:bg-slate-700/30 transition-colors group"
                              >
                                <span className="text-slate-200 text-sm group-hover:text-purple-200 transition-colors">
                                  {shortcut.desc}
                                </span>
                                <kbd className="font-mono bg-slate-700/60 px-2.5 py-1 rounded text-purple-200 text-sm group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
                                  {shortcut.key}
                                </kbd>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-700/50">
                      <div className="flex items-center justify-between p-2 rounded-md bg-slate-700/30">
                        <span className="text-xs text-slate-400">
                          Press <kbd className="px-1.5 py-0.5 bg-slate-700/50 rounded text-slate-300">Esc</kbd> to close
                        </span>
                        <motion.button
                          className="px-4 py-2 rounded-md bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                          onClick={() => setShowShortcuts(false)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Close
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Draggable>
            </div>
          )}
        </AnimatePresence>

        {/* Settings Dropdown */}
        <AnimatePresence>
          {showSettings && (
            <div className="absolute inset-0 z-[100]">
              <Draggable
                nodeRef={settingsRef}
                handle=".drag-handle"
                bounds="parent"
              >
                <motion.div
                  ref={settingsRef}
                  className="absolute bg-slate-800/95 backdrop-blur-md rounded-lg shadow-lg border border-slate-700/50 p-4 w-[280px] max-w-[90%] cursor-move"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{
                    maxHeight: '90%',
                    overflowY: 'auto',
                    top: '60px',
                    left: '25%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between drag-handle cursor-move pb-2 border-b border-slate-700/50">
                      <h3 className="text-sm font-medium text-purple-300">Settings</h3>
                      <motion.button
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                        onClick={() => setShowSettings(false)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/30 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-300">Line Numbers</span>
                          <span className="text-xs text-slate-400">Show line numbers in the gutter</span>
                        </div>
                        <motion.button
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            editorSettings.lineNumbers ? 'bg-purple-500' : 'bg-slate-700'
                          }`}
                          onClick={() => toggleSetting('lineNumbers')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                            animate={{ x: editorSettings.lineNumbers ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/30 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-300">Minimap</span>
                          <span className="text-xs text-slate-400">Show code overview on the right</span>
                        </div>
                        <motion.button
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            editorSettings.minimap ? 'bg-purple-500' : 'bg-slate-700'
                          }`}
                          onClick={() => toggleSetting('minimap')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                            animate={{ x: editorSettings.minimap ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/30 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-300">Word Wrap</span>
                          <span className="text-xs text-slate-400">Wrap long lines to fit the editor</span>
                        </div>
                        <motion.button
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            editorSettings.wordWrap === 'on' ? 'bg-purple-500' : 'bg-slate-700'
                          }`}
                          onClick={() => toggleSetting('wordWrap')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                            animate={{ x: editorSettings.wordWrap === 'on' ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/30 transition-colors">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-300">Theme</span>
                          <span className="text-xs text-slate-400">Switch between light and dark mode</span>
                        </div>
                        <motion.button
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            editorSettings.theme === 'dark' ? 'bg-purple-500' : 'bg-slate-700'
                          }`}
                          onClick={() => toggleSetting('theme')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <motion.div
                            className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md"
                            animate={{ x: editorSettings.theme === 'dark' ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Draggable>
            </div>
          )}
        </AnimatePresence>

        {/* Add a semi-transparent overlay when any popup is open */}
        <AnimatePresence>
          {(showGoToLine || showShortcuts || showSettings) && (
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm z-[99]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setShowGoToLine(false);
                setShowShortcuts(false);
                setShowSettings(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
      {!code && (
        <div className="absolute top-16 left-16 font-mono text-sm text-slate-400/70">
          // Write your code here
        </div>
      )}
      <ExecutionControls
        onFirst={handleFirst}
        onPrev={handlePrev}
        onNext={handleNext}
        onLast={handleLast}
        onExecute={toggleProcess}
        currentStep={currentStep}
        debuggedQueue={debuggedQueue}
        isRunning={isRunning}
        isTransitioning={isTransitioning}
        location={location}
      />
    </div>
  );
};

export default CodeEditor; 