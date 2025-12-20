import React, { createContext, useContext, useState, useEffect } from 'react';

// Translation files
import en from '../locales/en.json';
import am from '../locales/am.json';
import ti from '../locales/ti.json';
import om from '../locales/om.json';

const translations = {
    en, // English
    am, // Amharic (አማርኛ)
    ti, // Tigrinya (ትግርኛ)
    om  // Afaan Oromoo (Afaan Oromoo)
};

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    // Fallback in case of context loss (e.g. lazy loading islands)
    if (!context) {
        return {
            language: 'en',
            changeLanguage: () => { },
            t: (key) => key,
            languages: [
                { code: 'en', name: 'English', nativeName: 'English' },
                { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
                { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
                { code: 'om', name: 'Afaan Oromoo', nativeName: 'Afaan Oromoo' }
            ],
            currentLanguage: { code: 'en', name: 'English', nativeName: 'English' }
        };
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        // Get saved language from localStorage or default to English
        return localStorage.getItem('language') || 'en';
    });

    useEffect(() => {
        // Save language preference
        localStorage.setItem('language', language);
        // Set document direction (RTL for some languages if needed)
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const t = (key, params = {}) => {
        // Get translation from current language
        const keys = key.split('.');
        let translation = translations[language];

        for (const k of keys) {
            translation = translation?.[k];
        }

        // Fallback to English if translation not found
        if (!translation) {
            let fallback = translations.en;
            for (const k of keys) {
                fallback = fallback?.[k];
            }
            translation = fallback || key;
        }

        // Replace parameters in translation
        if (typeof translation === 'string' && params) {
            Object.keys(params).forEach(param => {
                translation = translation.replace(`{${param}}`, params[param]);
            });
        }

        return translation || key;
    };

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
        }
    };

    const languages = [
        { code: 'en', name: 'English', nativeName: 'English' },
        { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
        { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ' },
        { code: 'om', name: 'Afaan Oromoo', nativeName: 'Afaan Oromoo' }
    ];

    const value = {
        language,
        changeLanguage,
        t,
        languages,
        currentLanguage: languages.find(l => l.code === language)
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export default LanguageContext;
