import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../contexts/LanguageContext';

const SEO = ({ title, description, keywords, image, url }) => {
    const { language, t } = useLanguage();

    // Default values based on language could be expanded here if needed, 
    // but usually passed from the page component which utilizes t() functions.
    // For now, English defaults are provided.
    const siteTitle = t('seo.defaultTitle') || 'Yesra Sew Solution - Connecting Technology and Careers';
    const defaultDescription = t('seo.defaultDescription') || 'Ethiopia\'s Premier Marketplace for Jobs, Tenders, Cars, and Real Estate. Find the best deals in Addis Ababa and beyond.';
    const defaultKeywords = t('seo.defaultKeywords') || 'ethiopia, marketplace, jobs, tenders, cars, real estate, buy, sell, addis ababa, classifieds, jobs in ethiopia, cars in ethiopia';

    // Dynamic Title Construction
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet>
            {/* Visual */}
            <html lang={language || 'en'} />
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />
            <meta name="keywords" content={keywords || defaultKeywords} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#ffffff" />

            {/* Social / Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:site_name" content={siteTitle} />
            {image && <meta property="og:image" content={image} />}
            {url && <meta property="og:url" content={url} />}

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};

export default SEO;

