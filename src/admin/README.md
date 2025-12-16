# YesraSew Admin Dashboard

This directory contains the modular admin dashboard for the YesraSew classifieds platform.

## 📁 Structure

```
src/admin/
├── components/           # Individual screen components
│   ├── DashboardScreen.js
│   ├── TenderScreen.js
│   ├── AnalyticsScreen.js
│   ├── SystemSettingsScreen.js
│   ├── FinancialScreen.js
│   └── ... (more screens)
├── constants/            # Configuration and constants
│   └── menuItems.js
├── utils/               # Utility functions
│   └── statusHelpers.js
├── hooks/               # Custom hooks (for future use)
├── AdminDashboard.js    # Main admin dashboard component
├── AdminLayout.js       # Layout component with navigation
└── README.md           # This file
```

## 🚀 Features

### ✅ Implemented Screens
- **Dashboard**: Overview with stats, recent activity, quick actions
- **Tender Management**: Tender listings with search, filter, and actions
- **Analytics**: Revenue analytics, user growth, category performance
- **System Settings**: General settings, user registration, security options
- **Financial Management**: Revenue overview, transactions, payouts

### 🔄 In Progress
- Additional screens will be added as separate components

## 🛠️ Usage

### Access Routes
- **New Modular Admin**: `/admin` (recommended)
- **Legacy Admin**: `/admin-panel` (backward compatibility)

### Adding New Screens

1. Create a new component in `src/admin/components/`
```javascript
// src/admin/components/NewScreen.js
import React from 'react';
import { Box, Typography } from '@mui/material';

const NewScreen = ({ t }) => {
  return (
    <Box>
      <Typography variant="h6">{t('newScreen')}</Typography>
      {/* Your screen content */}
    </Box>
  );
};

export default NewScreen;
```

2. Import and add to the main AdminDashboard.js
```javascript
import NewScreen from './components/NewScreen';

// In the renderActiveScreen function:
case X: // Your case number
  return <NewScreen t={t} />;
```

3. Add menu item to constants/menuItems.js
```javascript
{ id: X, icon: 'YourIcon', label: 'newScreen', category: 'premium' }
```

## 🎨 Design Principles

### Component Structure
- **Single Responsibility**: Each screen handles one specific admin function
- **Reusable Components**: Shared utilities and constants
- **Props Interface**: Consistent prop passing (t, data, handlers)

### State Management
- **Local State**: Screen-specific state within components
- **Global State**: Shared state in main AdminDashboard component
- **Data Fetching**: Centralized in main component with fallback to mock data

### Styling
- **Material-UI**: Consistent design system
- **Theme Integration**: Uses app theme colors and typography
- **Responsive Design**: Mobile-friendly layouts

## 🔧 Configuration

### Menu Items
Edit `src/admin/constants/menuItems.js` to modify navigation:
```javascript
export const MENU_ITEMS = [
  { id: 0, icon: 'Dashboard', label: 'dashboard', category: 'basic' },
  // Add more items...
];
```

### Status Helpers
Use `src/admin/utils/statusHelpers.js` for consistent status handling:
```javascript
import { getStatusColor, getStatusIcon } from '../utils/statusHelpers';

const color = getStatusColor(status);
const icon = getStatusIcon(status);
```

## 📊 Data Flow

### Backend Integration
1. **Primary**: Uses `adminService` for backend connection
2. **Fallback**: Automatically switches to `mockAdminService` if backend unavailable
3. **Detection**: Shows warning banner when using mock data

### Mock Data
- Realistic Ethiopian marketplace data
- ETB currency formatting
- Ethiopian locations and context

## 🔄 Migration from Legacy

The old monolithic `AdminDashboardFixed.js` is preserved for backward compatibility:
- **Route**: `/admin-panel` continues to work
- **Future**: Can be removed after migration is complete
- **Recommendation**: Use `/admin` for new development

## 🎯 Best Practices

### Component Development
- Keep components focused and single-purpose
- Use translation keys for all user-facing text
- Implement proper loading and error states
- Follow Material-UI design patterns

### Code Organization
- Separate concerns (UI, logic, data)
- Use consistent naming conventions
- Document complex logic
- Implement proper TypeScript types (when added)

### Performance
- Lazy load heavy components
- Optimize re-renders with React.memo
- Use efficient data structures
- Implement proper cleanup

## 🚧 Future Enhancements

### Planned Features
- [ ] Role-based access control
- [ ] Real-time notifications
- [ ] Advanced filtering and search
- [ ] Export functionality
- [ ] Audit logging
- [ ] Multi-language support

### Technical Improvements
- [ ] TypeScript migration
- [ ] Unit testing
- [ ] E2E testing
- [ ] Performance monitoring
- [ ] Error boundary improvements

## 📞 Support

For questions or issues with the admin dashboard:
1. Check this README first
2. Review existing components for patterns
3. Consult the main YesraSew documentation
4. Contact the development team

---

**Version**: 2.1.0  
**Last Updated**: November 2024  
**Maintainer**: YesraSew Development Team
