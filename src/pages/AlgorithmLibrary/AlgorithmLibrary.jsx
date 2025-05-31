import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Code2,
  Filter,
  ChevronDown,
  Play,
  Pause,
  Settings,
  Info,
  Star,
  Clock,
  Zap,
  Book,
  Users,
  ArrowRight,
  ExternalLink,
  Github,
  Globe,
  Download,
  Copy,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ThumbsUp,
  Loader2,
  Menu,
  X,
  Library
} from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

const AlgorithmLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [filteredAlgorithms, setFilteredAlgorithms] = useState([]);

  const categories = [
    { id: 'all', name: 'All Algorithms' },
    { id: 'sorting', name: 'Sorting' },
    { id: 'searching', name: 'Searching' },
    { id: 'graph', name: 'Graph' },
    { id: 'dynamic', name: 'Dynamic Programming' },
    { id: 'string', name: 'String' },
    { id: 'tree', name: 'Tree' },
    { id: 'array', name: 'Array' }
  ];

  const complexityLevels = [
    { id: 'all', name: 'All Complexities' },
    { id: 'constant', name: 'O(1)' },
    { id: 'logarithmic', name: 'O(log n)' },
    { id: 'linear', name: 'O(n)' },
    { id: 'linearithmic', name: 'O(n log n)' },
    { id: 'quadratic', name: 'O(n²)' },
    { id: 'cubic', name: 'O(n³)' },
    { id: 'exponential', name: 'O(2ⁿ)' }
  ];

  const algorithms = [
    {
      id: 'quicksort',
      name: 'QuickSort',
      category: 'sorting',
      complexity: 'linearithmic',
      description: 'An efficient, comparison-based, in-place sorting algorithm.',
      popularity: 5,
      difficulty: 'Medium',
      language: 'JavaScript',
      code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  
  return [...quickSort(left), pivot, ...quickSort(right)];
}`
    },
    {
      id: 'binary-search',
      name: 'Binary Search',
      category: 'searching',
      complexity: 'logarithmic',
      description: 'An efficient algorithm for finding an element in a sorted array.',
      popularity: 5,
      difficulty: 'Easy',
      language: 'JavaScript',
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  
  return -1;
}`
    },
    {
      id: 'dijkstra',
      name: "Dijkstra's Algorithm",
      category: 'graph',
      complexity: 'quadratic',
      description: 'An algorithm for finding the shortest paths between nodes in a graph.',
      popularity: 4,
      difficulty: 'Hard',
      language: 'JavaScript',
      code: `function dijkstra(graph, start) {
  const distances = {};
  const visited = new Set();
  
  for (let node in graph) {
    distances[node] = Infinity;
  }
  distances[start] = 0;
  
  while (visited.size < Object.keys(graph).length) {
    let minNode = null;
    let minDistance = Infinity;
    
    for (let node in distances) {
      if (!visited.has(node) && distances[node] < minDistance) {
        minNode = node;
        minDistance = distances[node];
      }
    }
    
    if (minNode === null) break;
    
    visited.add(minNode);
    
    for (let neighbor in graph[minNode]) {
      const distance = distances[minNode] + graph[minNode][neighbor];
      if (distance < distances[neighbor]) {
        distances[neighbor] = distance;
      }
    }
  }
  
  return distances;
}`
    }
  ];

  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (codeId) => {
    setCopiedCode(codeId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Filter algorithms based on search query, category, and complexity
    const filtered = algorithms.filter(algorithm => {
      const matchesSearch = algorithm.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                          algorithm.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                          algorithm.language.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || algorithm.category === selectedCategory;
      const matchesComplexity = selectedComplexity === 'all' || algorithm.complexity === selectedComplexity;

      return matchesSearch && matchesCategory && matchesComplexity;
    });

    // Sort the filtered algorithms
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'complexity':
          return a.complexity.localeCompare(b.complexity);
        default:
          return 0;
      }
    });

    setFilteredAlgorithms(sorted);
  }, [debouncedSearchQuery, selectedCategory, selectedComplexity, sortBy]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950">
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
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-purple-500/20 mb-8 interactive-element">
              <Library className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-slate-300">Algorithm Collection</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3">
                <Code2 className="w-full h-full text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-100">
                Algorithm Library
              </h1>
            </div>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Explore our comprehensive collection of algorithms and data structures.
              Learn, visualize, and implement with interactive examples.
            </p>

            {/* Search and Filters */}
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search algorithms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="flex flex-wrap gap-4 justify-center">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {complexityLevels.map((complexity) => (
                    <option key={complexity.id} value={complexity.id}>
                      {complexity.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="popularity">Sort by Popularity</option>
                  <option value="complexity">Sort by Complexity</option>
                  <option value="difficulty">Sort by Difficulty</option>
                </select>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Algorithms Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlgorithms.map((algorithm, index) => (
              <motion.div
                key={algorithm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-pro rounded-2xl border border-slate-700/50 p-6 space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-200">
                      {algorithm.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-sm rounded-lg">
                        {algorithm.complexity}
                      </span>
                      <span className="px-2 py-1 bg-slate-800/50 text-slate-400 text-sm rounded-lg">
                        {algorithm.difficulty}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400">
                    {algorithm.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{algorithm.popularity}/5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span>{algorithm.complexity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Code2 className="w-4 h-4 text-emerald-500" />
                      <span>{algorithm.language}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => handleCopyCode(algorithm.id)}
                      className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      {copiedCode === algorithm.id ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-x-auto">
                    <code className="text-slate-300 text-sm">
                      {algorithm.code}
                    </code>
                  </pre>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    <span>Run Demo</span>
                  </button>
                  <button className="flex-1 px-4 py-2 bg-slate-800/50 text-slate-400 rounded-lg hover:bg-slate-700/50 transition-colors flex items-center justify-center gap-2">
                    <Book className="w-4 h-4" />
                    <span>Learn More</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default AlgorithmLibrary; 