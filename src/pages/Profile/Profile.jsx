import React, { useRef, useState, useEffect } from 'react';
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
  ChevronLeft
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

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
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

  // 2FA states
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
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
  }, []);

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
        setQrCode(response.data.data.qrCode);
        setSecretKey(response.data.data.secretKey);
      }
    } catch (error) {
      setTwoFAError(error.response?.data?.message || 'Failed to setup 2FA');
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
        setQrCode('');
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
        setQrCode('');
        setSecretKey('');
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
      // Apply theme changes
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(settings.mode);
      
      // Update CSS variables for colors
      document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
      document.documentElement.style.setProperty('--font-size-base', settings.fontSize);
      
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
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePicture) return;
    setIsUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('picture', profilePicture);
      
      const response = await axiosInstance.put('/api/user/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update user state with new picture URL
      setUser(prev => ({
        ...prev,
        picture: response.data.pictureUrl
      }));
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingPicture(false);
    }
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
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setIsVerifyingEmail(true);
      await axiosInstance.post('/api/auth/verify-email', {
        code: emailVerificationCode,
      });
      setShowEmailVerificationModal(false);
      setEmailVerificationCode('');
      toast.success('Email verified successfully');
    } catch (error) {
      console.error('Error verifying email:', error);
      toast.error('Failed to verify email');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

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
        ? { ...goal, ...goalForm }
        : goal
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
    fontSize: 'medium',
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

  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [emailVerificationCode, setEmailVerificationCode] = useState('');
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  const themeColors = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'rose', name: 'Rose', color: 'bg-rose-500' },
    { id: 'amber', name: 'Amber', color: 'bg-amber-500' }
  ];

  const fontSizeOptions = [
    { id: 'small', name: 'Small', size: 'text-sm' },
    { id: 'medium', name: 'Medium', size: 'text-base' },
    { id: 'large', name: 'Large', size: 'text-lg' },
    { id: 'xlarge', name: 'Extra Large', size: 'text-xl' }
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
              {user?.picture ? (
                <>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <motion.img
                      src={`https://images.weserv.nl/?url=${encodeURIComponent(user.picture)}&w=160&h=160&fit=cover&mask=circle&output=webp`}
                    alt="Profile"
                      className="relative w-full h-full rounded-full border-2 border-slate-700 group-hover:border-slate-600 transition-all duration-300"
                    style={{
                      opacity: profileImageLoaded ? 1 : 0,
                      transform: `scale(${profileImageLoaded ? 1 : 0.95})`,
                      transition: "all 0.3s ease-in-out",
                    }}
                    onError={(e) => {
                      console.error('Error loading profile picture:', e);
                      e.target.style.display = 'none';
                      setProfileImageLoaded(false);
                    }}
                      onLoad={() => setProfileImageLoaded(true)}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                    <motion.div
                      className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-2.5 shadow-lg cursor-pointer hover:bg-emerald-600 transition-colors"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <Edit className="w-5 h-5 text-white" />
                    </motion.div>
                </>
              ) : (
                <motion.div 
                    className="relative w-full h-full rounded-full border-2 border-slate-700 bg-slate-800 flex items-center justify-center group-hover:border-slate-600 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                    <User className="w-20 h-20 text-slate-600" />
                </motion.div>
              )}
            </motion.div>

              {/* Enhanced Basic Info */}
              <motion.div 
                className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-col items-center lg:items-start gap-2">
                  <h1 className="text-4xl font-bold text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
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
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Mail className="w-4 h-4" />
                  {user?.email || 'No email provided'}
                </motion.span>
                <motion.span 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="w-4 h-4" />
                  Joined March 2024
                </motion.span>
                <motion.span 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Globe className="w-4 h-4" />
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
              className="flex gap-8 overflow-x-auto scrollbar-hide whitespace-nowrap select-none scroll-smooth"
            >
            {tabs.map((tab) => (
                <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Recent Activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-100">Recent Activity</h2>
                <button className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  View All
                </button>
              </div>
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass-pro rounded-lg border border-slate-700/50 p-4 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-2 ${activity.color}`}>
                      <activity.icon className="w-full h-full" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-100">
                          {activity.title}
                        </h3>
                        <span className="text-sm text-slate-400">{activity.date}</span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Achievements */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-100">Achievements</h2>
                <button className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  View All
                </button>
              </div>
              <div className="grid gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass-pro rounded-lg border border-slate-700/50 p-4 hover:border-slate-600/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-3 ${achievement.color}`}>
                        <achievement.icon className="w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-slate-100">
                            {achievement.title}
                          </h3>
                          <span className="text-sm text-slate-400">{achievement.date}</span>
                        </div>
                        <p className="text-slate-400 text-sm mt-1">
                          {achievement.description}
                        </p>
                        <div className="mt-2">
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${achievement.color.replace('text', 'bg')} rounded-full`}
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-slate-400">Progress</span>
                            <span className="text-xs text-slate-400">{achievement.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-100">Achievements</h2>
              <div className="flex items-center gap-4">
                <select
                  value={achievementFilter}
                  onChange={(e) => setAchievementFilter(e.target.value)}
                  className="bg-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="bg-slate-800 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="progress">Sort by Progress</option>
                  <option value="title">Sort by Title</option>
                </select>
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
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Achievement
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-4 ${achievement.color}`}>
                    <achievement.icon className="w-full h-full" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditAchievement(achievement)}
                        className="text-slate-400 hover:text-slate-300 p-2 rounded-lg hover:bg-slate-700/50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAchievement(achievement.id)}
                        className="text-slate-400 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-700/50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 text-center mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-slate-400 text-center mb-4">
                    {achievement.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-slate-300">{achievement.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${achievement.color.replace('text', 'bg')} rounded-full`}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-slate-400">
                        {achievementCategories.find(c => c.id === achievement.category)?.label}
                      </span>
                      <span className={`text-sm ${achievementBadges.find(b => b.id === achievement.badge)?.color}`}>
                        {achievementBadges.find(b => b.id === achievement.badge)?.label}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 text-center mt-2">
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
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-100">Activity History</h2>
              <div className="flex items-center gap-4">
                <button className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>
            </div>
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass-pro rounded-lg border border-slate-700/50 p-6 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-3 ${activity.color}`}>
                    <activity.icon className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-slate-100">
                        {activity.title}
                      </h3>
                      <span className="text-sm text-slate-400">{activity.date}</span>
                    </div>
                    <p className="text-slate-400 mt-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activity.type === 'problem_solved' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'achievement' ? 'bg-emerald-500/20 text-emerald-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {activity.type === 'problem_solved' ? 'Problem Solved' :
                         activity.type === 'achievement' ? 'Achievement' :
                         'Community'}
                      </span>
                      <button className="text-sm text-slate-400 hover:text-slate-300 flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Problem Solving Stats */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold text-slate-100 mb-6">Problem Solving Stats</h2>
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                        {stat.number}
                      </div>
                      <div className="text-slate-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Distribution */}
              <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
                <h2 className="text-xl font-semibold text-slate-100 mb-6">Language Distribution</h2>
                <div className="space-y-4">
                  {languages.map((language, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300">{language.name}</span>
                        <span className="text-slate-400">{language.percentage}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${language.color} rounded-full`} style={{ width: `${language.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Difficulty Distribution</h2>
              <div className="space-y-4">
                {difficultyStats.map((stat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">{stat.level}</span>
                      <span className="text-slate-400">{stat.solved}/{stat.total}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stat.color} rounded-full`} 
                        style={{ width: `${(stat.solved / stat.total) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Category Distribution</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {categories.map((category, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">{category.name}</span>
                      <span className="text-slate-400">{category.solved}/{category.total}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${category.color} rounded-full`} 
                        style={{ width: `${(category.solved / category.total) * 100}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
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
            {/* Profile Settings */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
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
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img src={profilePicturePreview} alt="Profile preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                        />
                      </label>
                      {profilePicture && (
                        <button
                          onClick={handleSaveProfilePicture}
                          disabled={isUploadingPicture}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUploadingPicture ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Save
                            </>
                          )}
                        </button>
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
                        className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                        placeholder="Enter new name"
                        disabled={isUpdating}
                      />
                      <button
                        onClick={handleNameUpdate}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(user?.name || '');
                          setUpdateError(null);
                        }}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2"
                    >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Email</h3>
                    <p className="text-slate-400 text-sm">Update your email address</p>
                    <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowEmailVerificationModal(true)}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Verify Email
                    </button>
                  <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                      Change
                  </button>
                </div>
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Theme Settings</h2>
              <div className="space-y-6">
                {/* Theme Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Theme Mode</h3>
                    <p className="text-slate-400 text-sm">Choose your preferred theme</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleThemeUpdate({ ...themeSettings, mode: 'light' })}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        themeSettings.mode === 'light'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button
                      onClick={() => handleThemeUpdate({ ...themeSettings, mode: 'dark' })}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        themeSettings.mode === 'dark'
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                  </button>
                </div>
                </div>

                {/* Primary Color */}
                <div>
                  <h3 className="text-lg font-medium text-slate-100 mb-4">Primary Color</h3>
                  <div className="flex items-center gap-4">
                    {themeColors.map(color => (
                      <button
                        key={color.id}
                        onClick={() => handleThemeUpdate({ ...themeSettings, primaryColor: color.id })}
                        className={`w-8 h-8 rounded-full ${color.color} ${
                          themeSettings.primaryColor === color.id
                            ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white'
                            : ''
                        }`}
                        title={color.name}
                      />
                    ))}
              </div>
            </div>

                {/* Font Size */}
                <div>
                  <h3 className="text-lg font-medium text-slate-100 mb-4">Font Size</h3>
                  <div className="flex items-center gap-4">
                    {fontSizeOptions.map(option => (
                      <button
                        key={option.id}
                        onClick={() => handleThemeUpdate({ ...themeSettings, fontSize: option.id })}
                        className={`px-4 py-2 rounded-lg ${
                          themeSettings.fontSize === option.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Privacy Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                    <h3 className="text-lg font-medium text-slate-100">Profile Visibility</h3>
                    <p className="text-slate-400 text-sm">Control who can see your profile</p>
                  </div>
                  <select
                    value={privacySettings.profileVisibility}
                    onChange={(e) => handlePrivacyUpdate({ ...privacySettings, profileVisibility: e.target.value })}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <button
                    onClick={() => handlePrivacyUpdate({ ...privacySettings, showEmail: !privacySettings.showEmail })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacySettings.showEmail ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacySettings.showEmail ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Show Activity</h3>
                    <p className="text-slate-400 text-sm">Display your activity on your profile</p>
                  </div>
                  <button
                    onClick={() => handlePrivacyUpdate({ ...privacySettings, showActivity: !privacySettings.showActivity })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacySettings.showActivity ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacySettings.showActivity ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Language</h3>
                    <p className="text-slate-400 text-sm">Choose your preferred language</p>
                  </div>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferencesUpdate({ ...preferences, language: e.target.value })}
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Accessibility Settings */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Accessibility</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Screen Reader</h3>
                    <p className="text-slate-400 text-sm">Enable screen reader support</p>
                  </div>
                  <button
                    onClick={() => handleAccessibilityUpdate({ ...accessibilitySettings, screenReader: !accessibilitySettings.screenReader })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.screenReader ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.screenReader ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">High Contrast</h3>
                    <p className="text-slate-400 text-sm">Enable high contrast mode</p>
                  </div>
                  <button
                    onClick={() => handleAccessibilityUpdate({ ...accessibilitySettings, highContrast: !accessibilitySettings.highContrast })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.highContrast ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.highContrast ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Reduced Motion</h3>
                    <p className="text-slate-400 text-sm">Reduce animations and transitions</p>
                  </div>
                  <button
                    onClick={() => handleAccessibilityUpdate({ ...accessibilitySettings, reducedMotion: !accessibilitySettings.reducedMotion })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      accessibilitySettings.reducedMotion ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        accessibilitySettings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Data Management</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Export Data</h3>
                    <p className="text-slate-400 text-sm">Download all your data</p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Import Data</h3>
                    <p className="text-slate-400 text-sm">Import your data from a file</p>
                  </div>
                  <label className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100 text-rose-400">Delete Account</h3>
                    <p className="text-slate-400 text-sm">Permanently delete your account and all data</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Email Verification Modal */}
        {showEmailVerificationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Verify Email</h2>
              <div className="space-y-4">
                <p className="text-slate-400">
                  Enter the verification code sent to your email address.
                </p>
                <input
                  type="text"
                  value={emailVerificationCode}
                  onChange={(e) => setEmailVerificationCode(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter verification code"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowEmailVerificationModal(false)}
                    className="px-4 py-2 text-slate-300 hover:text-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyEmail}
                    disabled={isVerifyingEmail}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingEmail ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Account Modal */}
        {showDeleteAccountModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-semibold text-slate-100 mb-4">Delete Account</h2>
              <div className="space-y-4">
                <p className="text-slate-400">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
                <p className="text-slate-400">
                  Type <span className="text-rose-400 font-mono">DELETE</span> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteAccountConfirmation}
                  onChange={(e) => setDeleteAccountConfirmation(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-rose-500"
                  placeholder="Type DELETE to confirm"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteAccountModal(false)}
                    className="px-4 py-2 text-slate-300 hover:text-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteAccountConfirmation !== 'DELETE' || isDeletingAccount}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Password Settings */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Password Settings</h2>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                      placeholder="Enter current password"
                      disabled={isUpdatingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                  <input
                      type={showPassword.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                    placeholder="Enter new password"
                      disabled={isUpdatingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                  <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                    placeholder="Confirm new password"
                      disabled={isUpdatingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                </div>
                {passwordError && (
                  <div className={`text-sm ${passwordError.type === 'error' ? 'text-rose-400' : 'text-emerald-400'} flex items-center gap-2`}>
                    {passwordError.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {passwordError.message}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdatingPassword ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
            </div>

            {/* Two-Factor Authentication */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <h2 className="text-xl font-semibold text-slate-100 mb-6">Two-Factor Authentication</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">2FA Status</h3>
                    <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
                  </div>
                  {!is2FAEnabled ? (
                    <button
                      onClick={handleSetup2FA}
                      disabled={isSettingUp2FA}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSettingUp2FA ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Setting up...
                        </>
                      ) : (
                        <>
                    <Key className="w-4 h-4" />
                          Enable 2FA
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          className="w-32 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={handleDisable2FA}
                          disabled={verificationCode.length !== 6 || isVerifying2FA}
                          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifying2FA ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Disabling...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              Disable 2FA
                            </>
                          )}
                  </button>
                </div>
                    </div>
                  )}
                </div>

                {/* 2FA Setup */}
                {qrCode && (
                  <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="text-lg font-medium text-slate-100 mb-4">Setup Instructions</h4>
                    <div className="space-y-4">
                      <p className="text-slate-300 text-sm">
                        1. Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                      </p>
                      <div className="flex justify-center">
                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                      </div>
                      <p className="text-slate-300 text-sm">
                        2. Or manually enter this secret key in your authenticator app:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="px-3 py-2 bg-slate-900 rounded-lg text-emerald-400 font-mono text-sm">
                          {secretKey}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(secretKey)}
                          className="p-2 text-slate-400 hover:text-slate-300"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-slate-300 text-sm">
                        3. Enter the 6-digit code from your authenticator app:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          className="w-32 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          onClick={handleVerify2FA}
                          disabled={verificationCode.length !== 6 || isVerifying2FA}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifying2FA ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Verify
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recovery Codes */}
                {is2FAEnabled && (
                  <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-slate-100">Recovery Codes</h3>
                    <p className="text-slate-400 text-sm">Generate new recovery codes</p>
                  </div>
                      <button
                        onClick={handleGenerateRecoveryCodes}
                        disabled={isGeneratingRecoveryCodes}
                        className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingRecoveryCodes ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          <>
                    <RefreshCw className="w-4 h-4" />
                    Generate
                          </>
                        )}
                  </button>
                </div>

                    {showRecoveryCodes && recoveryCodes.length > 0 && (
                      <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-slate-100">Your Recovery Codes</h4>
                          <button
                            onClick={() => navigator.clipboard.writeText(recoveryCodes.join('\n'))}
                            className="p-2 text-slate-400 hover:text-slate-300"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
              </div>
                        <p className="text-slate-300 text-sm mb-4">
                          Save these recovery codes in a secure place. You can use them to access your account if you lose your authenticator device.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {recoveryCodes.map((code, index) => (
                            <code key={index} className="px-3 py-2 bg-slate-900 rounded-lg text-emerald-400 font-mono text-sm">
                              {code}
                            </code>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {twoFAError && (
                  <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm">{twoFAError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Session Management */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-100">Session Management</h2>
                {sessions.length > 1 && (
                  <button
                    onClick={handleRevokeAllSessions}
                    className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Revoke All Other Sessions
                  </button>
                )}
              </div>
              
              {sessionError && (
                <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{sessionError}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    No active sessions found
                  </div>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                        <h3 className="text-lg font-medium text-slate-100">
                          {session.deviceInfo.browser} on {session.deviceInfo.os}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {session.deviceInfo.ip} • {session.lastActive}
                        </p>
                  </div>
                      <div className="flex items-center gap-4">
                        {session.isCurrent ? (
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                    Current
                  </span>
                        ) : (
                          <button
                            onClick={() => handleRevokeSession(session.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Revoke session"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'snippets' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-100">Code Snippets</h2>
              <button
                onClick={() => setShowAddSnippet(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Snippet
              </button>
            </div>

            {/* Add/Edit Snippet Modal */}
            {(showAddSnippet || showEditSnippet) && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl">
                  <div className="flex items-center justify-between mb-4">
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
                      className="text-slate-400 hover:text-slate-300"
                    >
                      <XCircle className="w-5 h-5" />
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
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
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
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
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
                        className="w-full h-48 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
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
                          className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                          placeholder="Add a tag and press Enter"
                        />
                        <button
                          onClick={handleAddTag}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                        >
                          Add
                  </button>
                </div>
                      <div className="flex flex-wrap gap-2">
                        {snippetForm.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-slate-700 rounded-full text-slate-300 text-sm flex items-center gap-2"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="text-slate-400 hover:text-slate-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </span>
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
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={showAddSnippet ? handleAddSnippet : handleEditSnippet}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                      >
                        {showAddSnippet ? 'Add Snippet' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {codeSnippets.map((snippet) => (
                <div key={snippet.id} className="glass-pro rounded-lg border border-slate-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-slate-100">{snippet.title}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(snippet)}
                        className="p-2 text-slate-400 hover:text-slate-300"
                        title="Edit snippet"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(snippet.code)}
                        className="p-2 text-slate-400 hover:text-slate-300"
                        title="Copy code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSnippet(snippet.id)}
                        className="p-2 text-slate-400 hover:text-rose-400"
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
                      <span key={index} className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400 text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <pre className="p-4 bg-slate-900 rounded-lg overflow-x-auto">
                    <code className="text-slate-300">{snippet.code}</code>
                  </pre>
                  <div className="mt-4 text-sm text-slate-400">
                    Created: {new Date(snippet.createdAt).toLocaleDateString()}
                  </div>
                </div>
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
              <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-400" />
      </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{learningStats.totalHours}</div>
                    <div className="text-sm text-slate-400">Total Learning Hours</div>
                  </div>
                </div>
              </div>
              <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{learningStats.streak}</div>
                    <div className="text-sm text-slate-400">Day Streak</div>
                  </div>
                </div>
              </div>
              <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{learningStats.completedPaths}</div>
                    <div className="text-sm text-slate-400">Completed Paths</div>
                  </div>
                </div>
              </div>
              <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-500/20 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{learningStats.skillsMastered}</div>
                    <div className="text-sm text-slate-400">Skills Mastered</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Calendar */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-100">Learning Schedule</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={learningCalendar.view}
                    onChange={(e) => setLearningCalendar(prev => ({ ...prev, view: e.target.value }))}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                  <button
                    onClick={() => setShowAddEvent(true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Event
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-slate-400 font-medium">
                    {day}
                  </div>
                ))}
                {/* Calendar grid implementation */}
              </div>
            </div>

            {/* Skill Tree Visualization */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-100">Skill Tree</h3>
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </button>
              </div>
              <div className="relative h-[400px] bg-slate-900/50 rounded-lg overflow-hidden">
                {/* Skill tree visualization implementation */}
              </div>
            </div>

            {/* Learning Paths Section */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-100">Learning Paths</h3>
                <button
                  onClick={() => setShowAddPath(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Path
                </button>
              </div>

              <div className="space-y-6">
                {learningPaths.map((path) => (
                  <div key={path.id} className="bg-slate-800/50 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-slate-100">{path.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{path.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-400">{path.progress}%</div>
                        <div className="text-sm text-slate-400">Complete</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {path.skills.map((skill, index) => (
                          <div key={index} className="bg-slate-900/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-slate-300">{skill.name}</span>
                              <span className="text-sm text-slate-400">{skill.level}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${skill.progress}%` }}
                              />
                            </div>
                            <div className="text-right mt-1">
                              <span className="text-sm text-slate-400">{skill.progress}%</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div>
                          <div className="text-sm text-slate-400">Next Milestone</div>
                          <div className="text-slate-300">{path.nextMilestone}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-slate-400">Estimated Completion</div>
                          <div className="text-slate-300">{path.estimatedCompletion}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Milestones */}
            <div className="glass-pro rounded-lg border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-100">Learning Milestones</h3>
                <button
                  onClick={() => setShowAddMilestone(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Milestone
                </button>
              </div>

              <div className="space-y-4">
                {learningMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      milestone.completed ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                    }`}>
                      {milestone.completed ? (
                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Target className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-slate-100">{milestone.title}</h4>
                      <p className="text-slate-400 text-sm mt-1">{milestone.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-400">Target Date</div>
                      <div className="text-slate-300">{new Date(milestone.targetDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={resourceSearch}
                  onChange={e => setResourceSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={resourceTypeFilter}
                  onChange={e => setResourceTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none"
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
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="planned">Planned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="bookmarked">Bookmarked</option>
                </select>
              </div>
              <button
                onClick={() => setShowAddResource(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Resource
              </button>
            </div>

            <div className="grid gap-6">
              {Object.entries(resourceLibrary).map(([category, resources]) => {
                // Filter and search logic
                const filtered = resources.filter(resource => {
                  const matchesSearch = resource.title.toLowerCase().includes(resourceSearch.toLowerCase());
                  const matchesType = !resourceTypeFilter || resource.type === resourceTypeFilter;
                  const matchesStatus = !resourceStatusFilter || resource.status === resourceStatusFilter;
                  return matchesSearch && matchesType && matchesStatus;
                });
                if (filtered.length === 0) return null;
                return (
                  <div key={category} className="bg-slate-800/50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">{category}</h4>
                    <div className="space-y-4">
                      {filtered.map(resource => (
                        <div key={resource.id} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              resource.type === 'video' ? 'bg-rose-500/20 text-rose-400' :
                              resource.type === 'article' ? 'bg-blue-500/20 text-blue-400' :
                              resource.type === 'docs' ? 'bg-emerald-500/20 text-emerald-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {resource.type === 'video' ? <Video className="w-4 h-4" /> :
                               resource.type === 'article' ? <FileText className="w-4 h-4" /> :
                               resource.type === 'docs' ? <Book className="w-4 h-4" /> :
                               <Code className="w-4 h-4" />}
                            </div>
                            <div>
                              <h5 className="text-white font-medium">{resource.title}</h5>
                              <p className="text-sm text-slate-400 mt-1">
                                Added {new Date(resource.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              resource.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              resource.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                              resource.status === 'bookmarked' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-slate-500/20 text-slate-400'
                            }`}>
                              {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                            </span>
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-slate-400 hover:text-white"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleEditResource(category, resource)}
                              className="p-2 text-slate-400 hover:text-blue-400"
                              title="Edit resource"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResource(category, resource.id)}
                              className="p-2 text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Edit Resource Modal */}
            {showEditResource && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Edit Resource</h3>
                    <button
                      onClick={() => setShowEditResource(false)}
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
                        value={editResourceForm.title}
                        onChange={e => setEditResourceForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                        placeholder="Enter resource title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                      <select
                        value={editResourceForm.type}
                        onChange={e => setEditResourceForm(prev => ({ ...prev, type: e.target.value }))}
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
                        value={editResourceForm.url}
                        onChange={e => setEditResourceForm(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                        placeholder="Enter resource URL"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                      <select
                        value={editResourceForm.status}
                        onChange={e => setEditResourceForm(prev => ({ ...prev, status: e.target.value }))}
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
                        onClick={() => setShowEditResource(false)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEditResource}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
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
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                  <input
                    type="time"
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
                  value={skillForm.category}
                  onChange={(e) => setSkillForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-emerald-500"
                  placeholder="Enter skill category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                <select
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