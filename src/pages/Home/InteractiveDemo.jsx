import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, Code, BarChart3, Monitor, Code2, Brain, Eye, Zap, Share2, BookOpen } from 'lucide-react';
import ScrollReveal from 'scrollreveal';

const InteractiveDemo = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const demoRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const controlsRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const [array, setArray] = useState([64, 34, 25, 12, 22]);
  const [comparisonCount, setComparisonCount] = useState(0);
  const [swapCount, setSwapCount] = useState(0);
  const [isSorting, setIsSorting] = useState(false);
  const [highlightedIndices, setHighlightedIndices] = useState([]);
  const [searchValue, setSearchValue] = useState(25);
  const [graphNodes, setGraphNodes] = useState([
    { id: 1, value: 'A', visited: false, x: 0, y: 0 },
    { id: 2, value: 'B', visited: false, x: 100, y: 50 },
    { id: 3, value: 'C', visited: false, x: -100, y: 50 },
    { id: 4, value: 'D', visited: false, x: 150, y: 100 },
    { id: 5, value: 'E', visited: false, x: -150, y: 100 }
  ]);
  const [graphEdges] = useState([
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 5 }
  ]);
  const [activeOperation, setActiveOperation] = useState('');
  const [mergeArrays, setMergeArrays] = useState({ left: [], right: [], result: [] });
  const [movingBlocks, setMovingBlocks] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);
  const [heapStructure, setHeapStructure] = useState([]);
  const [bfsQueue, setBfsQueue] = useState([]);

  // Add state for tag rotation and mouse position
  const [tagRotation, setTagRotation] = useState({ x: 0, y: 0 });
  const [tagMousePosition, setTagMousePosition] = useState({ x: 0, y: 0 });

  // Add mouse event handlers
  const handleTagMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTagMousePosition({ x, y });
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    setTagRotation({ x: rotateX, y: rotateY });
  };

  const handleTagMouseLeave = () => {
    setTagRotation({ x: 0, y: 0 });
    setTagMousePosition({ x: 0, y: 0 });
  };

  const algorithms = [
    { id: 'bubbleSort', name: 'Bubble Sort', complexity: 'O(n²)' },
    { id: 'quickSort', name: 'Quick Sort', complexity: 'O(n log n)' },
    { id: 'mergeSort', name: 'Merge Sort', complexity: 'O(n log n)' },
    { id: 'heapSort', name: 'Heap Sort', complexity: 'O(n log n)' },
    { id: 'binarySearch', name: 'Binary Search', complexity: 'O(log n)' },
    { id: 'dfsTraversal', name: 'DFS Traversal', complexity: 'O(V + E)' },
    { id: 'bfsTraversal', name: 'BFS Traversal', complexity: 'O(V + E)' }
  ];

  const algorithmCode = {
    bubbleSort: [
      "function bubbleSort(array) {",
      "  const n = array.length;",
      "  for (let i = 0; i < n - 1; i++) {",
      "    for (let j = 0; j < n - i - 1; j++) {",
      "      if (array[j] > array[j + 1]) {",
      "        // Swap elements",
      "        [array[j], array[j + 1]] = [array[j + 1], array[j]];",
      "      }",
      "    }",
      "  }",
      "  return array;",
      "}"
    ],
    quickSort: [
      "function quickSort(array, low, high) {",
      "  if (low < high) {",
      "    const pivotIndex = partition(array, low, high);",
      "    quickSort(array, low, pivotIndex - 1);",
      "    quickSort(array, pivotIndex + 1, high);",
      "  }",
      "}",
      "",
      "function partition(array, low, high) {",
      "  const pivot = array[high];",
      "  let i = low - 1;",
      "  for (let j = low; j < high; j++) {",
      "    if (array[j] < pivot) {",
      "      i++;",
      "      [array[i], array[j]] = [array[j], array[i]];",
      "    }",
      "  }",
      "  [array[i + 1], array[high]] = [array[high], array[i + 1]];",
      "  return i + 1;",
      "}"
    ],
    binarySearch: [
      "function binarySearch(array, target) {",
      "  let left = 0;",
      "  let right = array.length - 1;",
      "",
      "  while (left <= right) {",
      "    const mid = Math.floor((left + right) / 2);",
      "    if (array[mid] === target) {",
      "      return mid;",
      "    }",
      "    if (array[mid] < target) {",
      "      left = mid + 1;",
      "    } else {",
      "      right = mid - 1;",
      "    }",
      "  }",
      "  return -1;",
      "}"
    ],
    dfsTraversal: [
      "function dfsTraversal(graph, startNode) {",
      "  const visited = new Set();",
      "  const stack = [startNode];",
      "",
      "  while (stack.length > 0) {",
      "    const current = stack.pop();",
      "    if (!visited.has(current)) {",
      "      visited.add(current);",
      "      const neighbors = graph[current];",
      "      for (const neighbor of neighbors) {",
      "        if (!visited.has(neighbor)) {",
      "          stack.push(neighbor);",
      "        }",
      "      }",
      "    }",
      "  }",
      "}"
    ],
    mergeSort: [
      "function mergeSort(array) {",
      "  if (array.length <= 1) return array;",
      "  const mid = Math.floor(array.length / 2);",
      "  const left = mergeSort(array.slice(0, mid));",
      "  const right = mergeSort(array.slice(mid));",
      "  return merge(left, right);",
      "}",
      "",
      "function merge(left, right) {",
      "  const result = [];",
      "  let i = 0, j = 0;",
      "  while (i < left.length && j < right.length) {",
      "    if (left[i] <= right[j]) {",
      "      result.push(left[i++]);",
      "    } else {",
      "      result.push(right[j++]);",
      "    }",
      "  }",
      "  return result.concat(left.slice(i), right.slice(j));",
      "}"
    ],
    heapSort: [
      "function heapSort(array) {",
      "  buildMaxHeap(array);",
      "  for (let i = array.length - 1; i > 0; i--) {",
      "    [array[0], array[i]] = [array[i], array[0]];",
      "    heapify(array, 0, i);",
      "  }",
      "  return array;",
      "}",
      "",
      "function buildMaxHeap(array) {",
      "  for (let i = Math.floor(array.length / 2); i >= 0; i--) {",
      "    heapify(array, i, array.length);",
      "  }",
      "}"
    ]
  };

  const demoSteps = {
    bubbleSort: [
      "Initialize array [64, 34, 25, 12, 22]",
      "Compare adjacent elements",
      "Swap elements if needed",
      "Complete current pass",
      "Sorting complete"
    ],
    quickSort: [
      "Select pivot element",
      "Start partitioning",
      "Compare with pivot",
      "Place pivot in position",
      "Sorting complete"
    ],
    binarySearch: [
      "Sort array for binary search",
      "Find middle element",
      "Target found",
      "Search right half",
      "Search left half",
      "Target not found"
    ],
    dfsTraversal: [
      "Start from node A",
      "Mark current node as visited",
      "Push unvisited neighbors to stack",
      "Process neighbors",
      "Traversal complete"
    ],
    mergeSort: [
      "Divide array into two halves",
      "Recursively sort left half",
      "Recursively sort right half",
      "Merge sorted halves",
      "Sorting complete"
    ],
    heapSort: [
      "Build max heap from array",
      "Swap root with last element",
      "Heapify remaining elements",
      "Repeat until heap is empty",
      "Sorting complete"
    ],
    bfsTraversal: [
      "Start from node A",
      "Add neighbors to queue",
      "Process nodes in queue",
      "Mark nodes as visited",
      "Traversal complete"
    ]
  };

  // Configure ScrollReveal animations
  useEffect(() => {
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '60px',
      duration: 1200,
      delay: 0,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reset: true,
      mobile: true,
      viewFactor: 0.2,
      beforeReveal: (el) => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
      },
      beforeReset: (el) => {
        el.style.visibility = 'hidden';
        el.style.opacity = '0';
        el.style.transform = 'translateY(60px) scale(0.95) rotate(2deg)';
      }
    });

    // Enhanced Header section animations with ultra-smooth effects
    sr.reveal(badgeRef.current, {
      delay: 0,
      distance: '30px',
      duration: 1000,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.95,
      opacity: 0,
      rotate: { x: 5, z: 1 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    sr.reveal(titleRef.current, {
      delay: 100,
      distance: '40px',
      duration: 1200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.95,
      opacity: 0,
      rotate: { x: 3, y: 1 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    sr.reveal(descriptionRef.current, {
      delay: 200,
      distance: '35px',
      duration: 1000,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'top',
      scale: 0.95,
      opacity: 0,
      rotate: { x: 2 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    // Enhanced Demo section animations with staggered effect
    sr.reveal(demoRef.current, {
      delay: 150,
      distance: '50px',
      duration: 1200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.95,
      opacity: 0,
      rotate: { y: 5, z: 2 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    // Enhanced CTA section animation with ultra-smooth effect
    sr.reveal(ctaRef.current, {
      delay: 300,
      distance: '40px',
      duration: 1200,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      origin: 'bottom',
      scale: 0.95,
      opacity: 0,
      rotate: { y: 3, z: 1 },
      reset: true,
      beforeReveal: (el) => {
        el.style.transform = 'translateY(0) scale(1) rotate(0)';
        el.style.opacity = '1';
        el.style.transition = 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
      }
    });

    return () => {
      sr.destroy();
    };
  }, []);

  const resetDemo = () => {
    setArray([64, 34, 25, 12, 22]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsSorting(false);
    setComparisonCount(0);
    setSwapCount(0);
    setHighlightedIndices([]);
    setGraphNodes(prev => prev.map(node => ({ ...node, visited: false })));
  };

  const resetAlgorithmState = () => {
    setArray([64, 34, 25, 12, 22]);
    setCurrentStep(0);
    setIsPlaying(false);
    setIsSorting(false);
    setComparisonCount(0);
    setSwapCount(0);
    setHighlightedIndices([]);
    setMergeArrays({ left: [], right: [], result: [] });
    setHeapStructure([]);
    setBfsQueue([]);
    setGraphNodes(prev => prev.map(node => ({ ...node, visited: false })));
  };

  const handleAlgorithmChange = (e) => {
    const newAlgorithm = e.target.value;
    setSelectedAlgorithm(newAlgorithm);
    resetAlgorithmState();
  };

  const bubbleSort = async () => {
    if (isSorting) return;
    setIsSorting(true);
    let arr = [...array];
    let n = arr.length;
    let comparisons = 0;
    let swaps = 0;
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 300));

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        setHighlightedIndices([j, j + 1]);
        setComparisonCount(prev => prev + 1);
        comparisons++;
        setCurrentStep(1);
        await new Promise(resolve => setTimeout(resolve, 500));

        if (arr[j] > arr[j + 1]) {
          setSwappingIndices([j, j + 1]);
          setMovingBlocks([
            { value: arr[j], from: j, to: j + 1 },
            { value: arr[j + 1], from: j + 1, to: j }
          ]);
          await new Promise(resolve => setTimeout(resolve, 300));

          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setArray([...arr]);
          setSwapCount(prev => prev + 1);
          swaps++;
          setCurrentStep(2);
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setSwappingIndices([]);
          setMovingBlocks([]);
        }
      }
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setHighlightedIndices([]);
    setCurrentStep(4);
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsSorting(false);
  };

  const quickSort = async (arr, low, high) => {
    if (low < high) {
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 500));
      const pivotIndex = await partition(arr, low, high);
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 800));
      await quickSort(arr, low, pivotIndex - 1);
      await quickSort(arr, pivotIndex + 1, high);
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const partition = async (arr, low, high) => {
    const pivot = arr[high];
    let i = low - 1;
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 500));

    for (let j = low; j < high; j++) {
      setHighlightedIndices([j, high]);
      setComparisonCount(prev => prev + 1);
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        setArray([...arr]);
        setSwapCount(prev => prev + 1);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    setArray([...arr]);
    setSwapCount(prev => prev + 1);
    return i + 1;
  };

  const binarySearch = async () => {
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 500));
    const sortedArray = [...array].sort((a, b) => a - b);
    setArray(sortedArray);
    let left = 0;
    let right = sortedArray.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      setHighlightedIndices([mid]);
      setComparisonCount(prev => prev + 1);
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 800));

      if (sortedArray[mid] === searchValue) {
        setHighlightedIndices([mid]);
        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, 800));
        return mid;
      }

      if (sortedArray[mid] < searchValue) {
        left = mid + 1;
        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        right = mid - 1;
        setCurrentStep(4);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    setHighlightedIndices([]);
    setCurrentStep(5);
    await new Promise(resolve => setTimeout(resolve, 500));
    return -1;
  };

  const dfsTraversal = async (startNode) => {
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 500));
    const visited = new Set();
    const stack = [startNode];

    while (stack.length > 0) {
      const current = stack.pop();
      
      if (!visited.has(current)) {
        visited.add(current);
        setGraphNodes(prev => prev.map(node => 
          node.id === current ? { ...node, visited: true } : node
        ));
        setCurrentStep(1);
        await new Promise(resolve => setTimeout(resolve, 800));

        const neighbors = graphEdges
          .filter(edge => edge.from === current)
          .map(edge => edge.to);
        
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            stack.push(neighbor);
            setCurrentStep(2);
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    setCurrentStep(4);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const mergeSort = async (arr) => {
    if (arr.length <= 1) return arr;
    
    setCurrentStep(0);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mid = Math.floor(arr.length / 2);
    const left = arr.slice(0, mid);
    const right = arr.slice(mid);
    
    // Show the split with highlighted indices
    setHighlightedIndices([...Array(mid).keys()]);
    setMergeArrays({ left, right, result: [] });
    setCurrentStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Clear highlights before recursive calls
    setHighlightedIndices([]);
    const sortedLeft = await mergeSort([...left]);
    setCurrentStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sortedRight = await mergeSort([...right]);
    setCurrentStep(3);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show merging process with step-by-step animations
    const result = await merge([...sortedLeft], [...sortedRight]);
    setMergeArrays(prev => ({ ...prev, result }));
    setCurrentStep(4);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return result;
  };

  const merge = async (left, right) => {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      // Highlight the elements being compared
      setHighlightedIndices([i, j + left.length]);
      setComparisonCount(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (left[i] <= right[j]) {
        result.push(left[i]);
        setMovingBlocks([{ 
          value: left[i], 
          from: 'left', 
          fromIndex: i,
          toIndex: result.length - 1
        }]);
        i++;
      } else {
        result.push(right[j]);
        setMovingBlocks([{ 
          value: right[j], 
          from: 'right', 
          fromIndex: j,
          toIndex: result.length - 1
        }]);
        j++;
      }
      
      // Show the current state of the merged array
      setMergeArrays(prev => ({
        ...prev,
        result: [...result, ...left.slice(i), ...right.slice(j)]
      }));
      await new Promise(resolve => setTimeout(resolve, 800));
      setMovingBlocks([]);
    }
    
    // Add remaining elements
    const remaining = result.concat(left.slice(i), right.slice(j));
    setMergeArrays(prev => ({ ...prev, result: remaining }));
    return remaining;
  };

  const heapSort = async () => {
    setCurrentStep(0);
    setHeapStructure([...array]);
    await buildMaxHeap();
    setCurrentStep(1);
    
    for (let i = array.length - 1; i > 0; i--) {
      // Show root and last element swap
      setSwappingIndices([0, i]);
      setMovingBlocks([
        { value: array[0], from: 0, to: i },
        { value: array[i], from: i, to: 0 }
      ]);
      await new Promise(resolve => setTimeout(resolve, 400));

      [array[0], array[i]] = [array[i], array[0]];
      setArray([...array]);
      setHeapStructure([...array]);
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setSwappingIndices([]);
      setMovingBlocks([]);
      
      await heapify(0, i);
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setCurrentStep(4);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const buildMaxHeap = async () => {
    for (let i = Math.floor(array.length / 2); i >= 0; i--) {
      await heapify(i, array.length);
    }
  };

  const heapify = async (i, size) => {
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    let largest = i;
    
    setHighlightedIndices([i, left, right].filter(x => x < size));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (left < size && array[left] > array[largest]) {
      largest = left;
    }
    
    if (right < size && array[right] > array[largest]) {
      largest = right;
    }
    
    if (largest !== i) {
      // Show swap animation
      setSwappingIndices([i, largest]);
      setMovingBlocks([
        { value: array[i], from: i, to: largest },
        { value: array[largest], from: largest, to: i }
      ]);
      await new Promise(resolve => setTimeout(resolve, 400));

      [array[i], array[largest]] = [array[largest], array[i]];
      setArray([...array]);
      setHeapStructure([...array]);
      setSwapCount(prev => prev + 1);
      await new Promise(resolve => setTimeout(resolve, 400));
      
      setSwappingIndices([]);
      setMovingBlocks([]);
      await heapify(largest, size);
    }
  };

  const bfsTraversal = async (startNode) => {
    setCurrentStep(0);
    const visited = new Set();
    const queue = [startNode];
    setBfsQueue([startNode]);
    
    while (queue.length > 0) {
      const current = queue.shift();
      setBfsQueue(queue);
      
      if (!visited.has(current)) {
        visited.add(current);
        setGraphNodes(prev => prev.map(node => 
          node.id === current ? { ...node, visited: true } : node
        ));
        setCurrentStep(1);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const neighbors = graphEdges
          .filter(edge => edge.from === current)
          .map(edge => edge.to);
        
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push(neighbor);
            setBfsQueue([...queue]);
            setCurrentStep(2);
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        }
        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }
    setBfsQueue([]);
    setCurrentStep(4);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const handlePlayPause = async () => {
    if (!isPlaying) {
      setIsSorting(true);
      setComparisonCount(0);
      setSwapCount(0);
      setHighlightedIndices([]);
      setCurrentStep(0);

      switch (selectedAlgorithm) {
        case 'bubbleSort':
          await bubbleSort();
          break;
        case 'quickSort':
          await quickSort([...array], 0, array.length - 1);
          break;
        case 'mergeSort':
          const sortedArray = await mergeSort([...array]);
          setArray(sortedArray);
          break;
        case 'heapSort':
          await heapSort();
          break;
        case 'binarySearch':
          await binarySearch();
          break;
        case 'dfsTraversal':
          await dfsTraversal(1);
          break;
        case 'bfsTraversal':
          await bfsTraversal(1);
          break;
        default:
          break;
      }
      setIsSorting(false);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <section ref={sectionRef} className="relative py-20 bg-gradient-to-b from-navy-950 to-navy-900">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-16">
          <motion.div
            ref={badgeRef}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-blue-500/20 mb-8 interactive-element group relative overflow-hidden"
            style={{
              background: "rgba(15, 23, 42, 0.3)",
              backdropFilter: "blur(10px)",
              transform: `perspective(1000px) rotateX(${tagRotation.x}deg) rotateY(${tagRotation.y}deg)`,
              transformStyle: "preserve-3d"
            }}
            onMouseMove={handleTagMouseMove}
            onMouseLeave={handleTagMouseLeave}
            whileHover={{
              borderColor: "rgba(124, 124, 243, 0.4)",
              boxShadow: "0 0 30px rgba(124, 124, 243, 0.2)",
              background: "rgba(15, 23, 42, 0.4)",
              transition: { 
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 1
              }
            }}
          >
            {/* Interactive Border Container */}
            <div className="absolute inset-0 rounded-full pointer-events-none">
              {/* Base Border */}
              <div className="absolute inset-0 rounded-full" />
              
              {/* Interactive Border Glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid transparent',
                  background: 'transparent',
                  maskImage: `
                    radial-gradient(
                      200px circle at ${tagMousePosition.x}px ${tagMousePosition.y}px,
                      black 20%,
                      transparent 80%
                    )
                  `,
                  WebkitMaskImage: `
                    radial-gradient(
                      200px circle at ${tagMousePosition.x}px ${tagMousePosition.y}px,
                      black 20%,
                      transparent 80%
                    )
                  `,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div 
                  className="absolute inset-0 rounded-full border border-blue-400/50"
                  style={{
                    boxShadow: '0 0 15px rgba(124, 124, 243, 0.3)',
                    opacity: 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              </motion.div>
            </div>

            {/* Enhanced Background Effects */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100"
              style={{
                background: `radial-gradient(circle at ${tagMousePosition.x}px ${tagMousePosition.y}px, rgba(124, 124, 243, 0.15), transparent 70%)`,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              animate={{
                background: [
                  `radial-gradient(circle at ${tagMousePosition.x}px ${tagMousePosition.y}px, rgba(124, 124, 243, 0.15), transparent 70%)`,
                  `radial-gradient(circle at ${tagMousePosition.x}px ${tagMousePosition.y}px, rgba(124, 124, 243, 0.2), transparent 70%)`,
                  `radial-gradient(circle at ${tagMousePosition.x}px ${tagMousePosition.y}px, rgba(124, 124, 243, 0.15), transparent 70%)`
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Enhanced Neural Network Pattern */}
            <motion.div 
              className="absolute inset-0 opacity-0 group-hover:opacity-[0.05]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(124, 124, 243, 0.4) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(124, 124, 243, 0.4) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                transform: `translateZ(-1px) rotateX(${tagRotation.x * 0.5}deg) rotateY(${tagRotation.y * 0.5}deg)`,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
              animate={{
                backgroundPosition: [
                  "0px 0px",
                  "10px 10px",
                  "0px 0px"
                ]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Enhanced Floating Particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full opacity-0 group-hover:opacity-100"
                style={{
                  width: `${Math.random() * 2 + 1}px`,
                  height: `${Math.random() * 2 + 1}px`,
                  background: `rgba(124, 124, 243, ${Math.random() * 0.2 + 0.1})`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  willChange: "transform",
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: `translateZ(${Math.random() * 20}px) rotateX(${tagRotation.x * 0.3}deg) rotateY(${tagRotation.y * 0.3}deg)`
                }}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1],
                  delay: i * 0.4,
                }}
              />
            ))}

            {/* Enhanced Content */}
            <div 
              className="relative flex items-center gap-3"
              style={{
                transform: `translateZ(20px) rotateX(${tagRotation.x * 0.2}deg) rotateY(${tagRotation.y * 0.2}deg)`,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 6, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }
                }}
                whileHover={{
                  rotate: 180,
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    mass: 0.8
                  }
                }}
                style={{
                  transform: `translateZ(30px) rotateX(${tagRotation.x * 0.3}deg) rotateY(${tagRotation.y * 0.3}deg)`,
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                }}
              >
                <Code className="w-5 h-5 text-blue-400" />
              </motion.div>

              <motion.span 
                className="text-sm font-medium text-slate-300 group-hover:text-blue-300"
                style={{
                  transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  transform: `translateZ(25px) rotateX(${tagRotation.x * 0.2}deg) rotateY(${tagRotation.y * 0.2}deg)`
                }}
                animate={{
                  textShadow: [
                    "0 0 0px rgba(124, 124, 243, 0)",
                    "0 0 10px rgba(124, 124, 243, 0.3)",
                    "0 0 0px rgba(124, 124, 243, 0)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1]
                }}
                whileHover={{
                  textShadow: "0 0 15px rgba(124, 124, 243, 0.5)",
                  transition: { 
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    mass: 0.8
                  }
                }}
              >
                Interactive Demo
              </motion.span>
            </div>

            {/* Enhanced Hover Effect Border */}
            <motion.div
              className="absolute inset-0 rounded-full border border-blue-400/0"
              style={{
                backgroundColor: "rgba(124, 124, 243, 0)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translateZ(10px) rotateX(${tagRotation.x * 0.1}deg) rotateY(${tagRotation.y * 0.1}deg)`
              }}
              whileHover={{
                backgroundColor: "rgba(124, 124, 243, 0.1)",
                borderColor: "rgba(124, 124, 243, 0.3)",
                boxShadow: "0 0 30px rgba(124, 124, 243, 0.3)",
                scale: 1.05,
                transition: { 
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 1
                }
              }}
            />

            {/* Enhanced Hover Glow Effect */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0"
              style={{
                backgroundColor: "rgba(124, 124, 243, 0)",
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: `translateZ(5px) rotateX(${tagRotation.x * 0.05}deg) rotateY(${tagRotation.y * 0.05}deg)`
              }}
              whileHover={{
                opacity: 0.1,
                backgroundColor: "rgba(124, 124, 243, 0.5)",
                transition: { 
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 1
                }
              }}
            />
          </motion.div>

          <h2 ref={titleRef} className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            <motion.span 
              className="relative inline-block text-slate-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              style={{ 
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            >
              <span className="relative z-10">Try It</span>
            </motion.span>

            <br />

            <motion.span 
              className="relative inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              style={{ 
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
            >
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-navy-400 via-navy-300 to-navy-400">
                Interactive Demo
              </span>
            </motion.span>
          </h2>

          <motion.p 
            ref={descriptionRef} 
            className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{ willChange: 'transform, opacity' }}
          >
            Experience our interactive learning platform firsthand. Try our demo and see how we make learning to code engaging and effective.
          </motion.p>
        </div>

        {/* Demo Interface */}
        <div ref={demoRef} className="max-w-6xl mx-auto">
          <motion.div
            whileHover={{ y: -3 }}
            className="code-block rounded-3xl overflow-hidden interactive-card"
            style={{
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
              transition: "all 0.3s ease-in-out"
            }}
          >
            {/* Professional Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <span className="font-medium text-slate-300">CodeStream Interactive Demo</span>
              </div>
              
              <div className="flex items-center gap-3">
                <select 
                  value={selectedAlgorithm}
                  onChange={handleAlgorithmChange}
                  className="bg-slate-800/50 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-blue-500 focus:outline-none interactive-element backdrop-blur-sm"
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    transition: "all 0.3s ease-in-out"
                  }}
                >
                  {algorithms.map((algo) => (
                    <option key={algo.id} value={algo.id} className="bg-slate-800">
                      {algo.name} - {algo.complexity}
                    </option>
                  ))}
                </select>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 glass-pro border border-blue-500/30 rounded-lg hover:border-blue-500 transition-all duration-300 interactive-element"
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    transition: "all 0.3s ease-in-out"
                  }}
                >
                  <Settings className="w-4 h-4 text-blue-400" />
                </motion.button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2">
              {/* Code Editor Panel */}
              <div className="p-6 border-r border-slate-700/50">
                <div className="flex items-center gap-3 mb-6">
                  <Code className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-slate-300">Algorithm Implementation</span>
                </div>
                
                <div className="code-block p-4 bg-slate-900/70 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                    transition: "all 0.3s ease-in-out"
                  }}
                >
                  <div className="font-code text-sm space-y-2">
                    {algorithmCode[selectedAlgorithm].map((line, index) => (
                      <motion.div
                        key={index}
                        className="flex group"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className="text-slate-500 w-8 text-right mr-4 select-none text-xs">
                          {index + 1}
                        </span>
                        <span className="text-slate-300 group-hover:text-slate-100 transition-colors duration-200">
                          {line}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Professional Control Panel */}
                <div ref={controlsRef} className="flex items-center gap-3 mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePlayPause}
                    className="flex items-center gap-2 btn-primary px-6 py-3 rounded-lg font-medium interactive-element"
                    style={{
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(59, 130, 246, 0.3)",
                      boxShadow: "0 0 20px rgba(59, 130, 246, 0.1)",
                      transition: "all 0.3s ease-in-out"
                    }}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? 'Pause' : 'Execute'}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetDemo}
                    className="p-3 glass-pro border border-slate-600 rounded-lg hover:border-slate-500 transition-all duration-300 interactive-element"
                    style={{
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      transition: "all 0.3s ease-in-out"
                    }}
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                  </motion.button>

                  <div className="flex items-center gap-2 ml-4">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-soft"></div>
                    <span className="text-sm text-slate-400">Ready to execute</span>
                  </div>
                </div>
              </div>

              {/* Visualization Panel */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-slate-300">Live Visualization</span>
                </div>

                {/* Update the visualization containers with glass effect */}
                <div className="code-block p-6 bg-slate-900/70 mb-6 rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                    transition: "all 0.3s ease-in-out"
                  }}
                >
                {selectedAlgorithm === 'dfsTraversal' || selectedAlgorithm === 'bfsTraversal' ? (
                    <div className="relative h-64 flex items-center justify-center">
                      {/* Draw edges */}
                      {graphEdges.map((edge, index) => {
                        const fromNode = graphNodes.find(n => n.id === edge.from);
                        const toNode = graphNodes.find(n => n.id === edge.to);
                        const isActive = fromNode.visited && toNode.visited;
                        
                        return (
                          <motion.div
                            key={index}
                            className="absolute h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500"
                            style={{
                              width: '100px',
                              transform: `rotate(${Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x)}rad)`,
                              left: '50%',
                              top: '50%',
                              transformOrigin: 'left center'
                            }}
                            animate={{
                              opacity: isActive ? 1 : 0.3,
                              scale: isActive ? 1.1 : 1
                            }}
                            transition={{ duration: 0.5 }}
                          />
                        );
                      })}
                      
                      {/* Draw nodes */}
                      {graphNodes.map((node) => (
                        <motion.div
                          key={node.id}
                          className={`absolute w-12 h-12 rounded-full flex items-center justify-center font-medium transition-all duration-500 ${
                            node.visited
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-gradient-to-r from-blue-500 to-blue-400 text-white'
                          }`}
                          style={{
                            left: `calc(50% + ${node.x}px)`,
                            top: `calc(50% + ${node.y}px)`,
                            transform: 'translate(-50%, -50%)'
                          }}
                          animate={{
                            scale: node.visited ? [1, 1.2, 1] : 1,
                            boxShadow: node.visited ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {node.value}
                        </motion.div>
                      ))}

                      {/* BFS Queue Visualization */}
                      {selectedAlgorithm === 'bfsTraversal' && (
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 p-2">
                          {bfsQueue.map((nodeId, index) => (
                            <motion.div
                              key={index}
                              className="w-8 h-8 rounded-full bg-blue-500/50 flex items-center justify-center text-white text-xs"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              {graphNodes.find(n => n.id === nodeId)?.value}
                            </motion.div>
                          ))}
                        </div>
                      )}
                  </div>
                ) : selectedAlgorithm === 'mergeSort' ? (
                    <div className="space-y-6">
                      {/* Original Array */}
                      <div>
                        <div className="text-xs text-slate-400 mb-2">Original Array</div>
                        <div className="flex gap-2 justify-center">
                          {array.map((value, index) => (
                            <motion.div
                              key={`original-${value}-${index}`}
                              layoutId={`merge-block-${value}-${index}`}
                              className={`w-12 h-12 rounded-lg flex items-center justify-center text-slate-300 transition-all duration-300 ${
                                highlightedIndices.includes(index)
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                                  : 'bg-gradient-to-r from-blue-500/20 to-blue-400/20'
                              }`}
                              animate={{
                                scale: highlightedIndices.includes(index) ? 1.1 : 1,
                                y: highlightedIndices.includes(index) ? -5 : 0
                              }}
                            >
                              {value}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Split Arrays */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-xs text-slate-400 mb-2">Left Array</div>
                          <div className="flex gap-2 justify-center">
                            {mergeArrays.left.map((value, index) => (
                              <motion.div
                                key={`left-${value}-${index}`}
                                layoutId={`merge-block-${value}-${index}`}
                                className={`w-12 h-12 rounded-lg flex items-center justify-center text-slate-300 transition-all duration-300 ${
                                  highlightedIndices.includes(index)
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-gradient-to-r from-blue-500/20 to-blue-400/20'
                                }`}
                                animate={{
                                  scale: highlightedIndices.includes(index) ? 1.1 : 1,
                                  y: highlightedIndices.includes(index) ? -5 : 0
                                }}
                              >
                                {value}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 mb-2">Right Array</div>
                          <div className="flex gap-2 justify-center">
                            {mergeArrays.right.map((value, index) => (
                              <motion.div
                                key={`right-${value}-${index}`}
                                layoutId={`merge-block-${value}-${index + mergeArrays.left.length}`}
                                className={`w-12 h-12 rounded-lg flex items-center justify-center text-slate-300 transition-all duration-300 ${
                                  highlightedIndices.includes(index + mergeArrays.left.length)
                                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-gradient-to-r from-blue-500/20 to-blue-400/20'
                                }`}
                                animate={{
                                  scale: highlightedIndices.includes(index + mergeArrays.left.length) ? 1.1 : 1,
                                  y: highlightedIndices.includes(index + mergeArrays.left.length) ? -5 : 0
                                }}
                              >
                                {value}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Merged Result */}
                      <div>
                        <div className="text-xs text-slate-400 mb-2">Merged Result</div>
                        <div className="flex gap-2 justify-center">
                          {mergeArrays.result.map((value, index) => (
                            <motion.div
                              key={`result-${value}-${index}`}
                              layoutId={`merge-block-${value}-${index}`}
                              className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500/20 to-emerald-400/20 flex items-center justify-center text-slate-300"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              {value}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Moving Block Animation */}
                      {movingBlocks.map((block, index) => (
                        <motion.div
                          key={`moving-merge-${block.value}-${index}`}
                          layoutId={`merge-block-${block.value}-${block.from === 'left' ? block.fromIndex : block.fromIndex + mergeArrays.left.length}`}
                          className="w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"
                          animate={{
                            scale: [1, 1.2, 1],
                            y: [0, -20, 0]
                          }}
                          transition={{
                            duration: 0.8,
                            ease: "easeInOut"
                          }}
                        >
                          {block.value}
                        </motion.div>
                      ))}

                      {/* Step Explanation */}
                      <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <div className="text-sm text-slate-300">
                          {currentStep === 0 && "Starting Merge Sort: Dividing the array into two halves"}
                          {currentStep === 1 && "Split: Array divided into left and right subarrays"}
                          {currentStep === 2 && "Sorting: Recursively sorting the left subarray"}
                          {currentStep === 3 && "Sorting: Recursively sorting the right subarray"}
                          {currentStep === 4 && "Merging: Combining sorted subarrays in order"}
                      </div>
                    </div>
                  </div>
                ) : selectedAlgorithm === 'heapSort' ? (
                    <div className="flex flex-col items-center">
                      {/* Heap Structure */}
                      <div className="relative w-full h-48">
                        {heapStructure.map((node, index) => {
                          const level = Math.floor(Math.log2(index + 1));
                          const nodesInLevel = Math.pow(2, level);
                          const position = index - (Math.pow(2, level) - 1);
                          const x = (position / (nodesInLevel - 1)) * 100;
                          const y = level * 60;

                          return (
                            <motion.div
                              key={index}
                              className={`absolute w-12 h-12 rounded-lg flex items-center justify-center font-medium ${
                                highlightedIndices.includes(index)
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                                  : 'bg-gradient-to-r from-blue-500 to-blue-400 text-white'
                              }`}
                              style={{
                                left: `${x}%`,
                                top: `${y}px`,
                                transform: 'translate(-50%, -50%)'
                              }}
                              animate={{
                                scale: highlightedIndices.includes(index) ? [1, 1.1, 1] : 1
                              }}
                            >
                              {node}
                            </motion.div>
                          );
                        })}

                        {/* Heap Edges */}
                        {heapStructure.map((_, index) => {
                          const leftChild = 2 * index + 1;
                          const rightChild = 2 * index + 2;
                          if (leftChild < heapStructure.length || rightChild < heapStructure.length) {
                            return (
                              <svg
                                key={`edges-${index}`}
                                className="absolute top-0 left-0 w-full h-full"
                                style={{ pointerEvents: 'none' }}
                              >
                                {leftChild < heapStructure.length && (
                                  <motion.line
                                    x1={`${(index - (Math.pow(2, Math.floor(Math.log2(index + 1))) - 1)) / (Math.pow(2, Math.floor(Math.log2(index + 1))) - 1) * 100}%`}
                                    y1={`${Math.floor(Math.log2(index + 1)) * 60}px`}
                                    x2={`${(leftChild - (Math.pow(2, Math.floor(Math.log2(leftChild + 1))) - 1)) / (Math.pow(2, Math.floor(Math.log2(leftChild + 1))) - 1) * 100}%`}
                                    y2={`${Math.floor(Math.log2(leftChild + 1)) * 60}px`}
                                    stroke="rgba(59, 130, 246, 0.5)"
                                    strokeWidth="2"
                                    animate={{
                                      opacity: highlightedIndices.includes(index) && highlightedIndices.includes(leftChild) ? 1 : 0.3
                                    }}
                                  />
                                )}
                                {rightChild < heapStructure.length && (
                                  <motion.line
                                    x1={`${(index - (Math.pow(2, Math.floor(Math.log2(index + 1))) - 1)) / (Math.pow(2, Math.floor(Math.log2(index + 1))) - 1) * 100}%`}
                                    y1={`${Math.floor(Math.log2(index + 1)) * 60}px`}
                                    x2={`${(rightChild - (Math.pow(2, Math.floor(Math.log2(rightChild + 1))) - 1)) / (Math.pow(2, Math.floor(Math.log2(rightChild + 1))) - 1) * 100}%`}
                                    y2={`${Math.floor(Math.log2(rightChild + 1)) * 60}px`}
                                    stroke="rgba(59, 130, 246, 0.5)"
                                    strokeWidth="2"
                                    animate={{
                                      opacity: highlightedIndices.includes(index) && highlightedIndices.includes(rightChild) ? 1 : 0.3
                                    }}
                                  />
                                )}
                              </svg>
                            );
                          }
                          return null;
                        })}

                        {/* Moving Blocks Animation */}
                        {movingBlocks.map((block, index) => {
                          const level = Math.floor(Math.log2(block.from + 1));
                          const nodesInLevel = Math.pow(2, level);
                          const position = block.from - (Math.pow(2, level) - 1);
                          const x = (position / (nodesInLevel - 1)) * 100;
                          const y = level * 60;

                          return (
                            <motion.div
                              key={`moving-heap-${block.value}-${index}`}
                              layoutId={`heap-block-${block.value}-${block.from}`}
                              className="absolute w-12 h-12 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"
                              style={{
                                left: `${x}%`,
                                top: `${y}px`,
                                transform: 'translate(-50%, -50%)'
                              }}
                              animate={{
                                scale: [1, 1.2, 1],
                                y: [0, -20, 0]
                              }}
                              transition={{
                                duration: 0.8,
                                ease: "easeInOut"
                              }}
                            >
                              {block.value}
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Array Visualization */}
                    <div className="code-block p-6 bg-slate-900/70 mb-6">
                      <div className="text-xs text-slate-500 mb-4 text-center">
                        {selectedAlgorithm === 'binarySearch' ? 'Searching for: ' + searchValue : 'Array Elements'}
                      </div>
                      <div className="flex gap-3 justify-center items-end h-32 relative">
                        {array.map((value, index) => (
                          <motion.div
                            key={index}
                            className="flex flex-col items-center interactive-element"
                            whileHover={{ scale: 1.05 }}
                            animate={{
                              scale: highlightedIndices.includes(index) ? [1, 1.1, 1] : 1,
                            }}
                            transition={{ duration: 0.5, repeat: highlightedIndices.includes(index) ? 3 : 0 }}
                          >
                            <motion.div
                              className="text-xs text-slate-400 mb-2 font-code"
                              animate={{
                                color: highlightedIndices.includes(index) ? '#10B981' : '#94A3B8'
                              }}
                            >
                              {value}
                            </motion.div>
                            <motion.div
                              className={`w-12 rounded-t transition-all duration-500 ${
                                highlightedIndices.includes(index)
                                  ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/20'
                                  : 'bg-gradient-to-t from-blue-500 to-blue-400'
                              }`}
                              style={{ height: `${value + 20}px` }}
                              animate={{
                                height: `${value + 20}px`,
                                boxShadow: highlightedIndices.includes(index) 
                                  ? '0 0 20px rgba(16, 185, 129, 0.3)' 
                                  : 'none'
                              }}
                              layout
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                </div>

                {/* Step Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-400">
                      Step {currentStep + 1} of {demoSteps[selectedAlgorithm].length}
                    </span>
                    <span className="text-xs text-slate-500">
                      {Math.round(((currentStep + 1) / demoSteps[selectedAlgorithm].length) * 100)}% Complete
                    </span>
                  </div>
                  
                  <motion.div
                    className="glass-pro p-4 rounded-xl border border-slate-700/50"
                    style={{
                      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.4))",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.05)",
                      transition: "all 0.3s ease-in-out"
                    }}
                    animate={{
                      borderColor: activeOperation ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.1)'
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.p
                      key={currentStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-slate-300 leading-relaxed"
                    >
                      {demoSteps[selectedAlgorithm][currentStep]}
                    </motion.p>
                  </motion.div>

                  {/* Stats Display */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span>Comparisons:</span>
                        <motion.span
                          key={comparisonCount}
                          initial={{ scale: 1.2, color: "#22D3EE" }}
                          animate={{ scale: 1, color: "#7C7CF3" }}
                          transition={{ duration: 0.3 }}
                          className="font-mono"
                        >
                          {comparisonCount}
                        </motion.span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Swaps:</span>
                        <motion.span
                          key={swapCount}
                          initial={{ scale: 1.2, color: "#22D3EE" }}
                          animate={{ scale: 1, color: "#7C7CF3" }}
                          transition={{ duration: 0.3 }}
                          className="font-mono"
                        >
                          {swapCount}
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                      style={{ width: `${((currentStep + 1) / demoSteps[selectedAlgorithm].length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <div ref={ctaRef} className="text-center mt-16">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary px-8 py-4 rounded-xl font-semibold interactive-element"
          >
            Access Full Interactive Platform
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;