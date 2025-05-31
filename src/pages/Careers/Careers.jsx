import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import useDebounce from '../../hooks/useDebounce';
import { 
  Users, 
  Code2, 
  Rocket, 
  Award,
  Heart,
  Globe,
  Clock,
  DollarSign,
  Home,
  Coffee,
  BookOpen,
  Briefcase,
  ChevronRight,
  ArrowRight,
  MapPin,
  Building2,
  GraduationCap,
  Sparkles,
  Star,
  CheckCircle2,
  Loader2,
  Filter,
  Search,
  BriefcaseIcon,
  Zap,
  Lightbulb,
  Shield,
  Leaf,
  Palette,
  Music,
  Dumbbell,
  Smile,
  Calendar
} from 'lucide-react';

const Careers = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredJobs, setFilteredJobs] = useState([]);

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

  // Filter jobs based on search query and filters
  useEffect(() => {
    const filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                          job.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === 'all' || job.department === selectedDepartment;
      const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
      const matchesType = selectedType === 'all' || job.type === selectedType;

      return matchesSearch && matchesDepartment && matchesLocation && matchesType;
    });

    setFilteredJobs(filtered);
  }, [debouncedSearchQuery, selectedDepartment, selectedLocation, selectedType]);

  const departments = [
    { id: 'engineering', name: 'Engineering', icon: Code2, color: 'text-blue-400' },
    { id: 'product', name: 'Product', icon: Rocket, color: 'text-emerald-400' },
    { id: 'design', name: 'Design', icon: Palette, color: 'text-purple-400' },
    { id: 'marketing', name: 'Marketing', icon: Zap, color: 'text-rose-400' },
    { id: 'sales', name: 'Sales', icon: BriefcaseIcon, color: 'text-yellow-400' }
  ];

  const locations = [
    { id: 'remote', name: 'Remote', icon: Globe },
    { id: 'san-francisco', name: 'San Francisco', icon: MapPin },
    { id: 'new-york', name: 'New York', icon: MapPin },
    { id: 'london', name: 'London', icon: MapPin }
  ];

  const jobTypes = [
    { id: 'full-time', name: 'Full Time' },
    { id: 'part-time', name: 'Part Time' },
    { id: 'contract', name: 'Contract' },
    { id: 'internship', name: 'Internship' }
  ];

  const benefits = [
    {
      category: 'Health & Wellness',
      items: [
        { icon: Heart, title: 'Comprehensive Health Coverage', description: 'Medical, dental, and vision insurance for you and your family' },
        { icon: Dumbbell, title: 'Fitness Reimbursement', description: 'Monthly stipend for gym memberships and fitness activities' },
        { icon: Coffee, title: 'Mental Health Support', description: 'Access to counseling and mental health resources' }
      ]
    },
    {
      category: 'Work-Life Balance',
      items: [
        { icon: Clock, title: 'Flexible Hours', description: 'Work when you are most productive' },
        { icon: Home, title: 'Remote Work Options', description: 'Work from anywhere in the world' },
        { icon: Calendar, title: 'Unlimited PTO', description: 'Take time off when you need it' }
      ]
    },
    {
      category: 'Learning & Growth',
      items: [
        { icon: BookOpen, title: 'Learning Budget', description: 'Annual budget for courses, books, and conferences' },
        { icon: GraduationCap, title: 'Career Development', description: 'Regular career planning and growth opportunities' },
        { icon: Sparkles, title: 'Conference Attendance', description: 'Opportunities to attend industry conferences' }
      ]
    },
    {
      category: 'Financial Benefits',
      items: [
        { icon: DollarSign, title: 'Competitive Salary', description: 'Market-leading compensation packages' },
        { icon: Award, title: 'Equity Options', description: 'Stock options for all employees' },
        { icon: Shield, title: '401(k) Matching', description: 'Company matching for retirement savings' }
      ]
    }
  ];

  const values = [
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We push boundaries and embrace new ideas',
      color: 'text-yellow-400'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'We believe in the power of working together',
      color: 'text-blue-400'
    },
    {
      icon: Heart,
      title: 'Empathy',
      description: 'We care about our users and each other',
      color: 'text-rose-400'
    },
    {
      icon: Leaf,
      title: 'Sustainability',
      description: 'We build for the long term',
      color: 'text-emerald-400'
    }
  ];

  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      department: 'engineering',
      location: 'remote',
      type: 'full-time',
      description: 'Join our team to build the next generation of developer tools...',
      requirements: [
        '5+ years of experience with React',
        'Strong TypeScript skills',
        'Experience with modern frontend tooling'
      ],
      postedDate: '2 days ago'
    },
    {
      id: 2,
      title: 'Product Designer',
      department: 'design',
      location: 'san-francisco',
      type: 'full-time',
      description: 'Shape the future of developer experience...',
      requirements: [
        '3+ years of product design experience',
        'Strong portfolio showcasing UX/UI work',
        'Experience with developer tools'
      ],
      postedDate: '1 week ago'
    },
    // Add more jobs...
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Implement search logic
  };

  const handleDepartmentChange = (department) => {
    setSelectedDepartment(department);
    // Implement filtering logic
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    // Implement filtering logic
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    // Implement filtering logic
  };

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
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-pro border border-rose-500/20 mb-8 interactive-element"
            >
              <Rocket className="w-5 h-5 text-rose-400" />
              <span className="text-sm font-medium text-slate-300">Join Our Team</span>
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
                Build The Future
              </motion.span>{" "}
              <motion.span 
                className="inline-block bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent align-middle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                With Us
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-xl text-slate-400/80 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Join our mission to revolutionize how developers learn and master algorithms. Be part of a team that's shaping the future of programming education.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-8 pt-8"
            >
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-4xl font-bold ${value.color} mb-2`}>
                    <value.icon className="w-12 h-12 mx-auto" />
                  </div>
                  <div className="text-slate-200 font-semibold">{value.title}</div>
                  <div className="text-slate-400 text-sm">{value.description}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              Why Join CodeStream?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              We offer comprehensive benefits and a supportive environment to help you thrive
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-pro rounded-2xl border border-slate-700/50 p-8"
              >
                <h3 className="text-2xl font-semibold text-slate-100 mb-6">
                  {category.category}
                </h3>
                <div className="space-y-6">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <item.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-slate-200 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-24 bg-navy-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Find the perfect role that matches your skills and aspirations
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="glass-pro rounded-2xl border border-slate-700/50 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedDepartment}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="all">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="all">All Types</option>
                  {jobTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-pro rounded-xl border border-slate-700/50 p-6 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-slate-200">
                          {job.title}
                        </h3>
                        {job.isNew && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{departments.find(d => d.id === job.department)?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{locations.find(l => l.id === job.location)?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>{jobTypes.find(t => t.id === job.type)?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{job.postedDate}</span>
                        </div>
                      </div>
                      <p className="text-slate-400 mb-4">
                        {job.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, reqIndex) => (
                          <span
                            key={reqIndex}
                            className="px-3 py-1 bg-slate-800/50 text-slate-300 rounded-lg text-sm"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2"
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Application Process Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              Our Application Process
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              We make the hiring process transparent and efficient
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: 'Application Review',
                description: 'We review your application and portfolio within 48 hours',
                icon: CheckCircle2
              },
              {
                step: 2,
                title: 'Initial Interview',
                description: 'A casual conversation to learn more about you',
                icon: Users
              },
              {
                step: 3,
                title: 'Technical Assessment',
                description: 'A practical challenge to showcase your skills',
                icon: Code2
              },
              {
                step: 4,
                title: 'Team Interview',
                description: 'Meet the team and discuss potential projects',
                icon: Star
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="glass-pro rounded-2xl border border-slate-700/50 p-8 text-center"
              >
                <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-2">
                  Step {step.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-100 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-400">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
};

export default Careers; 