export const MENU_ITEMS = [
  // ========================================
  // CORE MANAGEMENT & LISTINGS
  // ========================================
  { id: 0, icon: 'Dashboard', label: 'dashboard', category: 'integrated', badge: 'Live' },

  // Listing Categories (First Priority)
  { id: 1, icon: 'Assignment', label: 'tender', category: 'integrated', badge: 'Live' },
  { id: 2, icon: 'Home', label: 'home', category: 'integrated', badge: 'Live' },
  { id: 3, icon: 'DirectionsCar', label: 'cars', category: 'integrated', badge: 'Live' },
  { id: 4, icon: 'Work', label: 'jobs', category: 'integrated', badge: 'Live' },

  // User & Entity Management
  { id: 17, icon: 'People', label: 'userManagement', category: 'integrated', badge: 'Live' },
  { id: 7, icon: 'Business', label: 'companies', category: 'integrated', badge: 'Live' },

  // System Configuration & Functional Features
  { id: 6, icon: 'Category', label: 'categories', category: 'integrated', badge: 'Live' },
  { id: 9, icon: 'Settings', label: 'systemSettings', category: 'integrated', badge: 'Live' },
  { id: 16, icon: 'BarChart', label: 'reports', category: 'integrated', badge: 'Live' },

  // Payment & Content Management
  { id: 27, icon: 'Payment', label: 'paymentIntegration', category: 'integrated', badge: 'New' },
  { id: 28, icon: 'Star', label: 'membershipPlans', category: 'integrated', badge: 'New' },
  { id: 29, icon: 'Article', label: 'pagesManagement', category: 'integrated', badge: 'New' },
  { id: 30, icon: 'PostAdd', label: 'postTemplates', category: 'integrated', badge: 'New' },
  { id: 31, icon: 'Email', label: 'emailSettings', category: 'integrated', badge: 'New' },

  // ========================================
  // PENDING IMPLEMENTATION (Mock Data) - Hidden for Production Polish
  // ========================================
  // { id: 8, icon: 'TrendingUp', label: 'analytics', category: 'mock' },
  // { id: 10, icon: 'Payments', label: 'financial', category: 'mock' },
  // { id: 11, icon: 'Email', label: 'communication', category: 'mock' },
  // { id: 12, icon: 'Security', label: 'contentModeration', category: 'mock' },
  // { id: 13, icon: 'CardMembership', label: 'membership', category: 'mock' },
  // { id: 14, icon: 'Gavel', label: 'legalCompliance', category: 'mock' },
  // { id: 15, icon: 'Smartphone', label: 'mobileApp', category: 'mock' },
  // { id: 5, icon: 'ManageHome', label: 'homepageManagement', category: 'mock' },

  // ========================================
  // ADVANCED FEATURES - Hidden for Production Polish
  // ========================================
  // { id: 18, icon: 'Security', label: 'security', category: 'advanced' },
  // { id: 19, icon: 'Backup', label: 'backup', category: 'advanced' },
  // { id: 20, icon: 'Api', label: 'apiManagement', category: 'advanced' },
  // { id: 21, icon: 'Support', label: 'support', category: 'advanced' },
  // { id: 22, icon: 'TrendingUp', label: 'advancedAnalytics', category: 'advanced' },
  // { id: 23, icon: 'PlayArrow', label: 'workflow', category: 'advanced' },
  // { id: 24, icon: 'Email', label: 'notifications', category: 'advanced' },
  // { id: 25, icon: 'Api', label: 'integrations', category: 'advanced' },
  // { id: 26, icon: 'Help', label: 'help', category: 'advanced' },
];

export const CATEGORIES = {
  integrated: { label: 'Fully Integrated', color: '#4CAF50', description: 'Backend connected, fully functional' },
  ready: { label: 'Backend Ready', color: '#2196F3', description: 'Backend exists, needs UI connection' },
  mock: { label: 'Needs Implementation', color: '#FF9800', description: 'Using mock data, needs backend' },
  advanced: { label: 'Advanced Features', color: '#9C27B0', description: 'Future implementation' },
};

export const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  active: 'success',
  inactive: 'default',
  completed: 'success',
  failed: 'error',
  processing: 'info',
};

