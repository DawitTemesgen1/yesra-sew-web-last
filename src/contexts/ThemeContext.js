import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ThemeContext = createContext();

export const useCustomTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useCustomTheme must be used within a CustomThemeProvider');
    }
    return context;
};

export const CustomThemeProvider = ({ children }) => {
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('themeMode') || 'light';
    });

    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    useEffect(() => {
        document.body.dataset.theme = mode;
    }, [mode]);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    ...(mode === 'light'
                        ? {
                            // Light Mode - Blue & Gold Branding
                            primary: {
                                main: '#0055FF', // Pure Brand Blue
                                light: '#4D88FF',
                                dark: '#0033CC',
                                contrastText: '#ffffff',
                            },
                            secondary: {
                                main: '#D4AF37', // Brand Gold
                                light: '#FFD700',
                                dark: '#B58E2A',
                                contrastText: '#0055FF',
                            },
                            background: {
                                default: '#F8F9FA', // Clean, neutral background
                                paper: '#ffffff',
                            },
                            text: {
                                primary: '#0F172A',
                                secondary: '#475569',
                            },
                        }
                        : {
                            // Dark Mode - Preserving Existing Gold Aesthetic
                            primary: {
                                main: '#D4AF37',
                                contrastText: '#000000',
                            },
                            secondary: {
                                main: '#ffffff',
                            },
                            background: {
                                default: '#121212',
                                paper: '#1E1E1E',
                            },
                        }),
                },
                typography: {
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontWeight: 700 },
                    h2: { fontWeight: 700 },
                    h3: { fontWeight: 600 },
                    h4: { fontWeight: 600 },
                    h5: { fontWeight: 600 },
                    h6: { fontWeight: 600 },
                    button: {
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: '0.5px',
                    },
                },
                shape: {
                    borderRadius: 12,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 8,
                                padding: '8px 24px',
                            },
                            containedPrimary: {
                                containedPrimary: {
                                    boxShadow: mode === 'light'
                                        ? '0 4px 14px 0 rgba(0, 85, 255, 0.39)'
                                        : '0 4px 14px 0 rgba(212, 175, 55, 0.39)',
                                },
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 16,
                                boxShadow: mode === 'light'
                                    ? '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)'
                                    : '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none', // Remove default MUI overlay in dark mode for cleaner look
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    const value = {
        mode,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};

