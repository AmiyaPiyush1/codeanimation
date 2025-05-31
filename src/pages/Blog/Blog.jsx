import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import useDebounce from '../../hooks/useDebounce';
import { 
  Search,
  Filter,
  Clock,
  User,
  Tag,
  ChevronRight,
  ArrowRight,
  Calendar,
  BookOpen,
  Newspaper,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Loader2,
  ExternalLink,
  Award,
  TrendingUp,
  Code2,
  Lightbulb,
  Users,
  Globe,
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
  FileText,
  Download,
  Mail,
  Phone,
  MapPin,
  Building2,
  Link2
} from 'lucide-react';

const Blog = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('blog'); // 'blog' or 'press'
  const [sortBy, setSortBy] = useState('recent');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filteredPressReleases, setFilteredPressReleases] = useState([]);

  // Add debounced search query with callback
  const debouncedSearchQuery = useDebounce(searchQuery, 300, (value) => {
    setIsLoading(true);
    // Simulate loading state
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: 'all', name: 'All Posts', icon: BookOpen, color: 'text-blue-400' },
    { id: 'engineering', name: 'Engineering', icon: Code2, color: 'text-emerald-400' },
    { id: 'product', name: 'Product', icon: Lightbulb, color: 'text-purple-400' },
    { id: 'company', name: 'Company', icon: Building2, color: 'text-rose-400' },
    { id: 'community', name: 'Community', icon: Users, color: 'text-yellow-400' }
  ];

  const tags = [
    { id: 'javascript', name: 'JavaScript', color: 'bg-yellow-500/20 text-yellow-400' },
    { id: 'react', name: 'React', color: 'bg-blue-500/20 text-blue-400' },
    { id: 'ai', name: 'AI', color: 'bg-purple-500/20 text-purple-400' },
    { id: 'algorithms', name: 'Algorithms', color: 'bg-emerald-500/20 text-emerald-400' },
    { id: 'tutorial', name: 'Tutorial', color: 'bg-rose-500/20 text-rose-400' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'Building the Future of Developer Tools',
      excerpt: 'How we\'re revolutionizing the way developers learn and collaborate...',
      author: {
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        role: 'Engineering Lead'
      },
      category: 'engineering',
      tags: ['javascript', 'react'],
      date: '2025-03-15',
      readTime: '5 min read',
      likes: 245,
      comments: 32,
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80'
    },
    {
      id: 2,
      title: 'The Power of AI in Code Learning',
      excerpt: 'Exploring how artificial intelligence is transforming the way we learn programming...',
      author: {
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        role: 'AI Research Lead'
      },
      category: 'product',
      tags: ['ai', 'tutorial'],
      date: '2025-03-14',
      readTime: '7 min read',
      likes: 189,
      comments: 24,
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80'
    }
  ];

  const pressReleases = [
    {
      id: 1,
      title: 'CodeStream Raises $10M Series A Funding',
      excerpt: 'Leading developer education platform secures major investment to expand global reach...',
      date: '2025-03-10',
      type: 'funding',
      pdf: '#',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 2,
      title: 'CodeStream Launches New AI-Powered Learning Features',
      excerpt: 'Platform introduces revolutionary AI features to enhance developer learning experience...',
      date: '2025-03-05',
      type: 'product',
      pdf: '#',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2072&q=80'
    }
  ];

  const pressKit = {
    logo: {
      light: '/logo-light.svg',
      dark: '/logo-dark.svg'
    },
    brandAssets: [
      { name: 'Brand Guidelines', type: 'PDF', size: '2.4 MB', url: '#' },
      { name: 'Logo Pack', type: 'ZIP', size: '5.1 MB', url: '#' },
      { name: 'Press Photos', type: 'ZIP', size: '15.2 MB', url: '#' }
    ],
    contact: {
      press: 'press@codestream.com',
      phone: '+1 (555) 123-4567',
      address: '123 Tech Street, San Francisco, CA 94105'
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement search logic
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Implement filtering logic
  };

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    // Implement filtering logic
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    // Implement sorting logic
  };

  useEffect(() => {
    // Filter blog posts
    const filtered = blogPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                          post.author.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);

      return matchesSearch && matchesCategory && matchesTag;
    });

    // Sort the filtered posts
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date) - new Date(a.date);
        case 'popular':
          return b.likes - a.likes;
        case 'comments':
          return b.comments - a.comments;
        default:
          return 0;
      }
    });

    setFilteredPosts(sorted);
  }, [debouncedSearchQuery, selectedCategory, selectedTag, sortBy]);

  useEffect(() => {
    // Filter press releases
    const filtered = pressReleases.filter(release => {
      return release.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
             release.excerpt.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    });

    setFilteredPressReleases(filtered);
  }, [debouncedSearchQuery]);

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
      {/* Hero Section */}
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
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-slate-300">Latest Updates</span>
            </motion.div>

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
                Explore Our
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Latest Articles
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Stay updated with the latest insights, tutorials, and news from the world of programming and algorithms.
            </motion.p>

            {/* Tab Navigation */}
            <div className="flex justify-center gap-4 pt-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('blog')}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 ${
                  activeTab === 'blog'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                Blog
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('press')}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 ${
                  activeTab === 'press'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Newspaper className="w-5 h-5" />
                Press
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Blog Content */}
      {activeTab === 'blog' && (
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
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="comments">Most Comments</option>
                  </select>
                </div>
              </div>

              {/* Categories and Tags */}
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <motion.button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${
                            selectedCategory === category.id
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
                          }`}
                        >
                          <category.icon className="w-4 h-4" />
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
                            selectedTag === tag.id
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
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {isLoading ? (
                <div className="col-span-2 flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                </div>
              ) : filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="glass-pro rounded-2xl border border-slate-700/50 overflow-hidden"
                  >
                    <div className="aspect-video relative">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-lg text-xs ${
                          categories.find(c => c.id === post.category)?.color
                        }`}>
                          {categories.find(c => c.id === post.category)?.name}
                        </span>
                        <span className="text-slate-400 text-sm">
                          {post.readTime}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-200 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-400 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <div className="text-sm font-medium text-slate-200">
                              {post.author.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {post.author.role}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-slate-400">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm">{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="col-span-2 text-center py-12">
                  <p className="text-slate-400">No posts found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Press Content */}
      {activeTab === 'press' && (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            {/* Press Releases */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-slate-100 mb-8">
                Press Releases
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {filteredPressReleases.length > 0 ? (
                  filteredPressReleases.map((release, index) => (
                    <motion.article
                      key={release.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                      className="glass-pro rounded-2xl border border-slate-700/50 overflow-hidden"
                    >
                      <div className="aspect-video relative">
                        <img
                          src={release.image}
                          alt={release.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-400">
                            {release.type}
                          </span>
                          <span className="text-slate-400 text-sm">
                            {new Date(release.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-200 mb-2">
                          {release.title}
                        </h3>
                        <p className="text-slate-400 mb-4">
                          {release.excerpt}
                        </p>
                        <div className="flex items-center gap-4">
                          <motion.a
                            href={release.pdf}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-slate-800/50 text-slate-300 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-700/50"
                          >
                            <FileText className="w-4 h-4" />
                            Download PDF
                          </motion.a>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-slate-400 hover:text-slate-300"
                          >
                            <Share2 className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-slate-400">No press releases found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Press Kit */}
            <div className="glass-pro rounded-2xl border border-slate-700/50 p-8">
              <h2 className="text-3xl font-bold text-slate-100 mb-8">
                Press Kit
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-4">
                    Brand Assets
                  </h3>
                  <div className="space-y-4">
                    {pressKit.brandAssets.map((asset, index) => (
                      <motion.a
                        key={index}
                        href={asset.url}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-700/50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-emerald-400" />
                          <div>
                            <div className="text-slate-200">{asset.name}</div>
                            <div className="text-sm text-slate-400">
                              {asset.type} • {asset.size}
                            </div>
                          </div>
                        </div>
                        <Download className="w-5 h-5 text-slate-400" />
                      </motion.a>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Mail className="w-5 h-5 text-emerald-400" />
                      <span>{pressKit.contact.press}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <Phone className="w-5 h-5 text-emerald-400" />
                      <span>{pressKit.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                      <span>{pressKit.contact.address}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default Blog; 