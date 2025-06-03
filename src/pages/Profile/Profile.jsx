import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  User,
  Mail,
  Calendar,
  MapPin,
  Github,
  Linkedin,
  Twitter,
  Code2,
  Trophy,
  BookOpen,
  Star,
  Clock,
  Award,
  ChevronRight,
  Settings,
  Edit,
  Check,
  Shield,
  Bell,
  Heart,
  Zap,
  Sparkles,
  Activity,
  Target,
  BarChart2,
  Languages,
  Palette,
  Key,
  Lock,
  Eye,
  EyeOff,
  Globe,
  Bookmark,
  History,
  TrendingUp,
  Users,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Minus,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Share2,
  Copy,
  ExternalLink,
  HelpCircle,
  Info,
  Filter,
  LogOut,
  GripVertical,
  Pause,
  Play,
  Video,
  File,
  Book,
  Code,
  Sun,
  Moon,
  Search,
  ChevronLeft,
  X,
  Monitor,
  ShieldOff,
  Tags,
  Loader2,
  RotateCcw
} from 'lucide-react';
import axiosInstance from '../../utils/axios';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal/Modal';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';
import { debounce } from 'lodash';

// Update shimmer animation keyframes
const shimmerAnimation = {
  '0%': {
    backgroundPosition: '-1000px 0',
  },
  '100%': {
    backgroundPosition: '1000px 0',
  },
};

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Add loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Profile picture states
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profileImageLoaded, setProfileImageLoaded] = useState(false);

  const [activeTab, setActiveTab] = useState('settings');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    achievements: true,
    mentions: true,
    updates: false
  });

   // Add debounced navigation
   const debouncedNavigate = useMemo(
    () => debounce((path, options) => {
      navigate(path, options);
    }, 300),
    [navigate]
  );

  // 2FA states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationDigits, setVerificationDigits] = useState(['', '', '', '', '', '']);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
  const [isGeneratingRecoveryCodes, setIsGeneratingRecoveryCodes] = useState(false);
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);
  const [twoFAError, setTwoFAError] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState(null);

  // Add these new state variables after the existing ones
  const [dashboardLayout, setDashboardLayout] = useState({
    overview: true,
    achievements: true,
    activity: true,
    stats: true,
    snippets: true,
    learning: true
  });

  const [codeSnippets, setCodeSnippets] = useState([]);
  const [learningGoals, setLearningGoals] = useState([]);
  const [productivityStats, setProductivityStats] = useState({
    dailyGoal: 5,
    weeklyGoal: 25,
    monthlyGoal: 100,
    streak: 0,
    lastActive: new Date()
  });

  // Add these new state variables after the existing ones
  const [layoutOrder, setLayoutOrder] = useLocalStorage('dashboardLayoutOrder', [
    'overview',
    'achievements',
    'activity',
    'stats',
    'snippets',
    'learning'
  ]);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      if (response.data.success) {
        const userData = response.data.data.user;
        updateUserProfile(userData);
        setBio(userData.bio || '');
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const fetchActivities = async () => {
    try {
      // Simulate API call with mock data
      const mockActivitiesData = [
        { id: 1, date: new Date().toISOString(), category: 'coding' },
        { id: 2, date: new Date().toISOString(), category: 'meeting' },
        { id: 3, date: new Date().toISOString(), category: 'coding' }
      ];
      setActivities(mockActivitiesData);

      // Calculate activity statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const stats = {
        totalActivities: mockActivitiesData.length,
        todayActivities: mockActivitiesData.filter(a => new Date(a.date) >= today).length,
        thisWeekActivities: mockActivitiesData.filter(a => new Date(a.date) >= weekAgo).length,
        byCategory: mockActivitiesData.reduce((acc, activity) => {
          acc[activity.category] = (acc[activity.category] || 0) + 1;
          return acc;
        }, {})
      };

      setActivityStats(stats);
      return mockActivitiesData;
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]); // Set activities to empty array on error
      setActivityStats({
        totalActivities: 0,
        todayActivities: 0,
        thisWeekActivities: 0,
        byCategory: {}
      });
      toast.error('Failed to load activities. Please try again later.');
      return null;
    }
  };

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      setSessionError(null);

      const response = await axiosInstance.get('/api/auth/sessions');
      if (response.data.success) {
        const sessionsData = response.data.data.sessions;
        setSessions(sessionsData);
        return sessionsData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessionError(error.response?.data?.error || 'Failed to fetch sessions');
      setSessions([]);
      return null;
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Add useEffect to initialize bio from user data
  useEffect(() => {
    if (user?.bio) {
      setBio(user.bio);
    }
  }, [user?.bio]);

  const [showLayoutPreview, setShowLayoutPreview] = useState(false);

  const { theme, updateTheme, resetTheme } = useTheme();

  // Add these state variables after other state declarations
  const [showAddSnippet, setShowAddSnippet] = useState(false);
  const [showEditSnippet, setShowEditSnippet] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [snippetForm, setSnippetForm] = useState({
    title: '',
    code: '',
    language: 'javascript',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

  // Add these state variables after other state declarations
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    target: 0,
    deadline: '',
    status: 'in-progress'
  });

  const [focusMode, setFocusMode] = useState({
    isActive: false,
    timeRemaining: 25 * 60, // 25 minutes in seconds
    isBreak: false,
    completedSessions: 0,
    totalFocusTime: 0
  });

  const [focusStats, setFocusStats] = useState({
    dailyFocus: 0,
    weeklyFocus: 0,
    monthlyFocus: 0,
    streak: 0,
    lastFocusDate: null
  });

  const [learningPaths, setLearningPaths] = useState([
    {
      id: 1,
      title: 'Full Stack Development',
      description: 'Master the complete web development stack',
      progress: 65,
      skills: [
        { name: 'HTML/CSS', level: 'Advanced', progress: 90 },
        { name: 'JavaScript', level: 'Advanced', progress: 85 },
        { name: 'React', level: 'Intermediate', progress: 70 },
        { name: 'Node.js', level: 'Intermediate', progress: 60 },
        { name: 'Database', level: 'Beginner', progress: 40 }
      ],
      nextMilestone: 'Build a full-stack application with authentication',
      estimatedCompletion: '2 months'
    },
    {
      id: 2,
      title: 'Data Structures & Algorithms',
      description: 'Master fundamental computer science concepts',
      progress: 30,
      skills: [
        { name: 'Arrays & Strings', level: 'Advanced', progress: 90 },
        { name: 'Linked Lists', level: 'Intermediate', progress: 70 },
        { name: 'Trees & Graphs', level: 'Beginner', progress: 40 },
        { name: 'Dynamic Programming', level: 'Beginner', progress: 20 }
      ],
      nextMilestone: 'Complete 50 LeetCode problems',
      estimatedCompletion: '3 months'
    }
  ]);

  const [resourceLibrary, setResourceLibrary] = useState({
    Tutorials: [
      {
        id: 1,
        title: 'React Hooks Tutorial',
        type: 'video',
        url: 'https://example.com/react-hooks',
        status: 'completed',
        createdAt: '2024-03-15T10:00:00Z'
      },
      {
        id: 2,
        title: 'TypeScript Basics',
        type: 'article',
        url: 'https://example.com/typescript',
        status: 'in-progress',
        createdAt: '2024-03-16T14:30:00Z'
      }
    ],
    Documentation: [
      {
        id: 3,
        title: 'React Documentation',
        type: 'docs',
        url: 'https://reactjs.org/docs',
        status: 'bookmarked',
        createdAt: '2024-03-17T09:15:00Z'
      }
    ],
    Projects: [
      {
        id: 4,
        title: 'Full Stack Todo App',
        type: 'project',
        url: 'https://github.com/example/todo-app',
        status: 'planned',
        createdAt: '2024-03-18T16:45:00Z'
      }
    ]
  });

  // Add these state variables after other state declarations
  const [showAddResource, setShowAddResource] = useState(false);
  const [showAddPath, setShowAddPath] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'article',
    url: '',
    category: 'Tutorials',
    status: 'planned'
  });
  const [pathForm, setPathForm] = useState({
    title: '',
    description: '',
    skills: [],
    nextMilestone: '',
    estimatedCompletion: ''
  });

  const [resourceSearch, setResourceSearch] = useState('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState('');
  const [resourceStatusFilter, setResourceStatusFilter] = useState('');
  const [showEditResource, setShowEditResource] = useState(false);
  const [editResourceForm, setEditResourceForm] = useState({
    title: '',
    type: 'article',
    url: '',
    status: 'planned'
  });

  // Add these new state variables after other state declarations
  const [learningCalendar, setLearningCalendar] = useState({
    events: [],
    selectedDate: new Date(),
    view: 'week' // 'day', 'week', 'month'
  });

  const [skillTree, setSkillTree] = useState({
    nodes: [],
    connections: []
  });

  const [learningMilestones, setLearningMilestones] = useState([]);

  const [learningStats, setLearningStats] = useState({
    totalHours: 0,
    streak: 0,
    completedPaths: 0,
    activePaths: 0,
    skillsMastered: 0,
    lastFocusDate: new Date().toISOString()
  });

  // Add these state variables after other state declarations
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    type: 'learning'
  });
  const [skillForm, setSkillForm] = useState({
    name: '',
    category: '',
    level: 'Beginner',
    progress: 0,
    prerequisites: []
  });
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    targetDate: '',
    status: 'pending',
    associatedPath: ''
  });

  const [achievements, setAchievements] = useState([
    {
      id: 1,
      title: "Algorithm Master",
      description: "Completed all advanced algorithm challenges",
      icon: Award,
      color: "text-blue-400",
      progress: 100,
      date: "2024-03-15",
      category: "algorithms",
      badge: "gold"
    },
    {
      id: 2,
      title: "Speed Demon",
      description: "Solved problems with 100% efficiency",
      icon: Zap,
      color: "text-emerald-400",
      progress: 85,
      date: "2024-03-14",
      category: "efficiency",
      badge: "silver"
    },
    {
      id: 3,
      title: "Community Star",
      description: "Helped 100+ community members",
      icon: Star,
      color: "text-purple-400",
      progress: 75,
      date: "2024-03-13",
      category: "community",
      badge: "bronze"
    },
    {
      id: 4,
      title: "Language Expert",
      description: "Mastered 5+ programming languages",
      icon: Languages,
      color: "text-rose-400",
      progress: 60,
      date: "2024-03-12",
      category: "languages",
      badge: "gold"
    }
  ]);

  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [achievementFilter, setAchievementFilter] = useState('all');
  const [achievementSort, setAchievementSort] = useState('date');
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    category: 'algorithms',
    badge: 'bronze',
    progress: 0
  });

  const achievementCategories = [
    { id: 'all', label: 'All Categories' },
    { id: 'algorithms', label: 'Algorithms' },
    { id: 'efficiency', label: 'Efficiency' },
    { id: 'community', label: 'Community' },
    { id: 'languages', label: 'Languages' }
  ];

  const achievementBadges = [
    { id: 'bronze', label: 'Bronze', color: 'text-amber-600' },
    { id: 'silver', label: 'Silver', color: 'text-gray-400' },
    { id: 'gold', label: 'Gold', color: 'text-yellow-400' }
  ];

  const handleAddAchievement = () => {
    const newId = Math.max(...achievements.map(a => a.id), 0) + 1;
    const achievement = {
      ...newAchievement,
      id: newId,
      date: new Date().toISOString().split('T')[0],
      icon: Award,
      color: achievementBadges.find(b => b.id === newAchievement.badge)?.color || 'text-blue-400'
    };
    setAchievements([...achievements, achievement]);
    setShowAchievementModal(false);
    setNewAchievement({
      title: '',
      description: '',
      category: 'algorithms',
      badge: 'bronze',
      progress: 0
    });
  };

  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setNewAchievement({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      badge: achievement.badge,
      progress: achievement.progress
    });
    setShowAchievementModal(true);
  };

  const handleUpdateAchievement = () => {
    setAchievements(achievements.map(a => 
      a.id === editingAchievement.id 
        ? {
            ...a,
            ...newAchievement,
            color: achievementBadges.find(b => b.id === newAchievement.badge)?.color || a.color
          }
        : a
    ));
    setShowAchievementModal(false);
    setEditingAchievement(null);
    setNewAchievement({
      title: '',
      description: '',
      category: 'algorithms',
      badge: 'bronze',
      progress: 0
    });
  };

  const handleDeleteAchievement = (id) => {
    setAchievements(achievements.filter(a => a.id !== id));
  };

  const filteredAchievements = achievements
    .filter(a => achievementFilter === 'all' || a.category === achievementFilter)
    .sort((a, b) => {
      if (achievementSort === 'date') {
        return new Date(b.date) - new Date(a.date);
      }
      if (achievementSort === 'progress') {
        return b.progress - a.progress;
      }
      return a.title.localeCompare(b.title);
    });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check 2FA status
  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/2fa/status');
        if (response.data.success) {
          setIs2FAEnabled(response.data.data.isEnabled);
        }
      } catch (error) {
        console.error('Failed to check 2FA status:', error);
      }
    };

    check2FAStatus();
  }, [user]); // Add user as a dependency

  // Add this after other useEffect hooks
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoadingSessions(true);
        setSessionError(null);
        const response = await axiosInstance.get('/api/auth/sessions');
        if (response.data.success) {
          setSessions(response.data.data);
        }
      } catch (error) {
        setSessionError(error.response?.data?.message || 'Failed to fetch sessions');
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  // Add this to the useEffect hooks section
  useEffect(() => {
    // Load saved layout from localStorage
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      setDashboardLayout(JSON.parse(savedLayout));
    }
  }, []);

  // Update shimmer styles with more sophisticated gradient
