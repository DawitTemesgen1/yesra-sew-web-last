import { useTheme, useMediaQuery } from '@mui/material';

// Responsive hooks and utilities
export const useResponsive = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    breakpoint: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    }
  };
};

// Responsive grid spacing
export const getResponsiveGridSpacing = (isMobile, isTablet) => {
  if (isMobile) return 1;
  if (isTablet) return 2;
  return 3;
};

// Responsive grid item sizes
export const getResponsiveGridItemSize = (baseSize = 12, isMobile, isTablet) => {
  // Default responsive behavior
  const responsiveSizes = {
    // Full width cards
    12: { xs: 12, sm: 12, md: 12, lg: 12, xl: 12 },
    // Half width cards
    6: { xs: 12, sm: 6, md: 6, lg: 6, xl: 6 },
    // Third width cards
    4: { xs: 12, sm: 6, md: 4, lg: 4, xl: 4 },
    // Quarter width cards
    3: { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 },
    // Two-thirds width
    8: { xs: 12, sm: 12, md: 8, lg: 8, xl: 8 },
  };

  return responsiveSizes[baseSize] || responsiveSizes[12];
};

// Responsive typography
export const getResponsiveTypography = (variant, isMobile, isTablet) => {
  const typographyMap = {
    h1: {
      variant: isMobile ? 'h3' : isTablet ? 'h2' : 'h1',
      fontSize: isMobile ? '2rem' : isTablet ? '2.5rem' : '3rem'
    },
    h2: {
      variant: isMobile ? 'h4' : isTablet ? 'h3' : 'h2',
      fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2rem'
    },
    h3: {
      variant: isMobile ? 'h5' : isTablet ? 'h4' : 'h3',
      fontSize: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem'
    },
    h4: {
      variant: isMobile ? 'h6' : isTablet ? 'h5' : 'h4',
      fontSize: isMobile ? '1.125rem' : isTablet ? '1.25rem' : '1.5rem'
    },
    body1: {
      variant: isMobile ? 'body2' : 'body1',
      fontSize: isMobile ? '0.875rem' : '1rem'
    },
    body2: {
      variant: isMobile ? 'caption' : 'body2',
      fontSize: isMobile ? '0.75rem' : '0.875rem'
    }
  };

  return typographyMap[variant] || typographyMap.body1;
};

// Responsive spacing
export const getResponsiveSpacing = (baseSpacing, isMobile, isTablet) => {
  const spacingMultiplier = isMobile ? 0.5 : isTablet ? 0.75 : 1;
  return baseSpacing * spacingMultiplier;
};

// Responsive card sizing
export const getResponsiveCardProps = (isMobile, isTablet) => ({
  sx: {
    p: isMobile ? 1.5 : isTablet ? 2 : 3,
    m: isMobile ? 0.5 : isTablet ? 1 : 1.5,
    minWidth: isMobile ? 'auto' : isTablet ? 280 : 320,
    maxWidth: isMobile ? '100%' : isTablet ? 400 : 450,
  }
});

// Responsive table props
export const getResponsiveTableProps = (isMobile, isTablet) => ({
  size: isMobile ? 'small' : 'medium',
  sx: {
    '& .MuiTableCell-root': {
      padding: isMobile ? '4px 8px' : isTablet ? '8px 12px' : '12px 16px',
      fontSize: isMobile ? '0.75rem' : isTablet ? '0.875rem' : '1rem',
    },
    '& .MuiTableHead-root .MuiTableCell-root': {
      fontWeight: 600,
      backgroundColor: 'background.paper',
    },
  }
});

// Responsive button props
export const getResponsiveButtonProps = (isMobile, isTablet) => ({
  size: isMobile ? 'small' : 'medium',
  sx: {
    minWidth: isMobile ? 'auto' : isTablet ? 100 : 120,
    fontSize: isMobile ? '0.75rem' : '0.875rem',
  }
});

// Responsive dialog props
export const getResponsiveDialogProps = (isMobile, isTablet) => ({
  fullWidth: true,
  maxWidth: isMobile ? 'sm' : isTablet ? 'md' : 'lg',
  PaperProps: {
    sx: {
      m: isMobile ? 1 : isTablet ? 2 : 3,
      maxHeight: isMobile ? '90vh' : '85vh',
    }
  }
});

// Responsive container props
export const getResponsiveContainerProps = (isMobile, isTablet) => ({
  maxWidth: false,
  sx: {
    px: isMobile ? 1 : isTablet ? 2 : 3,
    py: isMobile ? 1 : isTablet ? 2 : 3,
  }
});

// Responsive chart props
export const getResponsiveChartProps = (isMobile, isTablet) => ({
  height: isMobile ? 200 : isTablet ? 300 : 400,
  width: '100%',
  margin: { top: 20, right: 30, left: 20, bottom: 5 }
});

// Responsive form props
export const getResponsiveFormProps = (isMobile, isTablet) => ({
  sx: {
    '& .MuiFormControl-root': {
      mb: isMobile ? 1 : isTablet ? 1.5 : 2,
    },
    '& .MuiTextField-root, .MuiSelect-root': {
      '& .MuiInputBase-root': {
        fontSize: isMobile ? '0.875rem' : '1rem',
      }
    }
  }
});

// Responsive list props
export const getResponsiveListProps = (isMobile, isTablet) => ({
  dense: isMobile,
  sx: {
    '& .MuiListItem-root': {
      py: isMobile ? 0.5 : isTablet ? 1 : 1.5,
      px: isMobile ? 1 : isTablet ? 2 : 3,
    },
    '& .MuiListItemIcon-root': {
      minWidth: isMobile ? 32 : 40,
    }
  }
});

// Helper function to create responsive styles
export const createResponsiveStyles = (baseStyles, responsiveOverrides = {}, theme, isMobile, isTablet) => {
  const responsiveStyles = {
    ...baseStyles,
    ...(isMobile && responsiveOverrides.mobile),
    ...(isTablet && responsiveOverrides.tablet),
    ...(!isMobile && !isTablet && responsiveOverrides.desktop),
  };

  return responsiveStyles;
};

// Responsive breakpoints object
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};
