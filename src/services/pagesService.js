import { supabase } from './api';

/**
 * Pages Service
 * Manages public pages (Home, About, Pricing, Terms, etc.)
 */

const pagesService = {
    // ============================================
    // PAGE MANAGEMENT
    // ============================================

    /**
     * Get all pages
     */
    async getPages(includeUnpublished = false) {
        try {
            let query = supabase
                .from('pages')
                .select('*')
                .order('menu_order');

            if (!includeUnpublished) {
                query = query.eq('is_published', true);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching pages:', error);
            throw error;
        }
    },

    /**
     * Get single page by slug
     */
    async getPageBySlug(slug) {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching page:', error);
            throw error;
        }
    },

    /**
     * Get single page by ID
     */
    async getPage(pageId) {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('id', pageId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching page:', error);
            throw error;
        }
    },

    /**
     * Create page
     */
    async createPage(pageData) {
        try {
            const { data, error } = await supabase
                .from('pages')
                .insert({
                    ...pageData,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating page:', error);
            throw error;
        }
    },

    /**
     * Update page
     */
    async updatePage(pageId, updates) {
        try {
            const { data, error } = await supabase
                .from('pages')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', pageId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating page:', error);
            throw error;
        }
    },

    /**
     * Delete page
     */
    async deletePage(pageId) {
        try {
            const { error } = await supabase
                .from('pages')
                .delete()
                .eq('id', pageId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting page:', error);
            throw error;
        }
    },

    /**
     * Toggle page published status
     */
    async togglePublished(pageId, isPublished) {
        try {
            return await this.updatePage(pageId, { is_published: isPublished });
        } catch (error) {
            console.error('Error toggling published status:', error);
            throw error;
        }
    },

    /**
     * Toggle page in menu
     */
    async toggleInMenu(pageId, showInMenu) {
        try {
            return await this.updatePage(pageId, { show_in_menu: showInMenu });
        } catch (error) {
            console.error('Error toggling menu status:', error);
            throw error;
        }
    },

    // ============================================
    // PAGE SECTIONS
    // ============================================

    /**
     * Add section to page
     */
    async addSection(pageId, sectionData) {
        try {
            const page = await this.getPage(pageId);
            const sections = page.sections || [];

            sections.push({
                id: Date.now().toString(),
                ...sectionData
            });

            return await this.updatePage(pageId, { sections });
        } catch (error) {
            console.error('Error adding section:', error);
            throw error;
        }
    },

    /**
     * Update section
     */
    async updateSection(pageId, sectionId, sectionData) {
        try {
            const page = await this.getPage(pageId);
            const sections = page.sections || [];

            const index = sections.findIndex(s => s.id === sectionId);
            if (index === -1) throw new Error('Section not found');

            sections[index] = {
                ...sections[index],
                ...sectionData
            };

            return await this.updatePage(pageId, { sections });
        } catch (error) {
            console.error('Error updating section:', error);
            throw error;
        }
    },

    /**
     * Delete section
     */
    async deleteSection(pageId, sectionId) {
        try {
            const page = await this.getPage(pageId);
            const sections = (page.sections || []).filter(s => s.id !== sectionId);

            return await this.updatePage(pageId, { sections });
        } catch (error) {
            console.error('Error deleting section:', error);
            throw error;
        }
    },

    /**
     * Reorder sections
     */
    async reorderSections(pageId, sectionIds) {
        try {
            const page = await this.getPage(pageId);
            const sections = page.sections || [];

            const reordered = sectionIds.map(id =>
                sections.find(s => s.id === id)
            ).filter(Boolean);

            return await this.updatePage(pageId, { sections: reordered });
        } catch (error) {
            console.error('Error reordering sections:', error);
            throw error;
        }
    },

    // ============================================
    // MENU PAGES
    // ============================================

    /**
     * Get menu pages
     */
    async getMenuPages() {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('id, slug, title, menu_order')
                .eq('is_published', true)
                .eq('show_in_menu', true)
                .order('menu_order');

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching menu pages:', error);
            throw error;
        }
    },

    /**
     * Update menu order
     */
    async updateMenuOrder(pageOrders) {
        try {
            const updates = pageOrders.map((item, index) =>
                this.updatePage(item.id, { menu_order: index })
            );

            await Promise.all(updates);
            return true;
        } catch (error) {
            console.error('Error updating menu order:', error);
            throw error;
        }
    },

    // ============================================
    // SECTION TEMPLATES
    // ============================================

    /**
     * Get available section templates
     */
    getSectionTemplates() {
        return [
            {
                type: 'hero',
                name: 'Hero Section',
                description: 'Large banner with title, subtitle, and CTA',
                defaultContent: {
                    title: 'Welcome to YesraSew',
                    subtitle: 'Ethiopia\'s Premier Marketplace',
                    backgroundImage: '',
                    ctaText: 'Get Started',
                    ctaLink: '/register'
                }
            },
            {
                type: 'features',
                name: 'Features Grid',
                description: 'Grid of features with icons',
                defaultContent: {
                    title: 'Why Choose Us',
                    features: [
                        { icon: 'check', title: 'Verified Listings', description: 'All listings are verified' },
                        { icon: 'shield', title: 'Secure Payments', description: 'Safe and secure transactions' },
                        { icon: 'support', title: '24/7 Support', description: 'Always here to help' }
                    ]
                }
            },
            {
                type: 'pricing',
                name: 'Pricing Table',
                description: 'Display membership plans',
                defaultContent: {
                    title: 'Choose Your Plan',
                    subtitle: 'Select the perfect plan for your needs'
                }
            },
            {
                type: 'testimonials',
                name: 'Testimonials',
                description: 'Customer testimonials carousel',
                defaultContent: {
                    title: 'What Our Users Say',
                    testimonials: []
                }
            },
            {
                type: 'stats',
                name: 'Statistics',
                description: 'Key statistics display',
                defaultContent: {
                    stats: [
                        { label: 'Active Users', value: '10,000+' },
                        { label: 'Listings', value: '50,000+' },
                        { label: 'Categories', value: '20+' }
                    ]
                }
            },
            {
                type: 'cta',
                name: 'Call to Action',
                description: 'Prominent call to action section',
                defaultContent: {
                    title: 'Ready to Get Started?',
                    description: 'Join thousands of users today',
                    buttonText: 'Sign Up Now',
                    buttonLink: '/register'
                }
            },
            {
                type: 'content',
                name: 'Rich Content',
                description: 'Rich text content block',
                defaultContent: {
                    html: '<p>Your content here...</p>'
                }
            },
            {
                type: 'faq',
                name: 'FAQ Section',
                description: 'Frequently asked questions',
                defaultContent: {
                    title: 'Frequently Asked Questions',
                    faqs: [
                        { question: 'How do I get started?', answer: 'Simply sign up and create your first listing!' }
                    ]
                }
            }
        ];
    },

    /**
     * Create page from template
     */
    async createFromTemplate(templateName) {
        const templates = {
            'landing': {
                title: 'Home',
                slug: 'home',
                sections: [
                    { type: 'hero', content: this.getSectionTemplates().find(t => t.type === 'hero').defaultContent },
                    { type: 'features', content: this.getSectionTemplates().find(t => t.type === 'features').defaultContent },
                    { type: 'stats', content: this.getSectionTemplates().find(t => t.type === 'stats').defaultContent },
                    { type: 'cta', content: this.getSectionTemplates().find(t => t.type === 'cta').defaultContent }
                ]
            },
            'pricing': {
                title: 'Pricing',
                slug: 'pricing',
                sections: [
                    { type: 'pricing', content: this.getSectionTemplates().find(t => t.type === 'pricing').defaultContent }
                ]
            },
            'about': {
                title: 'About Us',
                slug: 'about',
                sections: [
                    { type: 'content', content: { html: '<h1>About YesraSew</h1><p>Your story here...</p>' } }
                ]
            }
        };

        const template = templates[templateName];
        if (!template) throw new Error('Template not found');

        return await this.createPage(template);
    }
};

export default pagesService;

