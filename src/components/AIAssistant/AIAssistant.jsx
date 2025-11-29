import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AIAssistant.css';

const AIAssistant = ({ onApplyChanges }) => {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('aiAssistantOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('aiAssistantMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [previousChats, setPreviousChats] = useState(() => {
    const saved = localStorage.getItem('aiAssistantPreviousChats');
    return saved ? JSON.parse(saved) : [];
  });
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(() => {
    const saved = localStorage.getItem('aiAssistantCurrentChatId');
    return saved || Date.now().toString();
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasEditorContent, setHasEditorContent] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [selectedSuggestionIcon, setSelectedSuggestionIcon] = useState(null);
  const [position, setPosition] = useState(() => {
    // Calculate initial position based on window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const togglerBottom = 55 + 44; // toggler top + toggler height
    const rightPosition = 20; // same as toggler's right position
    
    return {
      x: windowWidth - 400 - rightPosition - 70, // 400 is approximate chat window width
      y: togglerBottom + 10
    };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const sessionId = useRef(Date.now().toString());
  const lastMessageId = useRef(parseInt(localStorage.getItem('aiAssistantLastMessageId') || '0'));
  const animatedMessages = useRef(new Set());
  const [copyStatus, setCopyStatus] = useState({});
  const [responseCopyStatus, setResponseCopyStatus] = useState({});
  const messageQueue = useRef([]);
  const isProcessing = useRef(false);
  const abortControllerRef = useRef(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('');
  const editorObserverRef = useRef(null);
  const chatHistoryRef = useRef(null);
  const chatHistoryButtonRef = useRef(null);

  // Common suggestions
  const suggestions = [
    {
      text: "Explain this code",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
      ),
      shortcut: "Ctrl + E"
    },
    {
      text: "Optimize this code",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
      shortcut: "Ctrl + O"
    },
    {
      text: "Find bugs in this code",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bug-icon lucide-bug">
          <path d="m8 2 1.88 1.88"/>
          <path d="M14.12 3.88 16 2"/>
          <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
          <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/>
          <path d="M12 20v-9"/>
          <path d="M6.53 9C4.6 8.8 3 7.1 3 5"/>
          <path d="M6 13H2"/>
          <path d="M3 21c0-2.1 1.7-3.9 3.8-4"/>
          <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/>
          <path d="M22 13h-4"/>
          <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/>
        </svg>
      ),
      shortcut: "Ctrl + B"
    },
    {
      text: "Suggest improvements",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6"/>
          <path d="M10 22h4"/>
          <path d="M12 2v8"/>
          <path d="M15 5l-3 3-3-3"/>
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z"/>
        </svg>
      ),
      shortcut: "Ctrl + I"
    }
  ];

  // Get backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000" || "https://code-backend-xruc.onrender.com";

  // Track new messages for animation
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.type === 'assistant' && !animatedMessages.current.has(lastMessage.id)) {
        animatedMessages.current.add(lastMessage.id);
      }
    }
  }, [messages]);

  // Enhanced editor content tracking
  useEffect(() => {
    const checkEditorContent = () => {
      // Try multiple selectors to find the editor content
      const editorElement = document.querySelector('.monaco-editor') || 
                          document.querySelector('.view-lines') ||
                          document.querySelector('.monaco-editor .view-lines');
      
      if (editorElement) {
        const code = editorElement.textContent || '';
        const language = detectLanguage(code);
        setEditorContent(code);
        setEditorLanguage(language);
        setHasEditorContent(true); // Set to true if editor is found
      } else {
        // Check if we're in a code editor page
        const isCodeEditorPage = window.location.pathname.includes('/debugger') ||
                               window.location.pathname.includes('/sort') ||
                               window.location.pathname.includes('/dp') ||
                               window.location.pathname.includes('/recurrsion');
        setHasEditorContent(isCodeEditorPage);
      }
    };

    // Initial check
    checkEditorContent();

    // Set up observer for editor changes
    const observer = new MutationObserver(() => {
      checkEditorContent();
    });

    // Observe the entire document for editor element changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    editorObserverRef.current = observer;

    return () => {
      if (editorObserverRef.current) {
        editorObserverRef.current.disconnect();
      }
    };
  }, []);

  // Language detection function
  const detectLanguage = (code) => {
    if (!code) return '';
    
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

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && 
          chatContainerRef.current && 
          !chatContainerRef.current.contains(event.target) &&
          !event.target.closest('.ai-assistant-button')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Enhanced scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const chatMessages = chatContainerRef.current?.querySelector('.chat-messages');
      if (chatMessages) {
        // Force immediate scroll without animation
        chatMessages.style.scrollBehavior = 'auto';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // Reset scroll behavior after scroll
        setTimeout(() => {
          chatMessages.style.scrollBehavior = '';
        }, 0);
      }
    }
  }, [messages]);

  // Enhanced scroll when loading state changes
  useEffect(() => {
    if (isLoading) {
      const chatMessages = chatContainerRef.current?.querySelector('.chat-messages');
      if (chatMessages) {
        // Force immediate scroll without animation
        chatMessages.style.scrollBehavior = 'auto';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // Reset scroll behavior after scroll
        setTimeout(() => {
          chatMessages.style.scrollBehavior = '';
        }, 0);
      }
    }
  }, [isLoading]);

  // Add effect to scroll to bottom when chat opens
  useEffect(() => {
    if (isOpen) {
      const chatMessages = chatContainerRef.current?.querySelector('.chat-messages');
      if (chatMessages) {
        // Force immediate scroll without animation
        chatMessages.style.scrollBehavior = 'auto';
        chatMessages.scrollTop = chatMessages.scrollHeight;
        // Reset scroll behavior after scroll
        setTimeout(() => {
          chatMessages.style.scrollBehavior = '';
        }, 0);
      }
    }
  }, [isOpen]);

  // Add effect to focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Add effect to focus input after response is delivered
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Save state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('aiAssistantOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('aiAssistantMessages', JSON.stringify(messages));
    // Save to previous chats if there are messages
    if (messages.length > 0) {
      const chatData = {
        id: currentChatId,
        title: messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : ''),
        timestamp: Date.now(),
        messages: messages
      };
      
      setPreviousChats(prev => {
        const filtered = prev.filter(chat => chat.id !== currentChatId);
        return [chatData, ...filtered].slice(0, 10); // Keep last 10 chats
      });
    }
  }, [messages, currentChatId]);

  useEffect(() => {
    localStorage.setItem('aiAssistantPreviousChats', JSON.stringify(previousChats));
  }, [previousChats]);

  useEffect(() => {
    localStorage.setItem('aiAssistantCurrentChatId', currentChatId);
  }, [currentChatId]);

  useEffect(() => {
    localStorage.setItem('aiAssistantLastMessageId', lastMessageId.current.toString());
  }, [lastMessageId.current]);

  // Clear localStorage when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('aiAssistantOpen');
      localStorage.removeItem('aiAssistantMessages');
      localStorage.removeItem('aiAssistantLastMessageId');
    };
  }, []);

  // Handle input changes and show suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setShowSuggestions(value.length > 0);
    setActiveSuggestionIndex(-1);
    if (!value) {
      setSelectedSuggestionIcon(null);
    }
  };

  // Handle keyboard navigation in suggestions
  const handleKeyDown = (e) => {
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveSuggestionIndex(prev => prev > -1 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (activeSuggestionIndex > -1) {
            setInput(suggestions[activeSuggestionIndex].text);
            setSelectedSuggestionIcon(suggestions[activeSuggestionIndex].icon);
            setShowSuggestions(false);
          } else {
            handleSubmit(e);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    // Add a smooth transition effect
    const inputElement = inputRef.current;
    if (inputElement) {
      // First, animate the suggestion item
      const suggestionItem = suggestionsRef.current?.querySelector('.suggestion-item.active');
      if (suggestionItem) {
        suggestionItem.style.transform = 'translateX(20px)';
        suggestionItem.style.opacity = '0';
      }

      // Then update the input with a fade effect
      inputElement.style.opacity = '0';
      inputElement.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        setInput(suggestion.text);
        setSelectedSuggestionIcon(suggestion.icon);
        setShowSuggestions(false);
        
        // Animate the input back
        inputElement.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
        inputElement.style.opacity = '1';
        inputElement.style.transform = 'translateY(0)';
        
        // Focus the input
        inputElement.focus();
        
        // Reset the suggestion item styles
        if (suggestionItem) {
          suggestionItem.style.transform = '';
          suggestionItem.style.opacity = '';
        }
      }, 150);
    } else {
      // Fallback if input element is not available
      setInput(suggestion.text);
      setSelectedSuggestionIcon(suggestion.icon);
      setShowSuggestions(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !isLoading) return;

    // If already loading, stop the process
    if (isLoading) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setIsLoading(false);
      isProcessing.current = false;
      messageQueue.current = []; // Clear the message queue
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setShowSuggestions(false);
    setSelectedSuggestionIcon(null); // Clear the selected suggestion icon
    
    // Add user message with unique ID
    const userMessageId = ++lastMessageId.current;
    setMessages(prev => [...prev, { id: userMessageId, type: 'user', content: userMessage }]);
    
    // Add message to queue
    messageQueue.current.push({ userMessage, userMessageId });
    
    // Set loading state if this is the first message
    if (!isLoading) {
      setIsLoading(true);
    }
    
    // Process the message
    processNextMessage();
  };

  const processNextMessage = async () => {
    if (messageQueue.current.length === 0 || isProcessing.current) {
      return;
    }

    isProcessing.current = true;
    const { userMessage, userMessageId } = messageQueue.current[0];

    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Use the tracked editor content
      const code = editorContent;
      const language = editorLanguage;

      // Call Gemini API with enhanced context
      const response = await fetch(`${BACKEND_URL}/api/gemini/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          code: code,
          language: language,
          query: userMessage,
          sessionId: sessionId.current,
          hasNoCode: !code.trim(),
          context: {
            language: language,
            codeLength: code.length,
            hasCode: code.trim().length > 0
          }
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response format from server');
      }

      // Only process the response if the request wasn't aborted
      if (!signal.aborted) {
        // Validate response data
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format from server');
        }

        // Extract and clean content from the response
        let extractedContent = '';
        let extractedExplanation = '';
        let extractedSuggestions = [];
        let responseType = data.type || 'text';
        let language = data.language || 'unknown';

        try {
          // Handle content extraction
          if (typeof data.content === 'string') {
            const trimmedContent = data.content.trim();
            
            // Try to parse JSON if the content looks like JSON
            if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
              try {
                // Clean the JSON string by removing markdown code block markers and escaped characters
                const cleanedJson = trimmedContent
                  .replace(/```(?:json|javascript|python|java|cpp)?\n?|\n?```/g, '')
                  .replace(/\\n/g, '\n')
                  .replace(/\\"/g, '"')
                  .replace(/\\t/g, '\t')
                  .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
                  .trim();

                const parsedContent = JSON.parse(cleanedJson);
                
                // Extract content with fallbacks
                extractedContent = parsedContent.content || parsedContent.code || data.content;
                extractedExplanation = parsedContent.explanation || data.explanation || '';
                extractedSuggestions = parsedContent.suggestions || data.suggestions || [];
                
                // Update response type if available
                if (parsedContent.type) {
                  responseType = parsedContent.type;
                }
                
                // Update language if available
                if (parsedContent.language) {
                  language = parsedContent.language;
                }
              } catch (parseError) {
                console.log('JSON parse error, using raw content:', parseError);
                extractedContent = data.content;
              }
            } else {
              // Handle markdown code blocks in non-JSON content
              const codeBlockMatch = trimmedContent.match(/```(\w+)?\n([\s\S]*?)```/);
              if (codeBlockMatch) {
                responseType = 'code';
                language = codeBlockMatch[1] || 'unknown';
                extractedContent = codeBlockMatch[2].trim();
                extractedExplanation = trimmedContent.replace(/```[\s\S]*?```/, '').trim();
              } else {
                extractedContent = data.content;
              }
            }
          } else if (data.content) {
            extractedContent = data.content;
          }

          // Clean up explanation and suggestions
          extractedExplanation = (data.explanation || '').trim();
          extractedSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];

          // Clean up code content if it's a code response
          if (responseType === 'code' && extractedContent) {
            extractedContent = extractedContent
              .replace(/```(?:javascript|python|java|cpp)?\n?|\n?```/g, '')
              .trim();
            
            // Ensure we're not truncating the code content
            if (data.content && data.content.length > extractedContent.length) {
              extractedContent = data.content
                .replace(/```(?:javascript|python|java|cpp)?\n?|\n?```/g, '')
                .trim();
            }
          }

        } catch (error) {
          console.error('Content extraction error:', error);
          extractedContent = data.content || '';
          extractedExplanation = data.explanation || '';
          extractedSuggestions = data.suggestions || [];
        }

        // Create a structured message object with unique ID
        const assistantMessageId = ++lastMessageId.current;
        const message = {
          id: assistantMessageId,
          type: 'assistant',
          responseType,
          content: extractedContent,
          explanation: extractedExplanation,
          suggestions: extractedSuggestions,
          rawContent: data.rawContent || extractedContent,
          language
        };

        setMessages(prev => [...prev, message]);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error:', error);
        setMessages(prev => [...prev, { 
          id: ++lastMessageId.current,
          type: 'error', 
          content: error.message || 'Sorry, there was an error analyzing your code. Please try again.' 
        }]);
      }
    } finally {
      // Remove the processed message from the queue
      messageQueue.current.shift();
      isProcessing.current = false;
      abortControllerRef.current = null;
      
      // Process next message if any
      if (messageQueue.current.length > 0) {
        processNextMessage();
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleApplyChanges = (code) => {
    if (!code) return;
    
    // Clean up the code by removing any markdown code block markers
    const cleanCode = code.replace(/```(?:python|java|javascript|cpp)?\n?|\n?```/g, '').trim();
    
    // Apply the code to the editor
    onApplyChanges(cleanCode);
  };

  const formatCode = (code) => {
    if (!code) return '';
    
    // Split code into lines and wrap each line in a span
    const lines = code.split('\n');
    return lines.map((line, index) => (
      <span key={index}>{line}</span>
    ));
  };

  const handleCopyResponse = async (content, messageId) => {
    try {
      await navigator.clipboard.writeText(content);
      setResponseCopyStatus(prev => ({
        ...prev,
        [messageId]: { status: 'success', message: 'Copied!' }
      }));
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setResponseCopyStatus(prev => ({
          ...prev,
          [messageId]: null
        }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy response:', err);
      setResponseCopyStatus(prev => ({
        ...prev,
        [messageId]: { status: 'error', message: 'Failed to copy' }
      }));
      
      // Reset error status after 2 seconds
      setTimeout(() => {
        setResponseCopyStatus(prev => ({
          ...prev,
          [messageId]: null
        }));
      }, 2000);
    }
  };

  const handleCopyCode = async (e, content, messageId) => {
    e.stopPropagation(); // Stop event from bubbling up
    try {
      await navigator.clipboard.writeText(content);
      setCopyStatus(prev => ({
        ...prev,
        [messageId]: { status: 'success', message: 'Copied!' }
      }));
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({
          ...prev,
          [messageId]: null
        }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      setCopyStatus(prev => ({
        ...prev,
        [messageId]: { status: 'error', message: 'Failed to copy' }
      }));
      
      // Reset error status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({
          ...prev,
          [messageId]: null
        }));
      }, 2000);
    }
  };

  const renderMessage = (message, index) => {
    const messageVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: index * 0.1,
          staggerChildren: 0.1
        }
      }
    };

    const codeSuggestionVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
          delay: 0.2 // Add a slight delay after the message appears
        }
      }
    };

    // Helper function to convert **text** to bold text and `text` to italic
    const formatText = (text) => {
      if (!text) return '';
      
      // First handle bold and italic
      let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Convert **text** to bold
        .replace(/`(.*?)`/g, '<em>$1</em>')              // Convert `text` to italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Second pass for nested bold

      // Split text into paragraphs and wrap each in a p tag
      formattedText = formattedText
        .split('\n\n')
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('');

      // Check if the text already contains list items
      const hasExistingList = formattedText.includes('<li>') || 
                             formattedText.includes('<ol>') || 
                             formattedText.includes('<ul>');

      if (!hasExistingList) {
        // Process nested lists
        const lines = text.split('\n');
        let currentList = null;
        let currentIndent = 0;
        let formattedLines = [];
        let listStack = [];
        let listCounters = new Map(); // Track counters for each list level

        lines.forEach(line => {
          const trimmedLine = line.trim();
          const indent = line.search(/\S|$/);
          
          // Check for numbered list item
          const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.*)/);
          // Check for bullet point
          const bulletMatch = trimmedLine.match(/^[-*]\s+(.*)/);
          
          if (numberedMatch || bulletMatch) {
            let content = numberedMatch ? numberedMatch[2] : bulletMatch[1];
            const isNumbered = !!numberedMatch;
            const number = numberedMatch ? parseInt(numberedMatch[1]) : null;
            
            // Process bold and italic within list items
            content = content
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Convert **text** to bold
              .replace(/`(.*?)`/g, '<em>$1</em>')              // Convert `text` to italic
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Second pass for nested bold
            
            // Close lists if we're at a lower indent level
            while (listStack.length > 0 && indent < currentIndent) {
              formattedLines.push(`</${listStack.pop()}>`);
              currentIndent -= 2;
              listCounters.delete(listStack.length); // Remove counter for this level
            }
            
            // Start new list if needed
            if (indent > currentIndent || !currentList) {
              const listType = isNumbered ? 'ol' : 'ul';
              formattedLines.push(`<${listType}>`);
              listStack.push(listType);
              currentList = listType;
              currentIndent = indent;
              
              // Initialize counter for this level if it's a numbered list
              if (isNumbered) {
                listCounters.set(listStack.length - 1, number);
              }
            }
            
            // Add list item with proper value for numbered lists
            if (isNumbered) {
              const counter = listCounters.get(listStack.length - 1);
              formattedLines.push(`<li value="${counter}">${content}</li>`);
              listCounters.set(listStack.length - 1, counter + 1);
            } else {
              formattedLines.push(`<li>${content}</li>`);
            }
          } else {
            // Close all open lists if we encounter a non-list line
            while (listStack.length > 0) {
              formattedLines.push(`</${listStack.pop()}>`);
            }
            currentList = null;
            currentIndent = 0;
            listCounters.clear();
            // Process bold and italic in non-list lines
            const formattedLine = line
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Convert **text** to bold
              .replace(/`(.*?)`/g, '<em>$1</em>')              // Convert `text` to italic
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Second pass for nested bold
            formattedLines.push(formattedLine);
          }
        });

        // Close any remaining open lists
        while (listStack.length > 0) {
          formattedLines.push(`</${listStack.pop()}>`);
        }

        formattedText = formattedLines.join('\n');
      }

      return formattedText;
    };

    if (message.type === 'user') {
      return (
        <motion.div 
          key={message.id}
          className="message user"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
        />
      );
    }

    if (message.type === 'error') {
      return (
        <motion.div 
          key={message.id}
          className="message error"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
        />
      );
    }

    if (message.type === 'assistant') {
      const isNewMessage = index === messages.length - 1 && !animatedMessages.current.has(message.id);
      const currentCopyStatus = copyStatus[message.id];
      const currentResponseCopyStatus = responseCopyStatus[message.id];
      
      return (
        <motion.div 
          key={message.id}
          className={`message assistant ${isNewMessage ? 'new-message' : ''}`}
          variants={messageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button 
            className={`copy-response ${currentResponseCopyStatus ? currentResponseCopyStatus.status : ''}`}
            onClick={() => handleCopyResponse(message.rawContent || message.content, message.id)}
            title="Copy response"
            variants={codeSuggestionVariants}
          >
            {currentResponseCopyStatus ? (
              currentResponseCopyStatus.status === 'success' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              )
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
            )}
          </motion.button>

          {message.explanation && (
            <motion.div 
              className="explanation"
              dangerouslySetInnerHTML={{ __html: formatText(message.explanation) }}
              variants={codeSuggestionVariants}
            />
          )}
          
          {message.responseType !== 'code' && message.responseType !== 'optimization' && (
            <motion.div 
              dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
              variants={codeSuggestionVariants}
            />
          )}
          
          {message.responseType === 'code' && message.content && (
            <motion.div 
              className="code-suggestion"
              variants={codeSuggestionVariants}
            >
              <motion.button 
                className={`copy-button ${currentCopyStatus ? currentCopyStatus.status : ''}`}
                onClick={(e) => handleCopyCode(e, message.content, message.id)}
                title="Copy code"
                variants={codeSuggestionVariants}
              >
                {currentCopyStatus ? currentCopyStatus.message : 'Copy'}
              </motion.button>
              <motion.pre variants={codeSuggestionVariants}>
                <code>
                  {formatCode(message.content)}
                </code>
              </motion.pre>
              <motion.div 
                className="code-actions"
                variants={codeSuggestionVariants}
              >
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApplyChanges(message.content)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Apply
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMessages(prev => prev.filter((_, i) => i !== messages.indexOf(message)))}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  Dismiss
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {message.responseType === 'optimization' && message.content && (
            <motion.div 
              className="optimization"
              variants={codeSuggestionVariants}
            >
              <motion.button 
                className={`copy-button ${currentCopyStatus ? currentCopyStatus.status : ''}`}
                onClick={(e) => handleCopyCode(e, message.content, message.id)}
                title="Copy code"
                variants={codeSuggestionVariants}
              >
                {currentCopyStatus ? currentCopyStatus.message : 'Copy'}
              </motion.button>
              <motion.pre variants={codeSuggestionVariants}>
                <code>
                  {formatCode(message.content)}
                </code>
              </motion.pre>
              <motion.div 
                className="code-actions"
                variants={codeSuggestionVariants}
              >
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApplyChanges(message.content)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Apply
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMessages(prev => prev.filter((_, i) => i !== messages.indexOf(message)))}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  Dismiss
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {message.suggestions && message.suggestions.length > 0 && (
            <motion.div 
              className="suggestions"
              variants={codeSuggestionVariants}
            >
              <h4>Suggestions:</h4>
              <ul>
                {message.suggestions.map((suggestion, idx) => (
                  <motion.li 
                    key={idx}
                    dangerouslySetInnerHTML={{ __html: formatText(suggestion) }}
                    variants={codeSuggestionVariants}
                  />
                ))}
              </ul>
            </motion.div>
          )}
        </motion.div>
      );
    }

    return null;
  };

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyboardShortcut = (e) => {
      // Only handle shortcuts when chat is open
      if (!isOpen) return;

      // Check for Ctrl/Cmd + key combinations
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'e':
            e.preventDefault();
            setInput('Explain this code');
            setSelectedSuggestionIcon(suggestions[0].icon);
            break;
          case 'o':
            e.preventDefault();
            setInput('Optimize this code');
            setSelectedSuggestionIcon(suggestions[1].icon);
            break;
          case 'b':
            e.preventDefault();
            setInput('Find bugs in this code');
            setSelectedSuggestionIcon(suggestions[2].icon);
            break;
          case 'i':
            e.preventDefault();
            setInput('Suggest improvements');
            setSelectedSuggestionIcon(suggestions[3].icon);
            break;
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyboardShortcut);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcut);
    };
  }, [isOpen]); // Only re-run when isOpen changes

  // Add new chat handler
  const handleNewChat = () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear the message queue
    messageQueue.current = [];
    isProcessing.current = false;

    // Reset all states
    setMessages([]);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(false);
    lastMessageId.current = 0;
    animatedMessages.current.clear();
    setCurrentChatId(Date.now().toString());

    // Clear localStorage
    localStorage.removeItem('aiAssistantMessages');
    localStorage.removeItem('aiAssistantLastMessageId');
  };

  // Load previous chat
  const loadPreviousChat = (chatId) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear the message queue
    messageQueue.current = [];
    isProcessing.current = false;

    // Reset states
    setMessages([]);
    setInput('');
    setShowSuggestions(false);
    setIsLoading(false);
    lastMessageId.current = 0;
    animatedMessages.current.clear();

    // Load the selected chat from previousChats
    const selectedChat = previousChats.find(chat => chat.id === chatId);
    
    if (selectedChat) {
      setMessages(selectedChat.messages);
      setCurrentChatId(chatId);
      setShowChatHistory(false); // Close the dropdown after loading
    }
  };

  // Delete previous chat
  const deletePreviousChat = (chatId, e) => {
    e.stopPropagation();
    setPreviousChats(prev => prev.filter(chat => chat.id !== chatId));
    if (chatId === currentChatId) {
      handleNewChat();
    }
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showChatHistory &&
        chatHistoryRef.current &&
        !chatHistoryRef.current.contains(event.target) &&
        chatHistoryButtonRef.current &&
        !chatHistoryButtonRef.current.contains(event.target)
      ) {
        setShowChatHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatHistory]);

  // Add escape key handler
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showChatHistory) {
        setShowChatHistory(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showChatHistory]);

  const toggleChatHistory = () => {
    setShowChatHistory(prev => !prev);
  };

  // Add new function to handle suggestion icon click
  const handleSuggestionIconClick = () => {
    setShowSuggestions(!showSuggestions);
    if (!showSuggestions) {
      // Focus the input when showing suggestions
      inputRef.current?.focus();
    }
  };

  // Handle mouse movement for dragging
  const handleMouseMove = React.useCallback((e) => {
    if (isDragging && chatContainerRef.current) {
      e.preventDefault();
      e.stopPropagation();

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep window within viewport bounds
      const maxX = window.innerWidth - chatContainerRef.current.offsetWidth;
      const maxY = window.innerHeight - chatContainerRef.current.offsetHeight;

      // Direct position update without resistance
      setPosition({
        x: Math.max(0, Math.min(maxX, newX)),
        y: Math.max(0, Math.min(maxY, newY))
      });
    }
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e) => {
    if (e.target.closest('.chat-header')) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = chatContainerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      
      setIsDragging(true);
    }
  };

  const handleMouseUp = React.useCallback((e) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }
  }, [isDragging]);

  React.useEffect(() => {
    if (isDragging || isFocused) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isFocused, handleMouseMove, handleMouseUp]);

  // Center the window when it becomes visible
  React.useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      const windowRect = chatContainerRef.current.getBoundingClientRect();
      
      // Position at the bottom of the toggler (which is at top: 55px)
      const togglerBottom = 55 + 44; // toggler top + toggler height
      const rightPosition = 20; // same as toggler's right position
      
      setPosition({
        x: window.innerWidth - windowRect.width - rightPosition - 70,
        y: togglerBottom + 10 // Add some spacing
      });
    }
  }, [isOpen]);

  return (
    <div className="ai-assistant">
      <AnimatePresence>
        {hasEditorContent && (
          <motion.button 
            className={`ai-assistant-button ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            title="Ask AI Assistant"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{
              scale: 1.08,
              y: -3,
              transition: {
                type: "spring",
                stiffness: 400,
                damping: 15,
              },
            }}
            whileTap={{
              scale: 0.95,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 10,
              },
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            style={{
              position: 'fixed',
              top: '55px',
              right: '20px',
              zIndex: 1000
            }}
          >
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              animate={isOpen ? {
                rotate: 360,
                scale: [1, 1.1, 1],
                transition: {
                  duration: 0.6,
                  ease: "easeInOut",
                  times: [0, 0.5, 1],
                }
              } : {
                rotate: 0,
                scale: 1,
                transition: {
                  duration: 0.4,
                  ease: "easeInOut"
                }
              }}
              whileHover={{
                scale: 1.15,
                rotate: isOpen ? 365 : -5,
                transition: { duration: 0.3, ease: "easeInOut" },
              }}
            >
              {/* Code brackets with AI processing */}
              <motion.path
                d="M8 4L4 8v8l4 4M16 4l4 4v8l-4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />

              {/* Code syntax highlighting */}
              <motion.path
                d="M10 8h4M9 12h6M11 16h2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              />

              {/* AI processing waves */}
              <motion.path
                d="M12 8c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3z"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  delay: 0.2,
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Code optimization indicators */}
              <motion.path
                d="M12 12l2 2-2 2-2-2 2-2z"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  delay: 0.3,
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Debug indicators */}
              <motion.circle
                cx="12"
                cy="12"
                r="1"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  delay: 0.4,
                  duration: 0.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Code analysis lines */}
              <motion.path
                d="M7 8l2 2M7 12l2 2M7 16l2 2"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              />
              <motion.path
                d="M15 8l-2 2M15 12l-2 2M15 16l-2 2"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.2 }}
              />

              {/* Performance optimization arrows */}
              <motion.path
                d="M12 6l2 2M12 18l2-2"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: 1, pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.2 }}
              />
            </motion.svg>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            className="ai-assistant-chat"
            ref={chatContainerRef}
            initial={{ 
              opacity: 0, 
              scale: 0.95,
              x: window.innerWidth - 400 - 20 - 70,
              y: 55 + 44 + 10
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              x: position.x,
              y: position.y
            }}
            exit={{ 
              opacity: 0, 
              y: 20, 
              scale: 0.95,
              transition: {
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              cursor: isDragging ? 'grabbing' : 'default',
              userSelect: 'none',
              touchAction: 'none',
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
              willChange: 'transform',
              transition: isDragging ? 'none' : undefined,
              resize: 'both',
              overflow: 'hidden',
              minWidth: '300px',
              minHeight: '400px',
              maxWidth: '90vw',
              maxHeight: '90vh'
            }}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => {
              setIsHovered(true);
              setIsFocused(true);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setIsFocused(false);
            }}
          >
            <style>
              {`
                .ai-assistant-chat {
                  resize: both;
                  overflow: hidden;
                }
                .ai-assistant-chat::-webkit-resizer {
                  display: none;
                }
                .ai-assistant-chat::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  cursor: move;
                }
                .ai-assistant-chat:hover {
                  cursor: move;
                }
                .ai-assistant-chat:hover::before {
                  cursor: move;
                }
                .ai-assistant-chat:hover::after {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  pointer-events: none;
                }
                .ai-assistant-chat:hover::after {
                  cursor: nw-resize;
                }
                .ai-assistant-chat:hover::after {
                  cursor: ne-resize;
                }
                .ai-assistant-chat:hover::after {
                  cursor: sw-resize;
                }
                .ai-assistant-chat:hover::after {
                  cursor: se-resize;
                }
                .ai-assistant-chat:hover::after {
                  cursor: n-resize;
                }
                .ai-assistant-chat:hover::after {
                  cursor: s-resize;
                }
                .ai-assistant-chat:hover::after {
                  cursor: e-resize;
                }
                .ai-assistant-chat:hover::after {
                  cursor: w-resize;
                }
              `}
            </style>
            <div className="chat-header">
              <div className="chat-title-container">
                <h3>AI Code Assistant</h3>
                <button
                  ref={chatHistoryButtonRef}
                  className={`chat-history-button ${showChatHistory ? 'active' : ''}`}
                  onClick={toggleChatHistory}
                  aria-label="Chat history"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div
                  ref={chatHistoryRef}
                  className={`chat-history-dropdown ${showChatHistory ? 'visible' : ''}`}
                >
                  <div className="chat-history-header">
                    <span className="chat-history-title">Chat History</span>
                  </div>
                  <div className="chat-history-content">
                    {previousChats.length > 0 ? (
                      previousChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`chat-history-item ${chat.id === currentChatId ? 'active' : ''}`}
                          onClick={() => loadPreviousChat(chat.id)}
                        >
                          <span className="chat-title">{chat.title}</span>
                          <span className="chat-timestamp">
                            {new Date(chat.timestamp).toLocaleTimeString()}
                          </span>
                          <button
                            className="delete-chat-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePreviousChat(chat.id, e);
                            }}
                            aria-label="Delete chat"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M3 6h18" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="no-chats-message">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span>No previous chats</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="chat-actions">
                <motion.button 
                  onClick={handleNewChat}
                  className="new-chat-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Start new chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                </motion.button>
                <motion.button 
                  onClick={() => setIsOpen(false)} 
                  className="close-button"
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </motion.button>
              </div>
            </div>

            <div className="chat-messages">
              <div className="messages-container">
                {messages.map((message, index) => (
                  <div key={message.id}>
                    {renderMessage(message, index)}
                  </div>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {messages.length === 0 && (
                  <motion.div 
                    className="empty-state"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ 
                      opacity: 0, 
                      scale: 0.95,
                      transition: {
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1]
                      }
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <div className="empty-state-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        {/* Main chat bubble */}
                        <motion.path
                          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                        />
                        {/* Left code bracket */}
                        <motion.path
                          d="M7 7l2 2-2 2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 1.2, ease: "easeInOut" }}
                        />
                        {/* Right code bracket */}
                        <motion.path
                          d="M17 7l-2 2 2 2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 1.4, ease: "easeInOut" }}
                        />
                        {/* AI brain symbol */}
                        <motion.path
                          d="M12 8c2 0 3 1 3 3s-1 3-3 3-3-1-3-3 1-3 3-3z"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.8, delay: 1.6, ease: "easeInOut" }}
                        />
                        {/* Code completion arrow */}
                        <motion.path
                          d="M12 16l2-2"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.3, delay: 2.2, ease: "easeInOut" }}
                        />
                        {/* Processing dots */}
                        <motion.circle
                          cx="9"
                          cy="14"
                          r="1"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 2.4, ease: "easeOut" }}
                        />
                        <motion.circle
                          cx="12"
                          cy="14"
                          r="1"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 2.6, ease: "easeOut" }}
                        />
                        <motion.circle
                          cx="15"
                          cy="14"
                          r="1"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 2.8, ease: "easeOut" }}
                        />
                      </svg>
                    </div>
                    <h2 className="empty-state-title">Welcome to AI Code Assistant</h2>
                    <p className="empty-state-description">
                      Your intelligent coding companion. Ask questions, get explanations, and optimize your code with AI-powered assistance.
                    </p>
                    <div className="empty-state-features">
                      <div className="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>
                          <path d="M12 8v8"/>
                          <path d="M5 3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
                          <path d="M19 3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
                          <path d="M5 13a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"/>
                          <path d="M19 13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z"/>
                          <path d="M12 22a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2 2 2 0 0 1 2 2v2a2 2 0 0 1-2 2z"/>
                        </svg>
                        <span className="feature-text">Code Optimization</span>
                      </div>
                      <div className="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <path d="M12 16v-4"/>
                          <path d="M12 8h.01"/>
                        </svg>
                        <span className="feature-text">Smart Explanations</span>
                      </div>
                      <div className="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m8 2 1.88 1.88"/>
                          <path d="M14.12 3.88 16 2"/>
                          <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/>
                          <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/>
                        </svg>
                        <span className="feature-text">Bug Detection</span>
                      </div>
                      <div className="feature-item">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18h6"/>
                          <path d="M10 22h4"/>
                          <path d="M12 2v8"/>
                          <path d="M15 5l-3 3-3-3"/>
                        </svg>
                        <span className="feature-text">Code Improvements</span>
                      </div>
                    </div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                    <div className="particle"></div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {isLoading && (
              <motion.div 
                className="message assistant loading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ 
                  opacity: 0, 
                  y: 10,
                  transition: {
                    duration: 0.15,
                    ease: [0.4, 0, 0.2, 1]
                  }
                }}
                transition={{
                  duration: 0.2,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </motion.div>
            )}

            <motion.form 
              onSubmit={handleSubmit} 
              className="chat-input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={`input-suggestions ${showSuggestions ? 'visible' : ''}`} ref={suggestionsRef}>
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`suggestion-item ${index === activeSuggestionIndex ? 'active' : ''}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.icon}
                    <span className="suggestion-text">{suggestion.text}</span>
                    <span className="suggestion-shortcut">{suggestion.shortcut}</span>
                  </div>
                ))}
              </div>
              <div 
                className={`selected-suggestion-icon ${selectedSuggestionIcon ? 'visible' : ''}`}
                onClick={handleSuggestionIconClick}
                style={{ cursor: 'pointer' }}
              >
                {selectedSuggestionIcon || (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your code..."
                className={selectedSuggestionIcon ? 'has-icon' : ''}
              />
              <motion.button 
                type="submit" 
                disabled={!input.trim() && !isLoading}
                className={`submit-button ${isLoading ? 'loading' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z"/>
                  </svg>
                )}
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant; 