const shimmerStyles = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0) 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite'
};

// Update global styles
const globalStyles = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

// Add keyframes to the global styles
useEffect(() => {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);
  return () => {
    document.head.removeChild(styleSheet);
  };
}, []);

  useEffect(() => {
    let timer;
    if (focusMode.isActive && focusMode.timeRemaining > 0) {
      timer = setInterval(() => {
        setFocusMode(prev => {
          if (prev.timeRemaining <= 1) {
            // Session completed
            const newCompletedSessions = prev.completedSessions + 1;
            const newTotalFocusTime = prev.totalFocusTime + (prev.isBreak ? 0 : 25);
            
            // Update focus stats
            setFocusStats(prevStats => ({
              ...prevStats,
              dailyFocus: prevStats.dailyFocus + (prev.isBreak ? 0 : 25),
              weeklyFocus: prevStats.weeklyFocus + (prev.isBreak ? 0 : 25),
              monthlyFocus: prevStats.monthlyFocus + (prev.isBreak ? 0 : 25)
            }));

            // Play notification sound
            new Audio('/notification.mp3').play().catch(() => {});

            return {
              ...prev,
              isActive: false,
              isBreak: !prev.isBreak,
              timeRemaining: prev.isBreak ? 25 * 60 : 5 * 60,
              completedSessions: newCompletedSessions,
              totalFocusTime: newTotalFocusTime
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [focusMode.isActive, focusMode.timeRemaining]);

  const toggleFocusMode = () => {
    setFocusMode(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const resetFocusSession = () => {
    setFocusMode(prev => ({
      ...prev,
      isActive: false,
      timeRemaining: prev.isBreak ? 5 * 60 : 25 * 60
    }));
  };

  const stats = [
    { number: "150+", label: "Problems Solved", icon: Code2, color: "text-blue-400" },
    { number: "98%", label: "Success Rate", icon: Trophy, color: "text-emerald-400" },
    { number: "15+", label: "Languages", icon: BookOpen, color: "text-purple-400" },
    { number: "24/7", label: "Active", icon: Clock, color: "text-rose-400" }
  ];

  const recentActivity = [
    {
      date: "2024-03-15",
      title: "Solved Dynamic Programming Challenge",
      description: "Completed the Longest Common Subsequence problem",
      icon: Code2,
      color: "text-blue-400",
      type: "problem_solved"
    },
    {
      date: "2024-03-14",
      title: "Achieved New Badge",
      description: "Earned the 'Graph Theory Expert' badge",
      icon: Award,
      color: "text-emerald-400",
      type: "achievement"
    },
    {
      date: "2024-03-13",
      title: "Community Contribution",
      description: "Helped 5 community members with their code",
      icon: Heart,
      color: "text-purple-400",
      type: "community"
    }
  ];

  const tabs = [
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      badge: null,
      tooltip: 'Manage your profile settings and preferences'
    },
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: Activity,
      badge: null,
      tooltip: 'View your profile overview and recent activity'
    },
    { 
      id: 'achievements', 
      label: 'Achievements', 
      icon: Trophy,
      badge: achievements.length,
      tooltip: 'Track your achievements and progress'
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: Target,
      badge: recentActivity.length,
      tooltip: 'View your recent activities and contributions'
    },
    { 
      id: 'stats', 
      label: 'Statistics', 
      icon: BarChart2,
      badge: null,
      tooltip: 'View your performance statistics and metrics'
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: Shield,
      badge: is2FAEnabled ? '2FA' : null,
      tooltip: 'Manage your security settings and 2FA'
    },
    { 
      id: 'snippets', 
      label: 'Code Snippets', 
      icon: Code2,
      badge: codeSnippets.length,
      tooltip: 'View and manage your code snippets'
    },
    { 
      id: 'learning', 
      label: 'Learning', 
      icon: BookOpen,
      badge: learningGoals.length,
      tooltip: 'Track your learning goals and progress'
    },
    { 
      id: 'resources', 
      label: 'Resources', 
      icon: Bookmark,
      badge: Object.values(resourceLibrary).reduce((acc, arr) => acc + arr.length, 0),
      tooltip: 'Access your saved resources and bookmarks'
    }
  ];

  const languages = [
    { name: "JavaScript", percentage: 45, color: "bg-blue-500" },
    { name: "Python", percentage: 30, color: "bg-emerald-500" },
    { name: "Java", percentage: 25, color: "bg-purple-500" }
  ];

  const difficultyStats = [
    { level: "Easy", solved: 45, total: 50, color: "bg-emerald-500" },
    { level: "Medium", solved: 30, total: 50, color: "bg-yellow-500" },
    { level: "Hard", solved: 15, total: 50, color: "bg-rose-500" }
  ];

  const categories = [
    { name: "Algorithms", solved: 75, total: 100, color: "bg-blue-500" },
    { name: "Data Structures", solved: 60, total: 80, color: "bg-purple-500" },
    { name: "Dynamic Programming", solved: 40, total: 60, color: "bg-emerald-500" },
    { name: "Graph Theory", solved: 30, total: 50, color: "bg-rose-500" }
  ];

  const handleNotificationToggle = (type) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) {
      setUpdateError('Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);

    try {
      await updateUserProfile({ name: newName.trim() });
      setIsEditingName(false);
    } catch (error) {
      setUpdateError(error.message || 'Failed to update name');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError(null);

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const response = await axiosInstance.put('/api/auth/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Show success message
        setPasswordError({ type: 'success', message: 'Password updated successfully' });
      }
    } catch (error) {
      setPasswordError({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update password'
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 2FA functions
  const handleSetup2FA = async () => {
    try {
      setIsSettingUp2FA(true);
      setTwoFAError(null);
      
      const response = await axiosInstance.post('/api/auth/2fa/setup');
      
      if (response.data.success) {
        setSecretKey(response.data.data.secretKey);
        setOtpAuthUrl(response.data.data.otpauth_url);
      }
    } catch (error) {
      if (error.response && error.response.status === 429) {
        setTwoFAError('Too many attempts to set up 2FA. Please wait a few minutes and try again.');
      } else {
        setTwoFAError(error.response?.data?.message || 'Failed to setup 2FA');
      }
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      setIsVerifying2FA(true);
      setTwoFAError(null);
      
      const response = await axiosInstance.post('/api/auth/2fa/verify', {
        code: verificationCode,
        secretKey
      });
      
      if (response.data.success) {
        setIs2FAEnabled(true);
        setRecoveryCodes(response.data.data.recoveryCodes);
        setShowRecoveryCodes(true);
        setSecretKey('');
        setVerificationCode('');
      }
    } catch (error) {
      setTwoFAError(error.response?.data?.message || 'Failed to verify 2FA code');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleGenerateRecoveryCodes = async () => {
    try {
      setIsGeneratingRecoveryCodes(true);
      setTwoFAError(null);
      
      const response = await axiosInstance.post('/api/auth/2fa/recovery-codes');
      
      if (response.data.success) {
        setRecoveryCodes(response.data.data.recoveryCodes);
        setShowRecoveryCodes(true);
      }
    } catch (error) {
      setTwoFAError(error.response?.data?.message || 'Failed to generate recovery codes');
    } finally {
      setIsGeneratingRecoveryCodes(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setIsVerifying2FA(true);
      setTwoFAError(null);
      
      if (!verificationCode || verificationCode.length !== 6) {
        setTwoFAError('Please enter a valid 6-digit verification code');
        setIsVerifying2FA(false);
        return;
      }

      const response = await axiosInstance.post('/api/auth/2fa/disable', {
        code: verificationCode
      });
      
      if (response.data.success) {
        setIs2FAEnabled(false);
        setVerificationCode('');
        setRecoveryCodes([]);
        setShowRecoveryCodes(false);
        setSecretKey('');
        setOtpAuthUrl('');
      }
    } catch (error) {
      setTwoFAError(error.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const response = await axiosInstance.delete(`/api/auth/sessions/${sessionId}`);
      if (response.data.success) {
        setSessions(prev => prev.filter(session => session.id !== sessionId));
      }
    } catch (error) {
      setSessionError(error.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      const response = await axiosInstance.delete('/api/auth/sessions');
      if (response.data.success) {
        setSessions(prev => prev.filter(session => session.isCurrent));
      }
    } catch (error) {
      setSessionError(error.response?.data?.message || 'Failed to revoke all sessions');
    }
  };

  // Add these new functions after the existing ones
  const handleLayoutToggle = (section) => {
    setDashboardLayout(prev => {
      const newLayout = {
        ...prev,
        [section]: !prev[section]
      };
      // Save to localStorage
      localStorage.setItem('dashboardLayout', JSON.stringify(newLayout));
      return newLayout;
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setLayoutOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const resetLayout = () => {
    const defaultLayout = {
      overview: true,
      achievements: true,
      activity: true,
      stats: true,
      snippets: true,
      learning: true
    };
    setDashboardLayout(defaultLayout);
    setLayoutOrder(['overview', 'achievements', 'activity', 'stats', 'snippets', 'learning']);
    localStorage.setItem('dashboardLayout', JSON.stringify(defaultLayout));
    localStorage.setItem('dashboardLayoutOrder', JSON.stringify(['overview', 'achievements', 'activity', 'stats', 'snippets', 'learning']));
  };

  const handleAddSnippet = () => {
    if (!snippetForm.title || !snippetForm.code) {
      return;
    }

    const newSnippet = {
      id: Date.now(),
      ...snippetForm,
      createdAt: new Date().toISOString()
    };

    setCodeSnippets(prev => [...prev, newSnippet]);
    setSnippetForm({
      title: '',
      code: '',
      language: 'javascript',
      tags: []
    });
    setShowAddSnippet(false);
  };

  const handleEditSnippet = () => {
    if (!snippetForm.title || !snippetForm.code) {
      return;
    }

    setCodeSnippets(prev => prev.map(snippet => 
      snippet.id === currentSnippet.id 
        ? { ...snippet, ...snippetForm }
        : snippet
    ));

    setSnippetForm({
      title: '',
      code: '',
      language: 'javascript',
      tags: []
    });
    setCurrentSnippet(null);
    setShowEditSnippet(false);
  };

  const handleDeleteSnippet = (id) => {
    setCodeSnippets(prev => prev.filter(snippet => snippet.id !== id));
  };

  const handleEditClick = (snippet) => {
    setCurrentSnippet(snippet);
    setSnippetForm({
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      tags: [...snippet.tags]
    });
    setShowEditSnippet(true);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !snippetForm.tags.includes(tagInput.trim())) {
      setSnippetForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSnippetForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddLearningGoal = (goal) => {
    setLearningGoals(prev => [...prev, {
      id: Date.now(),
      title: goal.title,
      target: goal.target,
      progress: 0,
      deadline: goal.deadline,
      status: 'in-progress'
    }]);
  };

  const handleUpdateProductivityGoals = (goals) => {
    setProductivityStats(prev => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(goals).map(([key, value]) => [
          key,
          isNaN(value) ? prev[key] : value
        ])
      )
    }));
  };

  // Add sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Add this new component for sortable items
  const SortableItem = ({ id, section, isEnabled }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg"
      >
        <div className="flex items-center gap-3" {...listeners}>
          <GripVertical className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing" />
          <span className="text-slate-300 capitalize">{section}</span>
        </div>
        <span className={`px-2 py-1 rounded-lg text-sm ${
          isEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'
        }`}>
          {isEnabled ? 'Visible' : 'Hidden'}
        </span>
      </div>
    );
  };

  const handleThemeUpdate = async (settings) => {
    try {
      setThemeSettings(settings);
      
      // Update theme context
      updateTheme({
        ...theme,
        fontSize: settings.fontSize
      });
      
      // Apply theme changes
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(settings.mode);
      
      // Update CSS variables for colors
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
      
      // Save to backend
      await axiosInstance.put('/api/user/settings/theme', settings);
      
      // Show success message
      toast.success('Theme settings updated successfully');
    } catch (error) {
      console.error('Failed to update theme settings:', error);
      toast.error('Failed to update theme settings');
    }
  };

  const handlePrivacyUpdate = async (settings) => {
    try {
      setPrivacySettings(settings);
      // Save to backend
      await axiosInstance.put('/api/user/settings/privacy', settings);
      toast.success('Privacy settings updated successfully');
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      toast.error('Failed to update privacy settings');
    }
  };

  const handlePreferencesUpdate = async (settings) => {
    try {
      setPreferences(settings);
      // Save to backend
      await axiosInstance.put('/api/user/settings/preferences', settings);
      toast.success('Preferences updated successfully');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const handleAccessibilityUpdate = async (settings) => {
    try {
      setAccessibilitySettings(settings);
      
      // Apply accessibility settings
      if (settings.screenReader) {
        document.documentElement.setAttribute('aria-live', 'polite');
      } else {
        document.documentElement.removeAttribute('aria-live');
      }
      
      if (settings.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
      
      if (settings.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }

      // Apply font size
      if (settings.fontSize) {
        document.documentElement.style.fontSize = `${settings.fontSize}px`;
      } else {
        document.documentElement.style.fontSize = '16px'; // Default size
      }
      
      // Save to backend
      await axiosInstance.put('/api/user/settings/accessibility', settings);
      toast.success('Accessibility settings updated successfully');
    } catch (error) {
      console.error('Failed to update accessibility settings:', error);
      toast.error('Failed to update accessibility settings');
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingPicture(true);
      setUploadError(null);

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a JPEG, PNG, or WebP image');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('Image size should be less than 5MB');
      }

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Image = await base64Promise;

      // Set preview
      setProfilePicturePreview(base64Image);

      // Upload to backend
      const response = await axiosInstance.post('/api/auth/update-profile', {
        picture: base64Image
      });

      if (response.data.success) {
        // Update user state with new picture
        const updatedUser = {
          ...user,
          picture: base64Image
        };
        updateUserProfile(updatedUser);
        toast.success('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setUploadError(error.message || 'Failed to upload profile picture');
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
  };

  // Add a function to handle image loading errors
  const handleImageError = (e) => {
    console.error('Error loading profile picture:', e);
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1f2937&color=fff&size=200`;
  };

  const handleDeleteAccount = async () => {
    if (deleteAccountConfirmation !== 'DELETE') return;
    setIsDeletingAccount(true);
    try {
      await axiosInstance.delete('/api/user/account');
      // Clear local storage and cookies
      localStorage.clear();
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      // Use debounced navigation
      debouncedNavigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      await axiosInstance.post('/api/auth/send-verification');
      toast.success('If an account exists with this email, you will receive a verification link');
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification email');
    }
  };

  useEffect(() => {
    // Check for verification token in URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      const verifyEmail = async () => {
        try {
          const response = await axiosInstance.get(`/api/auth/verify-email?token=${token}`);
          if (response.data.success) {
            toast.success('Email verified successfully');
            // Update user data to reflect verified status
            const userResponse = await axiosInstance.get('/api/auth/me');
            if (userResponse.data.success) {
              updateUserProfile(userResponse.data.data);
            }
            // Use debounced navigation
            debouncedNavigate('/profile', { replace: true });
          }
        } catch (error) {
          console.error('Error verifying email:', error);
          toast.error(error.response?.data?.message || 'Failed to verify email');
          debouncedNavigate('/profile', { replace: true });
        }
      };
      verifyEmail();
    }

    // Cleanup function
    return () => {
      debouncedNavigate.cancel();
    };
  }, [location, debouncedNavigate, updateUserProfile]);

  const handleExportData = () => {
    try {
      const data = {
        profile: {
          name: user?.name,
          email: user?.email,
          preferences,
          privacySettings,
          themeSettings,
          accessibilitySettings
        },
        achievements,
        learningGoals,
        codeSnippets,
        resources
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profile-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate data structure
          if (!data.profile || !data.achievements || !data.learningGoals) {
            throw new Error('Invalid data format');
          }
          
          // Update settings
          await axiosInstance.put('/api/user/settings/import', data);
          
          // Update local state
          setPreferences(data.profile.preferences);
          setPrivacySettings(data.profile.privacySettings);
          setThemeSettings(data.profile.themeSettings);
          setAccessibilitySettings(data.profile.accessibilitySettings);
          setAchievements(data.achievements);
          setLearningGoals(data.learningGoals);
          setCodeSnippets(data.codeSnippets);
          setResources(data.resources);
          
          toast.success('Data imported successfully');
        } catch (error) {
          console.error('Failed to import data:', error);
          toast.error('Failed to import data: Invalid format');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Failed to read file:', error);
      toast.error('Failed to read file');
    }
  };

  // Add these functions after other function declarations
  const handleAddGoal = () => {
    if (!goalForm.title || !goalForm.target || !goalForm.deadline) {
      return;
    }

    const newGoal = {
      id: Date.now(),
      ...goalForm,
      progress: 0,
      createdAt: new Date().toISOString()
    };

    setLearningGoals(prev => [...prev, newGoal]);
    setGoalForm({
      title: '',
      target: 0,
      deadline: '',
      status: 'in-progress'
    });
    setShowAddGoal(false);
  };

  const handleEditGoal = () => {
    if (!goalForm.title || !goalForm.target || !goalForm.deadline) {
      return;
    }

    setLearningGoals(prev => prev.map(goal => 
      goal.id === currentGoal.id 
        ? { ...goal, ...goalForm } : goal
    ));

    setGoalForm({
      title: '',
      target: 0,
      deadline: '',
      status: 'in-progress'
    });
    setCurrentGoal(null);
    setShowEditGoal(false);
  };

  const handleDeleteGoal = (id) => {
    setLearningGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const handleEditGoalClick = (goal) => {
    setCurrentGoal(goal);
    setGoalForm({
      title: goal.title,
      target: goal.target,
      deadline: goal.deadline,
      status: goal.status
    });
    setShowEditGoal(true);
  };

  const handleUpdateProgress = (id, newProgress) => {
    setLearningGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const progress = Math.min(Math.max(newProgress, 0), 100);
        const status = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'not-started';
        return { ...goal, progress, status };
      }
      return goal;
    }));
  };

  // Add these handlers after other handler functions
  const handleAddResource = () => {
    setResourceLibrary(prev => ({
      ...prev,
      [resourceForm.category]: [
        ...prev[resourceForm.category],
        {
          ...resourceForm,
          id: Date.now(),
          createdAt: new Date().toISOString()
        }
      ]
    }));
    setResourceForm({
      title: '',
      type: 'video',
      url: '',
      category: 'Tutorials',
      status: 'planned'
    });
    setShowAddResource(false);
  };

  const handleDeleteResource = (category, id) => {
    setResourceLibrary(prev => ({
      ...prev,
      [category]: prev[category].filter(resource => resource.id !== id)
    }));
  };

  const handleAddPath = () => {
    setLearningPaths(prev => [
      ...prev,
      {
        ...pathForm,
        id: Date.now(),
        progress: 0
      }
    ]);
    setPathForm({
      title: '',
      description: '',
      skills: [],
      nextMilestone: '',
      estimatedCompletion: ''
    });
    setShowAddPath(false);
  };

  const handleAddPathSkill = () => {
    setPathForm(prev => ({
      ...prev,
      skills: [...prev.skills, { name: '', level: 'Beginner', progress: 0 }]
    }));
  };

  const handleRemoveSkill = (index) => {
    setPathForm(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSkill = (index, field, value) => {
    setPathForm(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const handleDeletePath = (id) => {
    setLearningPaths(prev => prev.filter(path => path.id !== id));
  };

  const handleEditResource = (category, resource) => {
    setEditResourceForm({
      title: resource.title,
      type: resource.type,
      url: resource.url,
      status: resource.status
    });
    setShowEditResource(true);
  };

  const handleSaveEditResource = () => {
    setResourceLibrary(prev => ({
      ...prev,
      [editResourceForm.category]: prev[editResourceForm.category].map(resource => 
        resource.id === editResourceForm.id ? { ...resource, ...editResourceForm } : resource
      )
    }));
    setShowEditResource(false);
  };

  // Add these new functions after other function declarations
  const handleAddEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...eventForm,
      createdAt: new Date().toISOString()
    };

    setLearningCalendar(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));

    // Update learning stats
    setLearningStats(prev => ({
      ...prev,
      totalHours: prev.totalHours + (eventForm.duration / 60)
    }));

    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      type: 'learning'
    });
    setShowAddEvent(false);
  };

  const handleDeleteEvent = (eventId) => {
    setLearningCalendar(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== eventId)
    }));
  };

  const handleAddSkill = () => {
    if (!skillForm.name || !skillForm.category) {
      return;
    }

    const newSkill = {
      id: Date.now(),
      ...skillForm,
      createdAt: new Date().toISOString()
    };

    setSkillTree(prev => ({
      ...prev,
      nodes: [...prev.nodes, newSkill]
    }));

    // Update learning stats
    if (skillForm.progress === 100) {
      setLearningStats(prev => ({
        ...prev,
        skillsMastered: prev.skillsMastered + 1
      }));
    }

    setSkillForm({
      name: '',
      category: '',
      level: 'Beginner',
      progress: 0,
      prerequisites: []
    });
    setShowAddSkill(false);
  };

  const handleUpdateSkillProgress = (skillId, progress) => {
    setSkillTree(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === skillId ? { ...node, progress } : node
      )
    }));

    // Update learning stats if skill is mastered
    if (progress === 100) {
      setLearningStats(prev => ({
        ...prev,
        skillsMastered: prev.skillsMastered + 1
      }));
    }
  };

  const handleAddMilestone = () => {
    if (!milestoneForm.title || !milestoneForm.targetDate) {
      return;
    }

    const newMilestone = {
      id: Date.now(),
      ...milestoneForm,
      createdAt: new Date().toISOString()
    };

    setLearningMilestones(prev => [...prev, newMilestone]);
    setMilestoneForm({
      title: '',
      description: '',
      targetDate: '',
      status: 'pending',
      associatedPath: ''
    });
    setShowAddMilestone(false);
  };

  const handleUpdateMilestoneStatus = (milestoneId, status) => {
    setLearningMilestones(prev => prev.map(milestone => 
      milestone.id === milestoneId ? { ...milestone, status } : milestone
    ));
  };

  const handleDeleteMilestone = (milestoneId) => {
    setLearningMilestones(prev => prev.filter(milestone => milestone.id !== milestoneId));
  };

  // Add this useEffect to update streak
  useEffect(() => {
    if (!learningStats.lastFocusDate) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActive = new Date(learningStats.lastFocusDate).toISOString().split('T')[0];
    
    if (lastActive === today) {
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastActive === yesterdayStr) {
      setLearningStats(prev => ({
        ...prev,
        streak: prev.streak + 1
      }));
    } else {
      setLearningStats(prev => ({
        ...prev,
        streak: 0
      }));
    }
  }, [learningStats.lastFocusDate]);

  const [themeSettings, setThemeSettings] = useState({
    mode: 'dark',
    primaryColor: 'blue',
    fontSize: theme.fontSize || 'medium',
    reducedMotion: false,
    highContrast: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true,
    allowMentions: true,
    allowMessages: true
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState({
    screenReader: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    lineSpacing: 'normal'
  });

  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteAccountConfirmation, setDeleteAccountConfirmation] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [profilePicture, setProfilePicture] = useState(null);
  const [otpAuthUrl, setOtpAuthUrl] = useState('');

  const themeColors = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
    { id: 'amber', name: 'Amber', color: 'bg-amber-500' }
  ];

  const fontSizeOptions = [
    { id: 'small', name: 'Small', size: 'text-sm', value: '14px' },
    { id: 'medium', name: 'Medium', size: 'text-base', value: '16px' },
    { id: 'large', name: 'Large', size: 'text-lg', value: '18px' },
    { id: 'xlarge', name: 'Extra Large', size: 'text-xl', value: '20px' }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', size: 'text-sm' },
    { id: 'medium', name: 'Medium', size: 'text-base' },
    { id: 'large', name: 'Large', size: 'text-lg' },
    { id: 'xlarge', name: 'Extra Large', size: 'text-xl' }
  ];

  const tabContainerRef = useRef(null);

  useEffect(() => {
    const tabContainer = tabContainerRef.current;
    if (!tabContainer) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    const handleMouseDown = (e) => {
      isDown = true;
      tabContainer.classList.add('dragging');
      startX = e.pageX - tabContainer.offsetLeft;
      scrollLeft = tabContainer.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      tabContainer.classList.remove('dragging');
    };

    const handleMouseUp = () => {
      isDown = false;
      tabContainer.classList.remove('dragging');
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - tabContainer.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      tabContainer.scrollLeft = scrollLeft - walk;
    };

    tabContainer.addEventListener('mousedown', handleMouseDown);
    tabContainer.addEventListener('mouseleave', handleMouseLeave);
    tabContainer.addEventListener('mouseup', handleMouseUp);
    tabContainer.addEventListener('mousemove', handleMouseMove);

    return () => {
      tabContainer.removeEventListener('mousedown', handleMouseDown);
      tabContainer.removeEventListener('mouseleave', handleMouseLeave);
      tabContainer.removeEventListener('mouseup', handleMouseUp);
      tabContainer.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailValidation, setEmailValidation] = useState({
    format: null,
    available: null,
    loading: false
  });

  // Debounced email validation
  useEffect(() => {
    const validateEmail = async () => {
      if (!newEmail) {
        setEmailValidation({ format: null, available: null, loading: false });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidFormat = emailRegex.test(newEmail);
      setEmailValidation(prev => ({ ...prev, format: isValidFormat }));

      if (isValidFormat) {
        setEmailValidation(prev => ({ ...prev, loading: true }));
        try {
          const response = await axiosInstance.post('/api/auth/check-email', { email: newEmail });
          setEmailValidation(prev => ({ ...prev, available: response.data.available }));
        } catch (error) {
          setEmailValidation(prev => ({ ...prev, available: false }));
        } finally {
          setEmailValidation(prev => ({ ...prev, loading: false }));
        }
      }
    };

    const timeoutId = setTimeout(validateEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [newEmail]);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setEmailError(null);

    if (!newEmail || !emailPassword) {
      setEmailError('All fields are required');
      return;
    }

    if (!emailValidation.format) {
      setEmailError('Invalid email format');
      return;
    }

    if (!emailValidation.available) {
      setEmailError('Email is already in use');
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const response = await axiosInstance.post('/api/auth/change-email', {
        newEmail,
        password: emailPassword
      });

      if (response.data.success) {
        toast.success('Email change initiated. Please verify your new email address.');
        setIsEditingEmail(false);
        setNewEmail('');
        setEmailPassword('');
        setEmailValidation({ format: null, available: null, loading: false });
      }
    } catch (error) {
      setEmailError(error.response?.data?.message || 'Failed to change email');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  const [bioError, setBioError] = useState(null);
  const maxBioLength = 500;

  const handleBioUpdate = async () => {
    try {
      setIsUpdatingBio(true);
      setBioError(null);

      if (bio.length > maxBioLength) {
        setBioError(`Bio cannot exceed ${maxBioLength} characters`);
        return;
      }

      const response = await axiosInstance.put('/api/auth/me', {
        bio: bio.trim()
      });

      if (response.data.success) {
        // Update the user state with the new bio
        const updatedUser = {
          ...user,
          bio: response.data.data.user.bio
        };
        updateUserProfile(updatedUser);
        setIsEditingBio(false);
        toast.success('Bio updated successfully');
      }
    } catch (error) {
      setBioError(error.response?.data?.message || 'Failed to update bio');
      toast.error('Failed to update bio');
    } finally {
      setIsUpdatingBio(false);
    }
  };

  // Add useEffect to initialize bio from user data
  useEffect(() => {
    if (user?.bio) {
      setBio(user.bio);
    }
  }, [user?.bio]);

  // Add useEffect to fetch user data and initialize bio
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/api/auth/me');
        if (response.data.success) {
          const userData = response.data.data.user;
          updateUserProfile(userData);
          setBio(userData.bio || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Update bio state when user data changes
  useEffect(() => {
    if (user?.bio) {
      setBio(user.bio);
    }
  }, [user?.bio]);

  // Initialize profile picture state when user data changes
  useEffect(() => {
    if (user?.picture) {
      setProfilePicture(user.picture);
      setProfilePicturePreview(user.picture);
    }
  }, [user]);

  // Activity states
  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySort, setActivitySort] = useState('date');
  const [showActivityFilter, setShowActivityFilter] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityStats, setActivityStats] = useState({
    totalActivities: 0,
    todayActivities: 0,
    thisWeekActivities: 0,
    byCategory: {}
  });
  const [activityCategories] = useState([
    { id: 'all', label: 'All Activities', icon: Activity },
    { id: 'coding', label: 'Coding', icon: Code2 },
    { id: 'learning', label: 'Learning', icon: BookOpen },
    { id: 'achievement', label: 'Achievements', icon: Trophy },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'focus', label: 'Focus Sessions', icon: Clock }
  ]);

  // Filter and sort activities
  const filteredActivities = useMemo(() => {
    let filtered = [...recentActivity];
    
    // Apply filter
    if (activityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activityFilter);
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      if (activitySort === 'date') {
        return new Date(b.date) - new Date(a.date);
      } else if (activitySort === 'type') {
        return a.type.localeCompare(b.type);
      }
      return 0;
    });
    
    return filtered;
  }, [recentActivity, activityFilter, activitySort]);

  const [qrLoading, setQrLoading] = useState(false);
  const [qrCodeInstance, setQrCodeInstance] = useState(null);
  const qrDownloadRef = useRef(null);

  useEffect(() => {
    if (otpAuthUrl) {
      setQrLoading(true);
      // Clear previous QR code if any
      const container = document.getElementById('qrcode-container');
      if (container) {
        container.innerHTML = '';
      }
      const qrCodeStyling = new QRCodeStyling({
        width: 200,
        height: 200,
        type: 'svg',
        data: otpAuthUrl,
        image: '/logo.png',
        dotsOptions: {
          color: '#4267b2',
          type: 'rounded',
        },
        backgroundOptions: {
          color: '#e9ebee',
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 5,
        },
      });
      qrCodeStyling.append(container);
      setQrCodeInstance(qrCodeStyling);
      setTimeout(() => setQrLoading(false), 500); // Simulate loading
    }
  }, [otpAuthUrl]);

  const inputRefs = useRef([]);

  const handleVerificationDigitChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Update the digit
    const newDigits = [...verificationDigits];
    newDigits[index] = value;
    setVerificationDigits(newDigits);
    
    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
    
    // Update the full verification code
    setVerificationCode(newDigits.join(''));
  };
  
  const handleVerificationKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationDigits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Simulate API call with mock data
        const mockActivitiesData = [
          { id: 1, date: new Date().toISOString(), category: 'coding' },
          { id: 2, date: new Date().toISOString(), category: 'meeting' },
          { id: 3, date: new Date().toISOString(), category: 'coding' }
        ];
        setActivities(mockActivitiesData);

        // Calculate activity statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const stats = {
          totalActivities: mockActivitiesData.length,
          todayActivities: mockActivitiesData.filter(a => new Date(a.date) >= today).length,
          thisWeekActivities: mockActivitiesData.filter(a => new Date(a.date) >= weekAgo).length,
          byCategory: mockActivitiesData.reduce((acc, activity) => {
            acc[activity.category] = (acc[activity.category] || 0) + 1;
            return acc;
          }, {})
        };

        setActivityStats(stats);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]); // Set activities to empty array on error
        setActivityStats({
          totalActivities: 0,
          todayActivities: 0,
          thisWeekActivities: 0,
          byCategory: {}
        });
        toast.error('Failed to load activities. Please try again later.');
      }
    };

    fetchActivities();
  }, []);

// Optimize data fetching
useEffect(() => {
  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      
      // First fetch user data since it's most critical
      const userData = await fetchUserData();
      if (userData) {
        updateUserProfile(userData);
      }

      // Then fetch other data in parallel
      const [activitiesData, sessionsData] = await Promise.all([
        fetchActivities(),
        fetchSessions()
      ]);

      if (activitiesData) {
        setActivities(activitiesData);
      }
      if (sessionsData) {
        setSessions(sessionsData);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  fetchInitialData();
}, []);

  // Optimize animations with useMemo
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        duration: 0.3
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }), []);

  // Optimize scroll animations
  const scrollConfig = useMemo(() => ({
    damping: 20,
    stiffness: 100,
    mass: 0.5
  }), []);

  // Optimize image loading
  const handleImageLoad = useCallback(() => {
    setProfileImageLoaded(true);
  }, []);

  // Optimize tab switching
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  // Optimize form submissions
  const debouncedSubmit = useMemo(
    () => debounce((fn) => fn(), 300),
    []
  );

  // Optimize data updates
  const updateData = useCallback(async (data) => {
    try {
      setIsLoading(true);
      await updateUserProfile(data);
    } catch (error) {
      console.error('Error updating data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [updateUserProfile]);

  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950 pt-20">
        {/* Profile Header Section */}
        <div className="relative bg-navy-900/50 border-b border-slate-800 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Main Profile Content */}
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Left Column - Profile Picture and Basic Info */}
              <div className="flex flex-col items-center lg:items-start gap-8 lg:w-1/3">
                {/* Profile Picture Skeleton */}
                <div className="relative w-40 h-40">
                  <div 
                    className="w-full h-full rounded-full bg-slate-800/50"
                    style={shimmerStyles}
                  />
                </div>
                
                {/* Basic Info Skeleton */}
                <div className="text-center lg:text-left space-y-4">
                  <div 
                    className="h-8 w-48 bg-slate-800/50 rounded"
                    style={shimmerStyles}
                  />
                  <div 
                    className="h-4 w-32 bg-slate-800/50 rounded"
                    style={shimmerStyles}
                  />
                  <div 
                    className="h-4 w-40 bg-slate-800/50 rounded"
                    style={shimmerStyles}
                  />
                </div>
              </div>

              {/* Right Column - Stats and Info */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-pro rounded-lg border border-slate-700/50 p-6">
                      <div 
                        className="h-6 w-48 bg-slate-800/50 rounded mb-6"
                        style={shimmerStyles}
                      />
                      <div className="space-y-4">
                        {[1, 2, 3].map((j) => (
                          <div key={j} className="flex items-center gap-4">
                            <div 
                              className="w-12 h-12 rounded-full bg-slate-800/50"
                              style={shimmerStyles}
                            />
                            <div className="flex-1 space-y-2">
                              <div 
                                className="h-4 w-3/4 bg-slate-800/50 rounded"
                                style={shimmerStyles}
                              />
                              <div 
                                className="h-3 w-1/2 bg-slate-800/50 rounded"
                                style={shimmerStyles}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Skeleton */}
        <div className="bg-navy-900/50 border-b border-slate-800 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-8">
              {['Profile', 'Settings', 'Security', 'Preferences', 'Activity'].map((tab) => (
                <div
                  key={tab}
                  className="py-4 px-1 border-b-2 border-transparent hover:border-slate-600 cursor-not-allowed"
                >
                  <div 
                    className="h-5 w-20 bg-slate-800/50 rounded"
                    style={shimmerStyles}
                  />
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content Skeleton */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-pro rounded-lg border border-slate-700/50 p-6">
                <div 
                  className="h-6 w-48 bg-slate-800/50 rounded mb-6"
                  style={shimmerStyles}
                />
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div 
                          className="h-4 w-32 bg-slate-800/50 rounded"
                          style={shimmerStyles}
                        />
                        <div 
                          className="h-3 w-24 bg-slate-800/50 rounded"
                          style={shimmerStyles}
                        />
                      </div>
                      <div 
                        className="w-8 h-8 rounded-full bg-slate-800/50"
                        style={shimmerStyles}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen bg-gradient-to-b from-navy-900 via-navy-950 to-navy-950 pt-20">
      {/* Profile Header Section */}
      <motion.div 
        style={{ opacity, scale }}
        className="relative bg-navy-900/50 border-b border-slate-800 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Main Profile Content */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column - Profile Picture and Basic Info */}
            <div className="flex flex-col items-center lg:items-start gap-8 lg:w-1/3">
              {/* Profile Picture with Enhanced Effects */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative w-40 h-40 group"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <motion.img
                  src={user?.picture?.startsWith('data:image') 
                    ? user.picture 
                    : user?.picture?.startsWith('http') 
                      ? user.picture 
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=random&color=fff&size=160`}
                  alt="Profile"
                  className="relative w-full h-full rounded-full border-2 border-slate-700 group-hover:border-slate-600 transition-all duration-300 object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  style={{
                    objectFit: 'cover',
                    opacity: profileImageLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                />
                {!profileImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-gray-700/50 animate-pulse" />
                  </div>
                )}
                <motion.div
                  className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2.5 shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  onClick={() => document.getElementById('profilePictureInput').click()}
                >
                  <Edit className="w-5 h-5 text-white" />
                </motion.div>
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleProfilePictureUpload}
                />
              </motion.div>

              {/* Enhanced Basic Info */}
              <motion.div 
                className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <h1 className="text-4xl font-bold text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300 whitespace-nowrap overflow-hidden text-ellipsis">
                {user?.name || 'User'}
                  </h1>
              <motion.div 
                    className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Pro Member
                  </motion.div>
                </div>
                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                  {user?.bio || 'No bio provided'}
                </p>
              </motion.div>
            </div>

            {/* Right Column - Enhanced Stats and Additional Info */}
            <div className="flex-1 space-y-8">
              {/* Quick Stats Grid with Enhanced Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    className="relative text-center p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group overflow-hidden"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Enhanced Background Effects */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                      animate={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    />
                    
                    {/* Enhanced Stat Icon */}
                    <motion.div
                      className={`absolute -top-2 -right-2 w-16 h-16 rounded-full ${stat.color} opacity-10 blur-xl group-hover:opacity-20 transition-opacity duration-300`}
                      initial={false}
                      animate={{ opacity: 0.1 }}
                      whileHover={{ opacity: 0.2 }}
                    />
                    
                    {/* Enhanced Stat Content */}
                    <div className="relative z-10">
                      <motion.div 
                        className={`text-3xl font-bold ${stat.color} mb-1`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                    {stat.number}
                      </motion.div>
                      <motion.div 
                        className="text-sm text-slate-400 font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 * index }}
                      >
                        {stat.label}
                      </motion.div>
                      
                      {/* Enhanced Progress Bar */}
                      <motion.div 
                        className="h-1 bg-slate-700/50 rounded-full mt-3 overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 * index }}
                      >
                        <motion.div
                          className={`h-full ${stat.color.replace('text', 'bg')}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (stat.number / 100) * 100)}%` }}
                          transition={{ duration: 1, delay: 0.4 * index }}
                        />
                      </motion.div>
                  </div>
                    
                    {/* Enhanced Hover Effect */}
                    <motion.div
                      className="absolute inset-0 border border-slate-700/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={false}
                      whileHover={{ opacity: 1 }}
                    />
                  </motion.div>
              ))}
            </motion.div>

              {/* Enhanced Additional Stats Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Enhanced Activity Streak */}
                <motion.div
                  className="p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">Activity Streak</div>
                      <div className="text-2xl font-bold text-emerald-400">7 Days</div>
                    </div>
                    <motion.div
                      className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Clock className="w-6 h-6 text-emerald-400" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Learning Progress */}
                <motion.div
                  className="p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">Learning Progress</div>
                      <div className="text-2xl font-bold text-blue-400">85%</div>
                    </div>
                    <motion.div
                      className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <BookOpen className="w-6 h-6 text-blue-400" />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Achievements */}
                <motion.div
                  className="p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">Achievements</div>
                      <div className="text-2xl font-bold text-purple-400">12</div>
                    </div>
                    <motion.div
                      className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Trophy className="w-6 h-6 text-purple-400" />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Contact Info */}
              <motion.div 
                className="flex flex-wrap gap-4 text-slate-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.span 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-sm text-slate-300">
                    {user?.email || 'No email provided'}
                  </span>
                  {user?.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-400">
                      <AlertCircle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </motion.span>
                <motion.span 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                </motion.span>
                <motion.span 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Global Rank: #1,234
                </motion.span>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-800 bg-navy-900/30 backdrop-blur-sm sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div
              ref={tabContainerRef}
              className="flex gap-8 overflow-x-auto whitespace-nowrap select-none scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing"
              onMouseDown={(e) => {
                const container = tabContainerRef.current;
                if (!container) return;
                
                const startX = e.pageX - container.offsetLeft;
                const scrollLeft = container.scrollLeft;
                
                const handleMouseMove = (e) => {
                  const x = e.pageX - container.offsetLeft;
                  const walk = (x - startX) * 2;
                  container.scrollLeft = scrollLeft - walk;
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
              onTouchStart={(e) => {
                const container = tabContainerRef.current;
                if (!container) return;
                
                const startX = e.touches[0].pageX - container.offsetLeft;
                const scrollLeft = container.scrollLeft;
                
                const handleTouchMove = (e) => {
                  const x = e.touches[0].pageX - container.offsetLeft;
                  const walk = (x - startX) * 2;
                  container.scrollLeft = scrollLeft - walk;
                };
                
                const handleTouchEnd = () => {
                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };
                
                document.addEventListener('touchmove', handleTouchMove);
                document.addEventListener('touchend', handleTouchEnd);
              }}
            >
            {tabs.map((tab) => (
                <motion.button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                  className={`group relative flex items-center gap-2 py-4 px-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                  {tab.badge && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      typeof tab.badge === 'number' 
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 transform scale-x-0 transition-transform group-hover:scale-x-100" />
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-slate-800 text-slate-300 text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {tab.tooltip}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-6 py-8"
      >
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Quick Stats Overview with Enhanced Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                      <div className={`text-2xl font-bold ${stat.color}`}>{stat.number}</div>
                    </div>
                    <motion.div
                      className={`w-12 h-12 rounded-lg ${stat.color.replace('text', 'bg')}/20 flex items-center justify-center group-hover:bg-opacity-30 transition-colors`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </motion.div>
                  </div>
                  <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${stat.color.replace('text', 'bg')}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (parseInt(stat.number) / 100) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.2 * index }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid with Enhanced Layout */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Recent Activity with Enhanced Design */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-200">Recent Activity</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="bg-slate-800 text-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-700/50 transition-colors"
                    >
                      <option value="all">All Activities</option>
                      <option value="problem_solved">Problems Solved</option>
                      <option value="achievement">Achievements</option>
                      <option value="community">Community</option>
                    </select>
                  </div>
              </div>
                <div className="space-y-4">
                  {filteredActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 group"
                >
                      <div className={`p-2 rounded-lg ${activity.color.replace('text', 'bg')}/20`}>
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                      <div className="flex-1">
                      <div className="flex items-center justify-between">
                          <h4 className="text-slate-200 font-medium">{activity.title}</h4>
                          <span className="text-sm text-slate-400">{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                        <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
              </motion.div>

              {/* Learning Progress with Enhanced Design */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
                  >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-200">Learning Progress</h3>
                  <button
                    onClick={() => setShowAddGoal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Goal
                  </button>
                      </div>
                <div className="space-y-4">
                  {learningGoals.map((goal, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-slate-200 font-medium">{goal.title}</h4>
                        <span className="text-sm text-slate-400">{goal.progress}%</span>
                        </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                            />
                          </div>
                    </motion.div>
                  ))}
                    </div>
                  </motion.div>
              </div>

            {/* Additional Stats with Enhanced Design */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Current Streak</div>
                    <div className="text-2xl font-bold text-emerald-400">7 days</div>
                    <div className="text-sm text-slate-400 mt-1">Best: 30 days</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Achievements</div>
                    <div className="text-2xl font-bold text-purple-400">12</div>
                    <div className="text-sm text-slate-400 mt-1">3 new this week</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Global Rank</div>
                    <div className="text-2xl font-bold text-rose-400">#1,234</div>
                    <div className="text-sm text-slate-400 mt-1">Top 5%</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TrendingUp className="w-6 h-6 text-rose-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Achievement Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Total Achievements</div>
                    <div className="text-2xl font-bold text-blue-400">{achievements.length}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Trophy className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Completed</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {achievements.filter(a => a.progress === 100).length}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">In Progress</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {achievements.filter(a => a.progress < 100).length}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Clock className="w-6 h-6 text-purple-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 glass-pro rounded-lg border border-slate-700/50">
              <div className="flex flex-wrap items-center gap-4">
                <select
                  value={achievementFilter}
                  onChange={(e) => setAchievementFilter(e.target.value)}
                  className="bg-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-700/50 transition-colors"
                >
                  {achievementCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <select
                  value={achievementSort}
                  onChange={(e) => setAchievementSort(e.target.value)}
                  className="bg-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-700/50 transition-colors"
                >
                  <option value="date">Sort by Date</option>
                  <option value="progress">Sort by Progress</option>
                  <option value="title">Sort by Title</option>
                </select>
              </div>
                <button
                  onClick={() => {
                    setEditingAchievement(null);
                    setNewAchievement({
                      title: '',
                      description: '',
                      category: 'algorithms',
                      badge: 'bronze',
                      progress: 0
                    });
                    setShowAchievementModal(true);
                  }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Achievement
                </button>
            </div>

            {/* Achievements Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className={`w-16 h-16 rounded-lg p-4 ${achievement.color.replace('text', 'bg')}/20 flex items-center justify-center group-hover:bg-opacity-30 transition-colors`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <achievement.icon className={`w-full h-full ${achievement.color}`} />
                    </motion.div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAchievement(achievement)}
                        className="text-slate-400 hover:text-slate-300 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(achievement.id)}
                        className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                  <h3 className="text-xl font-semibold text-slate-100 text-center mb-2">
                    {achievement.title}
                  </h3>
                      <p className="text-slate-400 text-center text-sm">
                    {achievement.description}
                  </p>
                    </div>

                    <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-300">{achievement.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                        className={`h-full ${achievement.color.replace('text', 'bg')} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                      />
                    </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <span className="text-sm text-slate-400">
                        {achievementCategories.find(c => c.id === achievement.category)?.label}
                      </span>
                      <span className={`text-sm font-medium ${achievementBadges.find(b => b.id === achievement.badge)?.color}`}>
                        {achievementBadges.find(b => b.id === achievement.badge)?.label}
                      </span>
                    </div>

                    <div className="text-sm text-slate-400 text-center">
                      Earned on {achievement.date}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievement Modal */}
        {showAchievementModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-4">
                {editingAchievement ? 'Edit Achievement' : 'Add Achievement'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newAchievement.title}
                    onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                    className="w-full bg-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter achievement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newAchievement.description}
                    onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                    className="w-full bg-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter achievement description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newAchievement.category}
                    onChange={(e) => setNewAchievement({ ...newAchievement, category: e.target.value })}
                    className="w-full bg-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {achievementCategories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Badge
                  </label>
                  <select
                    value={newAchievement.badge}
                    onChange={(e) => setNewAchievement({ ...newAchievement, badge: e.target.value })}
                    className="w-full bg-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {achievementBadges.map(badge => (
                      <option key={badge.id} value={badge.id}>
                        {badge.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newAchievement.progress}
                    onChange={(e) => setNewAchievement({ ...newAchievement, progress: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-700 text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAchievementModal(false)}
                    className="px-4 py-2 text-slate-300 hover:text-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingAchievement ? handleUpdateAchievement : handleAddAchievement}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    {editingAchievement ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Activity Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Total Activities</div>
                    <div className="text-2xl font-bold text-blue-400">{activityStats.totalActivities}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Activity className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Today</div>
                    <div className="text-2xl font-bold text-emerald-400">{activityStats.todayActivities}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Clock className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">This Week</div>
                    <div className="text-2xl font-bold text-purple-400">{activityStats.thisWeekActivities}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Calendar className="w-6 h-6 text-purple-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Most Active</div>
                    <div className="text-2xl font-bold text-rose-400">
                      {Object.entries(activityStats.byCategory)
                        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TrendingUp className="w-6 h-6 text-rose-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Activity Filters and Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 glass-pro rounded-lg border border-slate-700/50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search activities..."
                    className="bg-slate-800 text-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-700/50 transition-colors w-64"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value)}
                  className="bg-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-700/50 transition-colors"
                >
                  {activityCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <select
                  value={activitySort}
                  onChange={(e) => setActivitySort(e.target.value)}
                  className="bg-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-700/50 transition-colors"
                >
                  <option value="date">Sort by Date</option>
                  <option value="type">Sort by Type</option>
                  <option value="duration">Sort by Duration</option>
                </select>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-4">
              {activities
                .filter(activity => {
                  const matchesSearch = activity.title.toLowerCase().includes(activitySearch.toLowerCase()) ||
                                      activity.description.toLowerCase().includes(activitySearch.toLowerCase());
                  const matchesFilter = activityFilter === 'all' || activity.category === activityFilter;
                  return matchesSearch && matchesFilter;
                })
                .sort((a, b) => {
                  switch (activitySort) {
                    case 'date':
                      return new Date(b.date) - new Date(a.date);
                    case 'type':
                      return a.category.localeCompare(b.category);
                    case 'duration':
                      return (b.duration || 0) - (a.duration || 0);
                    default:
                      return 0;
                  }
                })
                .map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 group"
                  >
                    <div className={`p-2 rounded-lg ${activity.color.replace('text', 'bg')}/20`}>
                      <activity.icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-slate-200 font-medium">{activity.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">{new Date(activity.date).toLocaleDateString()}</span>
                          {activity.duration && (
                            <span className="text-sm text-slate-400">
                              {Math.floor(activity.duration / 60)}m {activity.duration % 60}s
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                      {activity.tags && activity.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {activity.tags.map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs rounded-full bg-slate-700/50 text-slate-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Total Problems</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {difficultyStats.reduce((acc, stat) => acc + stat.solved, 0)}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Code2 className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Success Rate</div>
                    <div className="text-2xl font-bold text-emerald-400">98%</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Categories Mastered</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {categories.filter(c => (c.solved / c.total) >= 0.8).length}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Trophy className="w-6 h-6 text-purple-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Problem Solving Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-100">Problem Solving Stats</h2>
                  <button className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2 transition-colors">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="text-center p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300"
                    >
                      <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                        {stat.number}
                      </div>
                      <div className="text-slate-400">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Language Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-100">Language Distribution</h2>
                  <button className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                    View Details
                  </button>
                </div>
                <div className="space-y-4">
                  {languages.map((language, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300">{language.name}</span>
                        <span className="text-slate-400">{language.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full ${language.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${language.percentage}%` }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Difficulty and Category Distribution */}
            <div className="grid md:grid-cols-2 gap-8">
            {/* Difficulty Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Difficulty Distribution</h2>
              <div className="space-y-4">
                {difficultyStats.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">{stat.level}</span>
                      <span className="text-slate-400">{stat.solved}/{stat.total}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                        className={`h-full ${stat.color} rounded-full`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${(stat.solved / stat.total) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                      />
                    </div>
                    </motion.div>
                ))}
              </div>
              </motion.div>

            {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Category Distribution</h2>
                <div className="space-y-4">
                {categories.map((category, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">{category.name}</span>
                      <span className="text-slate-400">{category.solved}/{category.total}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                        className={`h-full ${category.color} rounded-full`} 
                          initial={{ width: 0 }}
                          animate={{ width: `${(category.solved / category.total) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                      />
                    </div>
                    </motion.div>
                ))}
              </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Settings Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Theme Mode</div>
                    <div className="text-2xl font-bold text-blue-400 capitalize">{themeSettings.mode}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {themeSettings.mode === 'dark' ? (
                      <Moon className="w-6 h-6 text-blue-400" />
                    ) : (
                      <Sun className="w-6 h-6 text-blue-400" />
                    )}
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Privacy Level</div>
                    <div className="text-2xl font-bold text-emerald-400 capitalize">{privacySettings.profileVisibility}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Lock className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Accessibility</div>
                    <div className="text-2xl font-bold text-amber-400">
                      {accessibilitySettings.screenReader ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Eye className="w-6 h-6 text-amber-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

                        {/* Email Verification Section */}
                        {!user?.isVerified && (
                        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-200">Email Verification</h3>
                  <p className="text-slate-400 text-sm mt-1">Verify your email address to access all features</p>
                </div>
                {user?.isVerified ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400"
                  >
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendVerificationEmail}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <Mail className="w-4 h-4" />
                    Send Verification Email
                  </motion.button>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/30">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <div className="text-slate-200 font-medium">{user?.email || 'No email provided'}</div>
                    <div className="text-sm text-slate-400">
                      {user?.isVerified 
                        ? 'Your email is verified and you have access to all features'
                        : 'Please verify your email to access all features and ensure account security'}
                    </div>
                  </div>
                </div>
                {!user?.isVerified && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                      <div>
                        <h4 className="text-amber-400 font-medium mb-1">Email Not Verified</h4>
                        <p className="text-slate-400 text-sm">
                          Please check your email for the verification link. If you haven't received it, click the button above to resend.
                          Make sure to check your spam folder if you don't see it in your inbox.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
            )}

            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Profile Settings</h2>
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Profile Picture</h3>
                    <p className="text-slate-400 text-sm">Change your profile picture</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {profilePicturePreview && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-emerald-500/20"
                      >
                        <img src={profilePicturePreview} alt="Profile preview" className="w-full h-full object-cover" />
                      </motion.div>
                    )}
                    <div className="flex items-center gap-2">
                      <motion.label
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2 cursor-pointer transition-colors duration-200"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                        />
                      </motion.label>
                      {profilePicture && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setProfilePicture(null);
                            setProfilePicturePreview(null);
                          }}
                          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 flex items-center gap-2 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Name */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Display Name</h3>
                    <p className="text-slate-400 text-sm">Change your display name</p>
                  </div>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                        placeholder="Enter new name"
                        disabled={isUpdating}
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNameUpdate}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(user?.name || '');
                        }}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 font-medium flex items-center gap-2 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-slate-300">{user?.name || 'No name set'}</span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditingName(true)}
                        className="p-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    >
                    <Edit className="w-4 h-4" />
                      </motion.button>
                </div>
                  )}
                </div>

                {/* Bio */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Bio</h3>
                    <p className="text-slate-400 text-sm">Tell us about yourself</p>
                  </div>
                    {isEditingBio ? (
                    <div className="flex-1 max-w-2xl ml-8">
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                        rows={4}
                            placeholder="Write something about yourself..."
                        disabled={isUpdatingBio}
                          />
                        {bioError && (
                        <p className="mt-2 text-sm text-red-400">{bioError}</p>
                        )}
                      <div className="flex justify-end gap-2 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                            onClick={handleBioUpdate}
                          disabled={isUpdatingBio}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {isUpdatingBio ? (
                              <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              <>
                              <Check className="w-4 h-4" />
                                Save
                              </>
                            )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setIsEditingBio(false);
                              setBio(user?.bio || '');
                              setBioError(null);
                            }}
                            disabled={isUpdatingBio}
                            className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                          <X className="w-4 h-4" />
                            Cancel
                        </motion.button>
                        </div>
                      </div>
                    ) : (
                    <div className="flex-1 max-w-2xl ml-8">
                        {bio ? (
                          <p className="text-slate-300 whitespace-pre-wrap">{bio}</p>
                        ) : (
                          <p className="text-slate-400 italic">No bio added yet</p>
                        )}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                          onClick={() => setIsEditingBio(true)}
                          className="mt-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2 transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4" />
                          {bio ? 'Edit Bio' : 'Add Bio'}
                      </motion.button>
                      </div>
                    )}
                  </div>
                </div>
            </motion.div>

            {/* Theme Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Theme Settings</h2>
              <div className="space-y-6">
                {/* Theme Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Theme Mode</h3>
                    <p className="text-slate-400 text-sm">Choose your preferred theme</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleThemeUpdate({ ...themeSettings, mode: 'light' })}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                        themeSettings.mode === 'light'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleThemeUpdate({ ...themeSettings, mode: 'dark' })}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                        themeSettings.mode === 'dark'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </motion.button>
                </div>
                </div>

                {/* Primary Color */}
                <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-slate-100">Primary Color</h3>
                    <p className="text-slate-400 text-sm">Choose your theme color</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {themeColors.map((color) => (
                      <motion.button
                        key={color.id}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleThemeUpdate({ ...themeSettings, primaryColor: color.id })}
                        className={`w-8 h-8 rounded-full ${color.color} ${
                          themeSettings.primaryColor === color.id
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900'
                            : ''
                        }`}
                        title={color.name}
                      />
                    ))}
              </div>
            </div>
              </div>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Privacy Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                    <h3 className="text-lg font-medium text-slate-100">Profile Visibility</h3>
                    <p className="text-slate-400 text-sm">Control who can see your profile</p>
                  </div>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => handlePrivacyUpdate({ ...privacySettings, profileVisibility: e.target.value })}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="connections">Connections Only</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Show Email</h3>
                    <p className="text-slate-400 text-sm">Display your email on your profile</p>
                    </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePrivacyUpdate({ ...privacySettings, showEmail: !privacySettings.showEmail })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      privacySettings.showEmail ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                        privacySettings.showEmail ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                  </motion.button>
                  </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Show Activity</h3>
                    <p className="text-slate-400 text-sm">Display your activity on your profile</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handlePrivacyUpdate({ ...privacySettings, showActivity: !privacySettings.showActivity })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      privacySettings.showActivity ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                        privacySettings.showActivity ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Preferences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Language</h3>
                    <p className="text-slate-400 text-sm">Choose your preferred language</p>
                  </div>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferencesUpdate({ ...preferences, language: e.target.value })}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Time Zone</h3>
                    <p className="text-slate-400 text-sm">Set your local time zone</p>
                  </div>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => handlePreferencesUpdate({ ...preferences, timezone: e.target.value })}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  >
                    {Intl.supportedValuesOf('timeZone').map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Date Format</h3>
                    <p className="text-slate-400 text-sm">Choose your preferred date format</p>
                  </div>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => handlePreferencesUpdate({ ...preferences, dateFormat: e.target.value })}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Accessibility Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Accessibility Settings</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Screen Reader</h3>
                    <p className="text-slate-400 text-sm">Enable screen reader support</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccessibilityUpdate({ ...accessibilitySettings, screenReader: !accessibilitySettings.screenReader })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      accessibilitySettings.screenReader ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                        accessibilitySettings.screenReader ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">High Contrast</h3>
                    <p className="text-slate-400 text-sm">Enable high contrast mode</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccessibilityUpdate({ ...accessibilitySettings, highContrast: !accessibilitySettings.highContrast })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      accessibilitySettings.highContrast ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                        accessibilitySettings.highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Reduced Motion</h3>
                    <p className="text-slate-400 text-sm">Reduce animation effects</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAccessibilityUpdate({ ...accessibilitySettings, reducedMotion: !accessibilitySettings.reducedMotion })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      accessibilitySettings.reducedMotion ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                        accessibilitySettings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Font Size Control */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Font Size</h3>
                    <p className="text-slate-400 text-sm">Adjust the text size across the application</p>
                  </div>
                  
                  {/* Font Size Preview */}
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="space-y-2">
                      <p 
                        className="text-slate-300 transition-all duration-300"
                        style={{ fontSize: `${accessibilitySettings.fontSize || 16}px` }}
                      >
                        Preview Text Size
                      </p>
                      <p 
                        className="text-slate-400 transition-all duration-300"
                        style={{ fontSize: `${(accessibilitySettings.fontSize || 16) * 0.875}px` }}
                      >
                        Secondary text size
                      </p>
                      <p 
                        className="text-slate-500 transition-all duration-300"
                        style={{ fontSize: `${(accessibilitySettings.fontSize || 16) * 0.75}px` }}
                      >
                        Small text size
                      </p>
                    </div>
                  </div>

                  {/* Font Size Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleAccessibilityUpdate({ 
                        ...accessibilitySettings, 
                        fontSize: Math.max(12, (accessibilitySettings.fontSize || 16) - 2)
                      })}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={(accessibilitySettings.fontSize || 16) <= 12}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex justify-between text-sm text-slate-400 mb-2">
                        <span>Small</span>
                        <span>Medium</span>
                        <span>Large</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        step="2"
                        value={accessibilitySettings.fontSize || 16}
                        onChange={(e) => handleAccessibilityUpdate({
                          ...accessibilitySettings,
                          fontSize: parseInt(e.target.value)
                        })}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>12px</span>
                        <span>16px</span>
                        <span>20px</span>
                        <span>24px</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAccessibilityUpdate({ 
                        ...accessibilitySettings, 
                        fontSize: Math.min(24, (accessibilitySettings.fontSize || 16) + 2)
                      })}
                      className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={(accessibilitySettings.fontSize || 16) >= 24}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preset Sizes */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { size: 12, label: 'XS' },
                      { size: 14, label: 'S' },
                      { size: 16, label: 'M' },
                      { size: 18, label: 'L' },
                      { size: 20, label: 'XL' },
                      { size: 24, label: 'XXL' }
                    ].map(({ size, label }) => (
                      <button
                        key={size}
                        onClick={() => handleAccessibilityUpdate({
                          ...accessibilitySettings,
                          fontSize: size
                        })}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          (accessibilitySettings.fontSize || 16) === size
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Reset Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleAccessibilityUpdate({
                        ...accessibilitySettings,
                        fontSize: 16
                      })}
                      className="text-sm text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Data Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Data Management</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Export Data</h3>
                    <p className="text-slate-400 text-sm">Download all your data</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportData}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2 transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </motion.button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Import Data</h3>
                    <p className="text-slate-400 text-sm">Import your data from a file</p>
                  </div>
                  <motion.label
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2 cursor-pointer transition-colors duration-200"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </motion.label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100 text-rose-400">Delete Account</h3>
                    <p className="text-slate-400 text-sm">Permanently delete your account and all data</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 flex items-center gap-2 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </motion.button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Account Modal */}
        <AnimatePresence>
          {showDeleteAccountModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 rounded-xl border border-slate-700/50 shadow-xl w-full max-w-md"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-slate-100">Delete Account</h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowDeleteAccountModal(false)}
                      className="text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

          <div className="space-y-6">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                <p className="text-rose-400 text-sm">
                  Warning: This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>
              <p className="text-slate-400">
                To confirm deletion, please type <span className="text-rose-400 font-mono">DELETE</span> in the box below.
              </p>
              <div className="relative">
                <input
                  type="text"
                  value={deleteAccountConfirmation}
                  onChange={(e) => setDeleteAccountConfirmation(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all duration-300"
                  placeholder="Type DELETE to confirm"
                />
              </div>
            </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                onClick={() => setShowDeleteAccountModal(false)}
                      className="px-4 py-2 text-slate-300 hover:text-slate-100 transition-colors duration-200"
              >
                Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                onClick={handleDeleteAccount}
                disabled={deleteAccountConfirmation !== 'DELETE' || isDeletingAccount}
                      className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {isDeletingAccount ? (
                  <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </>
                )}
                    </motion.button>
            </div>
          </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">2FA Status</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {is2FAEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                  </div>
                  <motion.div
                    className={`w-12 h-12 rounded-lg ${is2FAEnabled ? 'bg-emerald-500/20' : 'bg-slate-500/20'} flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Shield className={`w-6 h-6 ${is2FAEnabled ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Active Sessions</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {sessions?.length || 0}
                  </div>
                </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Monitor className="w-6 h-6 text-blue-400" />
                  </motion.div>
            </div>
          </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Last Password Change</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {user?.lastPasswordChange ? new Date(user.lastPasswordChange).toLocaleDateString() : 'Never'}
              </div>
              </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Key className="w-6 h-6 text-purple-400" />
                  </motion.div>
            </div>
              </motion.div>
          </div>

            {/* Main Security Settings */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Password Management */}
          <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-100">Password Management</h2>
                  <button 
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2 transition-colors"
                  >
                    {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPassword.current ? 'Hide' : 'Show'} Password
                  </button>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      placeholder="Enter current password"
                      disabled={isUpdatingPassword}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                  <input
                        type={showPassword.current ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="Enter new password"
                      disabled={isUpdatingPassword}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                  <input
                        type={showPassword.current ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="Confirm new password"
                      disabled={isUpdatingPassword}
                    />
                </div>
                </div>
                {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-lg ${
                        passwordError.type === 'success' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                    {passwordError.message}
                    </motion.div>
                )}
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                    className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                  Update Password
                    </>
                  )}
                </button>
              </form>
              </motion.div>

            {/* Two-Factor Authentication */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100
                }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-semibold text-slate-100"
                  >
                    Two-Factor Authentication
                  </motion.h2>
                    <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => is2FAEnabled ? handleDisable2FA() : handleSetup2FA()}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all duration-300 ${
                      is2FAEnabled
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:shadow-lg hover:shadow-rose-500/10'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10'
                    }`}
                  >
                    {is2FAEnabled ? (
                      <motion.div
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2"
                      >
                        <ShieldOff className="w-4 h-4" />
                        Disable 2FA
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Enable 2FA
                      </motion.div>
                    )}
                  </motion.button>
                </div>
                {is2FAEnabled ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-4"
                    >
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
                    >
                      <p className="text-emerald-400 text-sm flex items-center gap-2">
                        <motion.div
                          animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          <Shield className="w-4 h-4" />
                        </motion.div>
                        Two-factor authentication is enabled. Your account is protected with an additional layer of security.
                      </p>
                    </motion.div>
                        <motion.button
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setShowRecoveryCodes(true)}
                          className="w-full px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-slate-700/20"
                        >
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            <Key className="w-4 h-4" />
                          </motion.div>
                          View Recovery Codes
                        </motion.button>
                    </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                  >
                    {otpAuthUrl ? (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5,
                            type: "spring",
                            stiffness: 100
                          }}
                          className="glass-pro rounded-lg border border-slate-700/50 p-6 space-y-8 flex flex-col items-center"
                        >
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-400 text-sm mb-4"
                          >
                            Scan this QR code with your authenticator app (like Google Authenticator or Authy)
                          </motion.p>
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex justify-center p-4 bg-slate-800/30 rounded-lg border-2 border-emerald-500/30 shadow-lg relative min-h-[220px] hover:shadow-emerald-500/20 transition-all duration-300" 
                            id="qrcode-container"
                          >
                            {qrLoading && (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-lg z-10"
                              >
                                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                              </motion.div>
                            )}
                          </motion.div>
                          <div className="flex justify-center mt-2">
                            <button
                              ref={qrDownloadRef}
                              onClick={() => {
                                if (qrCodeInstance) {
                                  qrCodeInstance.download({ name: '2fa-qr', extension: 'png' });
                                }
                              }}
                              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400 flex items-center gap-2 transition-colors duration-200 text-sm border border-emerald-500/20"
                              type="button"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                              Download QR
                            </button>
                          </div>
                          {/* Manual Entry */}
                          <div className="w-full space-y-4 border-t border-slate-700/50 pt-6 mt-6">
                              <p className="text-slate-400 text-sm">
                                 Or manually enter the code:
                              </p>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Key className="w-4 h-4 text-slate-400" />
                                  <p className="text-slate-400 text-sm font-medium">
                                    Manual Entry Key
                                  </p>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    navigator.clipboard.writeText(secretKey);
                                    toast.info('Secret key copied to clipboard!');
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition-colors duration-200 text-sm"
                                  title="Copy secret key"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </motion.button>
                              </div>
                              <div className="relative">
                                <code className="block w-full bg-slate-900/50 border border-slate-700/50 px-4 py-3 rounded-lg text-slate-300 select-all font-mono text-sm tracking-wider">
                                  {secretKey.match(/.{1,4}/g)?.join(' ')}
                                </code>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-full h-full bg-gradient-to-r from-transparent via-slate-800/20 to-transparent" />
                                </div>
                              </div>
                              <p className="text-slate-500 text-xs text-center mt-2">
                                Enter this key manually in your authenticator app if you can't scan the QR code
                              </p>
                          </div>
                        </motion.div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Verification Code
                            </label>
                            <div className="flex gap-2 justify-center">
                              {verificationDigits.map((digit, index) => (
                                <input
                                  key={index}
                                  ref={el => inputRefs.current[index] = el}
                                  type="text"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleVerificationDigitChange(index, e.target.value)}
                                  onKeyDown={(e) => handleVerificationKeyDown(index, e)}
                                  className="w-12 h-12 text-center text-xl font-semibold bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                                  placeholder="-"
                                />
                              ))}
                            </div>
                            <p className="text-slate-400 text-sm mt-2 text-center">
                              Enter the 6-digit code from your authenticator app
                            </p>
                          </div>
                          {twoFAError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                              <p className="text-rose-400 text-sm">{twoFAError}</p>
                            </div>
                          )}
                          <div className="flex gap-3">
                            <button
                              onClick={handleVerify2FA}
                              disabled={isVerifying2FA || !verificationCode}
                              className="flex-1 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg text-emerald-400 flex items-center justify-center gap-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isVerifying2FA ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Verify & Enable
                                </>
                              )}
                            </button>
                            <motion.button
                              onClick={() => {
                                setOtpAuthUrl('');
                                setSecretKey('');
                                setVerificationCode('');
                                setTwoFAError(null);
                              }}
                              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center justify-center gap-2 transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="p-4 bg-slate-500/10 border border-slate-500/20 rounded-lg"
                        >
                          <p className="text-slate-400 text-sm">
                            Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need to provide a verification code in addition to your password when signing in.
                          </p>
                        </motion.div>
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center gap-2 text-slate-400 text-sm"
                        >
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1.1, 1]
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </motion.div>
                          <span>2FA is currently disabled. Enable it to secure your account.</span>
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Active Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100">Active Sessions</h2>
                  <button
                    onClick={handleRevokeAllSessions}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 flex items-center gap-2 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  Revoke All Sessions
                  </button>
              </div>
              <div className="space-y-4">
                {sessions?.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                        <div className="text-slate-100">{session.device}</div>
                        <div className="text-sm text-slate-400">
                          {session.location} • {session.lastActive}
                  </div>
                      </div>
                    </div>
                          <button
                            onClick={() => handleRevokeSession(session.id)}
                      className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 text-sm flex items-center gap-2 transition-colors duration-200"
                          >
                      <LogOut className="w-4 h-4" />
                      Revoke
                          </button>
                  </motion.div>
                ))}
            </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'snippets' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Snippets Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Total Snippets</div>
                    <div className="text-2xl font-bold text-blue-400">{codeSnippets.length}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Code2 className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Languages Used</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {new Set(codeSnippets.map(s => s.language)).size}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Languages className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Total Tags</div>
                    <div className="text-2xl font-bold text-purple-400">
                      {new Set(codeSnippets.flatMap(s => s.tags)).size}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Tags className="w-6 h-6 text-purple-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search snippets..."
                    className="w-64 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <select className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200">
                  <option value="">All Languages</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddSnippet(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Snippet
              </button>
            </div>

            {/* Add/Edit Snippet Modal */}
            {(showAddSnippet || showEditSnippet) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      {showAddSnippet ? 'Add New Snippet' : 'Edit Snippet'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddSnippet(false);
                        setShowEditSnippet(false);
                        setSnippetForm({
                          title: '',
                          code: '',
                          language: 'javascript',
                          tags: []
                        });
                      }}
                      className="text-slate-400 hover:text-slate-300 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={snippetForm.title}
                        onChange={(e) => setSnippetForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                        placeholder="Enter snippet title"
                      />
                  </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Language
                      </label>
                      <select
                        value={snippetForm.language}
                        onChange={(e) => setSnippetForm(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="csharp">C#</option>
                        <option value="php">PHP</option>
                        <option value="ruby">Ruby</option>
                        <option value="swift">Swift</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Code
                      </label>
                      <textarea
                        value={snippetForm.code}
                        onChange={(e) => setSnippetForm(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full h-48 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 font-mono"
                        placeholder="Enter your code here"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Tags
                      </label>
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                          placeholder="Add a tag and press Enter"
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors duration-200"
                        >
                          Add
                  </button>
                </div>
                      <div className="flex flex-wrap gap-2">
                        {snippetForm.tags.map((tag, index) => (
                          <motion.span
                            key={index}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm flex items-center gap-2"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="text-slate-400 hover:text-slate-300 transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.span>
                        ))}
              </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setShowAddSnippet(false);
                          setShowEditSnippet(false);
                          setSnippetForm({
                            title: '',
                            code: '',
                            language: 'javascript',
                            tags: []
                          });
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={showAddSnippet ? handleAddSnippet : handleEditSnippet}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors duration-200"
                      >
                        {showAddSnippet ? 'Add Snippet' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Snippets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {codeSnippets.map((snippet, index) => (
                <motion.div
                  key={snippet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group"
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-100 group-hover:text-emerald-400 transition-colors duration-200">
                      {snippet.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(snippet)}
                        className="p-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                        title="Edit snippet"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(snippet.code);
                          toast.success('Code copied to clipboard');
                        }}
                        className="p-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSnippet(snippet.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 transition-colors duration-200"
                        title="Delete snippet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400 text-sm">
                      {snippet.language}
                    </span>
                    {snippet.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <pre className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
                    <code className="text-slate-300">{snippet.code}</code>
                  </pre>
                  <div className="mt-4 text-sm text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created: {new Date(snippet.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'learning' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Learning Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Total Learning Hours</div>
                    <div className="text-2xl font-bold text-blue-400">{learningStats.totalHours}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Clock className="w-6 h-6 text-blue-400" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Day Streak</div>
                    <div className="text-2xl font-bold text-emerald-400">{learningStats.streak}</div>
              </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </motion.div>
                  </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Completed Paths</div>
                    <div className="text-2xl font-bold text-purple-400">{learningStats.completedPaths}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Target className="w-6 h-6 text-purple-400" />
                  </motion.div>
                  </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300 group"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Skills Mastered</div>
                    <div className="text-2xl font-bold text-rose-400">{learningStats.skillsMastered}</div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Award className="w-6 h-6 text-rose-400" />
                  </motion.div>
                </div>
              </motion.div>
              </div>

            {/* Learning Paths */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-100">Learning Paths</h3>
                  <button
                    onClick={() => setShowAddPath(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Path
                  </button>
                  </div>
                <div className="space-y-4">
                  {learningPaths.map((path, index) => (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-slate-100 group-hover:text-emerald-400 transition-colors duration-200">
                          {path.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPath(path)}
                            className="p-2 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                            title="Edit path"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePath(path.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 transition-colors duration-200"
                            title="Delete path"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                  </div>
                </div>
                      <p className="text-slate-400 text-sm mb-4">{path.description}</p>
                      <div className="space-y-3">
                        {path.skills.map((skill, skillIndex) => (
                          <div key={skillIndex} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">{skill.name}</span>
                              <span className="text-slate-400">{skill.level}</span>
              </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-emerald-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.progress}%` }}
                                transition={{ duration: 1, delay: 0.2 * skillIndex }}
                              />
            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="text-slate-400">
                          Next: {path.nextMilestone}
                        </div>
                        <div className="text-emerald-400">
                          Est. {path.estimatedCompletion}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            {/* Learning Calendar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-100">Learning Schedule</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={learningCalendar.view}
                    onChange={(e) => setLearningCalendar(prev => ({ ...prev, view: e.target.value }))}
                      className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                  <button
                    onClick={() => setShowAddEvent(true)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Event
                  </button>
                </div>
              </div>
                <div className="grid grid-cols-7 gap-4 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-slate-400 font-medium">
                    {day}
                  </div>
                ))}
                {/* Calendar grid implementation */}
              </div>
                <div className="space-y-4">
                  {learningCalendar.events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 group"
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-slate-100 group-hover:text-emerald-400 transition-colors duration-200">
                            {event.title}
                          </h4>
                          <p className="text-slate-400 text-sm mt-1">{event.description}</p>
            </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </span>
                <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 transition-colors duration-200"
                            title="Delete event"
                >
                            <Trash2 className="w-4 h-4" />
                </button>
              </div>
              </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Skill Tree */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-100">Skill Tree</h3>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillTree.nodes.map((skill, index) => (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 group"
                    whileHover={{ scale: 1.02, y: -2 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-slate-100 group-hover:text-emerald-400 transition-colors duration-200">
                        {skill.name}
                      </h4>
                      <span className="px-2 py-1 bg-slate-700 rounded-lg text-slate-300 text-sm">
                        {skill.level}
                      </span>
                      </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-slate-300">{skill.progress}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-emerald-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 * index }}
                              />
                            </div>
                            </div>
                    {skill.prerequisites.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm text-slate-400 mb-2">Prerequisites:</div>
                        <div className="flex flex-wrap gap-2">
                          {skill.prerequisites.map((prereq, prereqIndex) => (
                            <span
                              key={prereqIndex}
                              className="px-2 py-1 bg-slate-700 rounded-lg text-slate-300 text-sm"
                            >
                              {prereq}
                            </span>
                          ))}
                          </div>
                      </div>
                    )}
                  </motion.div>
                        ))}
                      </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Resources Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                        <div>
                    <div className="text-sm text-slate-400">Total Resources</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {Object.values(resourceLibrary).reduce((acc, arr) => acc + arr.length, 0)}
                        </div>
                        </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Bookmark className="w-6 h-6 text-blue-400" />
                  </motion.div>
                      </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">Completed</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {Object.values(resourceLibrary).reduce((acc, arr) => 
                        acc + arr.filter(r => r.status === 'completed').length, 0
                      )}
                    </div>
                  </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                >
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </motion.div>
              </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-400">In Progress</div>
                    <div className="text-2xl font-bold text-amber-400">
                      {Object.values(resourceLibrary).reduce((acc, arr) => 
                        acc + arr.filter(r => r.status === 'in-progress').length, 0
                      )}
                    </div>
                    </div>
                  <motion.div
                    className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Clock className="w-6 h-6 text-amber-400" />
                  </motion.div>
            </div>
          </motion.div>
            </div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="glass-pro rounded-lg border border-slate-700/50 p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2 flex-1">
                  <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={resourceSearch}
                  onChange={e => setResourceSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                <select
                  value={resourceTypeFilter}
                  onChange={e => setResourceTypeFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                >
                  <option value="">All Types</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="docs">Documentation</option>
                  <option value="project">Project</option>
                </select>
                <select
                  value={resourceStatusFilter}
                  onChange={e => setResourceStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                >
                  <option value="">All Statuses</option>
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="bookmarked">Bookmarked</option>
                </select>
              </div>
                <motion.button
                onClick={() => setShowAddResource(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-4 h-4" />
                Add Resource
                </motion.button>
            </div>
            </motion.div>

            {/* Resources Grid */}
            <div className="grid gap-6">
              {Object.entries(resourceLibrary).map(([category, resources], categoryIndex) => {
                const filtered = resources.filter(resource => {
                  const matchesSearch = resource.title.toLowerCase().includes(resourceSearch.toLowerCase());
                  const matchesType = !resourceTypeFilter || resource.type === resourceTypeFilter;
                  const matchesStatus = !resourceStatusFilter || resource.status === resourceStatusFilter;
                  return matchesSearch && matchesType && matchesStatus;
                });
                if (filtered.length === 0) return null;
                return (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: categoryIndex * 0.1 }}
                    className="glass-pro rounded-lg border border-slate-700/50 p-6"
                  >
                    <h4 className="text-lg font-semibold text-white mb-4">{category}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filtered.map((resource, index) => (
                        <motion.div
                          key={resource.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 group"
                          whileHover={{ scale: 1.02, y: -2 }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${
                              resource.type === 'video' ? 'bg-rose-500/20 text-rose-400' :
                              resource.type === 'article' ? 'bg-blue-500/20 text-blue-400' :
                              resource.type === 'docs' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                                {resource.type === 'video' ? <Video className="w-5 h-5" /> :
                                 resource.type === 'article' ? <FileText className="w-5 h-5" /> :
                                 resource.type === 'docs' ? <BookOpen className="w-5 h-5" /> :
                                 <Code2 className="w-5 h-5" />}
                            </div>
                            <div>
                                <h5 className="text-slate-100 group-hover:text-emerald-400 transition-colors duration-200">
                                  {resource.title}
                                </h5>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors duration-200"
                            >
                                  {resource.url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-lg text-sm ${
                                resource.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                resource.status === 'in-progress' ? 'bg-amber-500/20 text-amber-400' :
                                resource.status === 'planned' ? 'bg-blue-500/20 text-blue-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {resource.status}
                              </span>
                              <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditResource(category, resource)}
                                  className="p-1.5 text-slate-400 hover:text-slate-300 transition-colors duration-200"
                              title="Edit resource"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(category, resource.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors duration-200"
                                  title="Delete resource"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                    </div>
                          <div className="mt-4 flex items-center justify-between text-sm">
                            <span className="text-slate-400">
                              Added {new Date(resource.createdAt).toLocaleDateString()}
                            </span>
                    <button
                              onClick={() => window.open(resource.url, '_blank')}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 flex items-center gap-1"
                    >
                              Open
                              <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
                    </div>
          </motion.div>
        )}
      </motion.div>

      {/* Add Resource Modal */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Resource</h3>
              <button
                onClick={() => setShowAddResource(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter resource title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="docs">Documentation</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">URL</label>
                <input
                  type="url"
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter resource URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={resourceForm.category}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Tutorials">Tutorials</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Projects">Projects</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={resourceForm.status}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="bookmarked">Bookmarked</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddResource(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddResource}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                >
                  Add Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Learning Path Modal */}
      {showAddPath && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Learning Path</h3>
              <button
                onClick={() => setShowAddPath(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={pathForm.title}
                  onChange={(e) => setPathForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter path title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={pathForm.description}
                  onChange={(e) => setPathForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter path description"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">Skills</label>
                  <button
                    onClick={handleAddPathSkill}
                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-sm"
                  >
                    Add Skill
                  </button>
                </div>
                <div className="space-y-4">
                  {pathForm.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) => handleUpdateSkill(index, 'name', e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                        placeholder="Skill name"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => handleUpdateSkill(index, 'level', e.target.value)}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <input
                        type="number"
                        value={skill.progress}
                        onChange={(e) => handleUpdateSkill(index, 'progress', parseInt(e.target.value))}
                        className="w-24 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                        min="0"
                        max="100"
                      />
                      <button
                        onClick={() => handleRemoveSkill(index)}
                        className="p-2 text-slate-400 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Next Milestone</label>
                <input
                  type="text"
                  value={pathForm.nextMilestone}
                  onChange={(e) => setPathForm(prev => ({ ...prev, nextMilestone: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter next milestone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Estimated Completion</label>
                <input
                  type="text"
                  value={pathForm.estimatedCompletion}
                  onChange={(e) => setPathForm(prev => ({ ...prev, estimatedCompletion: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., 3 months"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddPath(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPath}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                >
                  Add Path
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Learning Event</h3>
              <button
                onClick={() => setShowAddEvent(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  id="event-title"
                  name="event-title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  id="event-description"
                  name="event-description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    id="event-date"
                    name="event-date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                  <input
                    type="time"
                    id="event-time"
                    name="event-time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  id="event-duration"
                  name="event-duration"
                  value={eventForm.duration}
                  onChange={(e) => setEventForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  min="15"
                  step="15"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Skill</h3>
              <button
                onClick={() => setShowAddSkill(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Skill Name</label>
                <input
                  type="text"
                  id="skill-name"
                  name="skill-name"
                  value={skillForm.name}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter skill name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <input
                  type="text"
                  id="skill-category"
                  name="skill-category"
                  value={skillForm.category}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter skill category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                <select
                  id="skill-level"
                  name="skill-level"
                  value={skillForm.level}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Progress (%)</label>
                <input
                  type="number"
                  id="skill-progress"
                  name="skill-progress"
                  value={skillForm.progress}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  min="0"
                  max="100"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Add Milestone</h3>
              <button
                onClick={() => setShowAddMilestone(false)}
                className="text-slate-400 hover:text-slate-300"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter milestone title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter milestone description"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Target Date</label>
                <input
                  type="date"
                  value={milestoneForm.targetDate}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, targetDate: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Associated Path</label>
                <select
                  value={milestoneForm.associatedPath}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, associatedPath: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">None</option>
                  {learningPaths.map(path => (
                    <option key={path.id} value={path.id}>{path.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowAddMilestone(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMilestone}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                >
                  Add Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Profile; 