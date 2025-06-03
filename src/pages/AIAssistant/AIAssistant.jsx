import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send,
  Bot,
  User,
  Code2,
  Copy,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Sparkles,
  Brain,
  Lightbulb,
  ArrowRight,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  Book,
  FileCode,
  Terminal,
  Zap,
  Wand2
} from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        type: 'ai',
        content: `Here's a solution to your problem:\n\n\`\`\`javascript\nfunction example() {\n  // Your code here\n  return "Hello, World!";\n}\n\`\`\``,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleCopyCode = (codeId) => {
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
      {/* Hero Section */}
      <section className="relative pt-64 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/50 border border-purple-500/20 mb-8">
              <Wand2 className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">AI-Powered Assistant</span>
            </div>

            <motion.h1 
              className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.2] min-h-[1.2em]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.span 
                className="text-slate-200/90 inline-block align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Your Personal
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                AI Assistant
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Get instant help with your algorithms and coding challenges.
              Our AI assistant provides detailed explanations and optimized solutions.
            </motion.p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                {
                  icon: Brain,
                  title: 'Smart Solutions',
                  description: 'Get optimized solutions for complex algorithms'
                },
                {
                  icon: Sparkles,
                  title: 'Code Analysis',
                  description: 'Understand your code with detailed explanations'
                },
                {
                  icon: Lightbulb,
                  title: 'Best Practices',
                  description: 'Learn industry-standard coding practices'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 space-y-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3">
                    <feature.icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chat Interface */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-2.5">
                  <Bot className="w-full h-full text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">
                    AI Assistant
                  </h3>
                  <p className="text-sm text-slate-400">
                    Ask me anything about algorithms and coding
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Chat Messages */}
            {isExpanded && (
              <div className="h-[600px] overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : ''}`}
                  >
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-1.5 flex-shrink-0">
                        <Bot className="w-full h-full text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.type === 'user'
                          ? 'bg-purple-500/20 text-purple-100'
                          : 'bg-slate-800/50 text-slate-200'
                      }`}
                    >
                      {message.content.includes('```') ? (
                        <div className="space-y-2">
                          <p className="text-sm text-slate-200">
                            {message.content.split('```')[0]}
                          </p>
                          <div className="relative">
                            <button
                              onClick={() => handleCopyCode(index)}
                              className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-300 transition-colors"
                            >
                              {copiedCode === index ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                            <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                              <code className="text-sm text-slate-200">
                                {message.content.split('```')[1].replace('javascript\n', '')}
                              </code>
                            </pre>
                          </div>
                          <p className="text-sm text-slate-200">
                            {message.content.split('```')[2]}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                    </div>
                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-1.5 flex-shrink-0">
                        <User className="w-full h-full text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-1.5 flex-shrink-0">
                      <Bot className="w-full h-full text-white" />
                    </div>
                    <div className="bg-slate-800/50 rounded-2xl p-4">
                      <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
              <div className="flex gap-4">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about algorithms, data structures, or coding challenges..."
                  className="flex-1 p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default AIAssistant; 