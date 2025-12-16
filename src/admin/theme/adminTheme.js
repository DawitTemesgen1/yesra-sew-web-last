import { createTheme, alpha } from '@mui/material/styles';

/**
 * Independent Admin Panel Theme
 * This theme is completely separate from the user-facing application
 * Provides a professional, modern admin interface with Rich Aesthetics
 */

// Premium Brand Colors
const primaryColor = '#4F46E5'; // Indigo 600
const secondaryColor = '#EC4899'; // Pink 500
const successColor = '#10B981'; // Emerald 500
const warningColor = '#F59E0B'; // Amber 500
const errorColor = '#EF4444'; // Red 500
const infoColor = '#3B82F6'; // Blue 500

const adminTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: primaryColor,
            light: '#818CF8', // Indigo 400
            dark: '#4338CA', // Indigo 700
            contrastText: '#ffffff',
        },
        secondary: {
            main: secondaryColor,
            light: '#F472B6',
            dark: '#DB2777',
            contrastText: '#ffffff',
        },
        success: {
            main: successColor,
            light: '#34D399',
            dark: '#059669',
        },
        warning: {
            main: warningColor,
            light: '#FBBF24',
            dark: '#D97706',
        },
        error: {
            main: errorColor,
            light: '#F87171',
            dark: '#B91C1C',
        },
        info: {
            main: infoColor,
            light: '#60A5FA',
            dark: '#2563EB',
        },
        background: {
            default: '#F3F4F6', // Gray 100 - cleaner background
            paper: '#ffffff',
        },
        text: {
            primary: '#111827', // Gray 900
            secondary: '#6B7280', // Gray 500
        },
        divider: '#E5E7EB', // Gray 200
    },
    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            'sans-serif',
        ].join(','),
        h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em' },
        h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em' },
        h3: { fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.025em' },
        h4: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em' },
        h5: { fontSize: '1.25rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
        subtitle1: { fontSize: '1rem', fontWeight: 500 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
        body1: { fontSize: '1rem', lineHeight: 1.6 },
        body2: { fontSize: '0.875rem', lineHeight: 1.57 },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: {
        borderRadius: 12, // More rounded modern look
    },
    shadows: [
        'none',
        '0px 1px 2px rgba(0,0,0,0.05)', // Elevation 1 (Soft)
        '0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px rgba(0,0,0,0.06)', // Elevation 2
        '0px 4px 6px -1px rgba(0,0,0,0.1), 0px 2px 4px -1px rgba(0,0,0,0.06)', // Elevation 3
        '0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -2px rgba(0,0,0,0.05)', // Elevation 4
        '0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)', // Elevation 5
        '0px 25px 50px -12px rgba(0,0,0,0.25)', // Elevation 6
        '0 0 15px rgba(0,0,0,0.1)', // Custom glow
        ...Array(17).fill('none'), // Fill rest
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '8px 20px',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-1px)' },
                },
                contained: {
                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)', // Colored shadow for primary
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    backgroundImage: 'none',
                    boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease-in-out',
                    border: '1px solid rgba(0,0,0,0.03)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: { borderRadius: 12, backgroundImage: 'none' },
                elevation1: { boxShadow: '0px 1px 3px rgba(0,0,0,0.1)' },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8, fontWeight: 600 },
                filled: { border: '1px solid transparent' },
                outlined: { borderWidth: 1 },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: { borderBottom: '1px solid #F3F4F6' },
                head: {
                    fontWeight: 600,
                    color: '#6B7280',
                    backgroundColor: '#F9FAFB',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid rgba(0,0,0,0.05)',
                    backgroundColor: '#ffffff',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 1px 2px rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Glass effect default
                    color: '#111827',
                },
            },
        },
    },
});

// Dark theme variant
export const adminDarkTheme = createTheme({
    ...adminTheme,
    palette: {
        mode: 'dark',
        primary: {
            main: '#6366F1', // Indigo 500
            light: '#818CF8',
            dark: '#4338CA',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#F472B6', // Pink 400
            light: '#FBCFE8',
            dark: '#DB2777',
            contrastText: '#ffffff',
        },
        background: {
            default: '#111827', // Gray 900
            paper: '#1F2937', // Gray 800
        },
        text: {
            primary: '#F9FAFB', // Gray 50
            secondary: '#9CA3AF', // Gray 400
        },
        divider: '#374151', // Gray 700
    },
    components: {
        ...adminTheme.components,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', // Dark Glass
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: '#F9FAFB',
                    backdropFilter: 'blur(12px)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#1F2937',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                },
            },
        },
    }
});

export default adminTheme;
