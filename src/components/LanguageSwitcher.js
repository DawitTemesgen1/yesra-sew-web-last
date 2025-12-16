import React, { useState } from 'react';
import { Menu, MenuItem, Button, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { Language, Check } from '@mui/icons-material';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitcher = ({ variant = 'button' }) => {
    const { language, changeLanguage, languages, currentLanguage } = useLanguage();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (langCode) => {
        changeLanguage(langCode);
        handleClose();
    };

    return (
        <>
            {variant === 'button' ? (
                <Button
                    startIcon={<Language />}
                    onClick={handleClick}
                    color="inherit"
                    sx={{ textTransform: 'none' }}
                >
                    {currentLanguage?.nativeName}
                </Button>
            ) : (
                <IconButton
                    onClick={handleClick}
                    color="inherit"
                    aria-label="change language"
                >
                    <Language />
                </IconButton>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { minWidth: 200 }
                }}
            >
                {languages.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        selected={language === lang.code}
                    >
                        {language === lang.code && (
                            <ListItemIcon>
                                <Check fontSize="small" />
                            </ListItemIcon>
                        )}
                        <ListItemText
                            primary={lang.nativeName}
                            secondary={lang.name}
                            primaryTypographyProps={{ fontWeight: language === lang.code ? 'bold' : 'normal' }}
                        />
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default LanguageSwitcher;
