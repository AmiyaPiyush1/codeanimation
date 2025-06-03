import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Star, 
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Clock,
  ThumbsUp,
  MessageCircle,
  Loader2,
  Filter,
  Plus,
  Tag,
  User,
  Award,
  Bookmark,
  Share2,
  Flag,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Forum = () => {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreatingDiscussion, setIsCreatingDiscussion] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [userNotifications, setUserNotifications] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Replace with actual auth check
  const [userReputation, setUserReputation] = useState(1250); // Replace with actual user data

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch initial discussions and user data
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setIsLoading(false);
    }
  };

  const stats = [
    { number: "10K+", label: "Active Members", icon: Users, color: "text-blue-400" },
    { number: "50K+", label: "Discussions", icon: MessageSquare, color: "text-emerald-400" },
    { number: "24/7", label: "Support", icon: Clock, color: "text-purple-400" },
    { number: "100%", label: "Engagement", icon: TrendingUp, color: "text-rose-400" }
  ];

  const categories = [
    { id: 'all', name: 'All Topics', icon: MessageSquare, color: 'text-blue-400' },
    { id: 'general', name: 'General Discussion', icon: Users, color: 'text-emerald-400' },
    { id: 'help', name: 'Help & Support', icon: AlertCircle, color: 'text-purple-400' },
    { id: 'showcase', name: 'Showcase', icon: Star, color: 'text-rose-400' }
  ];

  const tags = [
    { id: 'javascript', name: 'JavaScript', color: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'python', name: 'Python', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'react', name: 'React', color: 'bg-cyan-500/20 text-cyan-400' },
    { id: 'algorithms', name: 'Algorithms', color: 'bg-purple-500/20 text-purple-400' },
    { id: 'data-structures', name: 'Data Structures', color: 'bg-emerald-500/20 text-emerald-400' }
  ];

  const discussions = [
    {
      id: 1,
      title: 'Getting Started with CodeStream',
      category: 'general',
      author: {
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        reputation: 1250,
        role: 'moderator'
      },
      content: 'Learn how to make the most of CodeStream\'s features...',
      tags: ['javascript', 'react'],
      replies: 15,
      views: 234,
      likes: 45,
      lastActivity: '2 hours ago',
      isPinned: true,
      isSolved: true
    },
    {
      id: 2,
      title: 'Best Practices for Code Review',
      category: 'help',
      author: {
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        reputation: 850,
        role: 'member'
      },
      content: 'Share your tips and tricks for effective code reviews...',
      tags: ['algorithms', 'data-structures'],
      replies: 8,
      views: 156,
      likes: 23,
      lastActivity: '5 hours ago',
      isPinned: false,
      isSolved: false
    },
    // Add more discussions...
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement search logic
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Implement category filtering
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    // Implement sorting logic
  };

  const handleTagSelect = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleNewDiscussion = () => {
    if (!isAuthenticated) {
      // Show login prompt
      return;
    }
    setIsCreatingDiscussion(true);
    // Navigate to discussion creation page
  };

  const handleDiscussionAction = (action, discussionId) => {
    switch (action) {
      case 'edit':
        // Navigate to edit page
        break;
      case 'delete':
        // Show delete confirmation
        break;
      case 'report':
        // Show report form
        break;
      case 'bookmark':
        // Toggle bookmark
        break;
      default:
        break;
    }
  };

  const handleLike = (discussionId) => {
    // Implement like functionality
  };

  const handleShare = (discussionId) => {
    // Implement share functionality
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
      {/* Hero Section with Parallax */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/50 to-navy-950/50 z-10" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="relative z-20 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-emerald-500/20 mb-8 interactive-element"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Community Forum</span>
            </motion.div>

            <h1 className="text-5xl lg:text-7xl font-bold">
              <span className="text-slate-100">Join the</span>{" "}
              <span className="gradient-text">Discussion</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Connect with fellow developers, share your knowledge, and get help from the community
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 pt-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-4xl font-bold ${stat.color} mb-2`}>
                    {stat.number}
                  </div>
                  <div className="text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Forum Content */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Search and Filter Bar */}
          <div className="glass-pro rounded-2xl border border-slate-700/50 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </motion.button>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="views">Most Views</option>
                  <option value="replies">Most Replies</option>
                </select>
                <motion.button
                  onClick={handleNewDiscussion}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  New Discussion
                </motion.button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-slate-700/50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <motion.button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 rounded-lg text-sm ${
                            selectedCategory === category.id
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                          }`}
                        >
                          {category.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map(tag => (
                        <motion.button
                          key={tag.id}
                          onClick={() => handleTagSelect(tag.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 rounded-lg text-sm ${
                            selectedTags.includes(tag.id)
                              ? tag.color
                              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                          }`}
                        >
                          {tag.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`glass-pro rounded-xl border border-slate-700/50 p-6 text-center transition-all duration-300 ${
                  selectedCategory === category.id ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''
                }`}
              >
                <category.icon className={`w-8 h-8 mx-auto mb-3 ${category.color}`} />
                <h3 className="text-lg font-semibold text-slate-200">{category.name}</h3>
              </motion.button>
            ))}
          </div>

          {/* Discussions List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : (
              discussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`glass-pro rounded-xl border border-slate-700/50 p-6 transition-all duration-300 ${
                    discussion.isPinned ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : ''
                  }`}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Author Info */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <img
                          src={discussion.author.avatar}
                          alt={discussion.author.name}
                          className="w-12 h-12 rounded-full border-2 border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">
                              {discussion.author.name}
                            </span>
                            {discussion.author.role === 'moderator' && (
                              <Shield className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Award className="w-4 h-4" />
                            <span>{discussion.author.reputation} reputation</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Discussion Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {discussion.isPinned && (
                              <Star className="w-4 h-4 text-emerald-400" />
                            )}
                            {discussion.isSolved && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                            <h3 className="text-xl font-semibold text-slate-200">
                              {discussion.title}
                            </h3>
                          </div>
                          <p className="text-slate-400 mb-4">
                            {discussion.content}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {discussion.tags.map(tagId => {
                              const tag = tags.find(t => t.id === tagId);
                              return tag && (
                                <span
                                  key={tag.id}
                                  className={`px-2 py-1 rounded-lg text-sm ${tag.color}`}
                                >
                                  {tag.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="relative">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-slate-400 hover:text-slate-200"
                              onClick={() => handleDiscussionAction('more', discussion.id)}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Discussion Stats */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-slate-400">
                            <MessageCircle className="w-5 h-5" />
                            <span>{discussion.replies}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <ThumbsUp className="w-5 h-5" />
                            <span>{discussion.likes}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-5 h-5" />
                            <span>{discussion.lastActivity}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-emerald-400"
                            onClick={() => handleLike(discussion.id)}
                          >
                            <ThumbsUp className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-blue-400"
                            onClick={() => handleShare(discussion.id)}
                          >
                            <Share2 className="w-5 h-5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-slate-400 hover:text-yellow-400"
                            onClick={() => handleDiscussionAction('bookmark', discussion.id)}
                          >
                            <Bookmark className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default Forum; 