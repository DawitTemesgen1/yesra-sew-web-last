import { supabase } from '../lib/supabaseClient';

const blogService = {
    // Get all published blog posts
    async getPublishedPosts() {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .order('published_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get single blog post by ID
    async getPostById(id) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Increment view count
        await supabase
            .from('blog_posts')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', id);

        return data;
    },

    // Get posts by category
    async getPostsByCategory(category) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .eq('category', category)
            .order('published_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Search posts
    async searchPosts(searchTerm) {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .or(`title->en.ilike.%${searchTerm}%,excerpt->en.ilike.%${searchTerm}%`)
            .order('published_date', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Admin: Get all posts (including drafts)
    async getAllPosts() {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Admin: Create post
    async createPost(postData) {
        const { data, error } = await supabase
            .from('blog_posts')
            .insert([postData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Admin: Update post
    async updatePost(id, postData) {
        const { data, error } = await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Admin: Delete post
    async deletePost(id) {
        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Contact Messages
    async submitContactMessage(messageData) {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert([messageData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Admin: Get all contact messages
    async getAllContactMessages() {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Admin: Update message status
    async updateMessageStatus(id, status) {
        const { data, error } = await supabase
            .from('contact_messages')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Admin: Delete message
    async deleteMessage(id) {
        const { error } = await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Newsletter Subscription
    async subscribeToNewsletter(email) {
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email }])
            .select()
            .single();

        if (error) {
            // Check if already subscribed
            if (error.code === '23505') {
                throw new Error('This email is already subscribed');
            }
            throw error;
        }
        return data;
    },

    // Admin: Get all newsletter subscribers
    async getAllSubscribers() {
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .eq('status', 'active')
            .order('subscribed_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get blog statistics
    async getBlogStats() {
        const { data: posts, error: postsError } = await supabase
            .from('blog_posts')
            .select('id, status, views');

        if (postsError) throw postsError;

        const { data: messages, error: messagesError } = await supabase
            .from('contact_messages')
            .select('id, status');

        if (messagesError) throw messagesError;

        const { data: subscribers, error: subscribersError } = await supabase
            .from('newsletter_subscribers')
            .select('id, status');

        if (subscribersError) throw subscribersError;

        return {
            totalPosts: posts.length,
            publishedPosts: posts.filter(p => p.status === 'published').length,
            draftPosts: posts.filter(p => p.status === 'draft').length,
            totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
            totalMessages: messages.length,
            unreadMessages: messages.filter(m => m.status === 'unread').length,
            totalSubscribers: subscribers.filter(s => s.status === 'active').length
        };
    },

    // FAQs - Public
    async getActiveFAQs() {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Admin: Get all FAQs
    async getAllFAQs() {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Admin: Create FAQ
    async createFAQ(faqData) {
        const { data, error } = await supabase
            .from('faqs')
            .insert([faqData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Admin: Update FAQ
    async updateFAQ(id, faqData) {
        const { data, error } = await supabase
            .from('faqs')
            .update(faqData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Admin: Delete FAQ
    async deleteFAQ(id) {
        const { error } = await supabase
            .from('faqs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Admin: Reorder FAQs
    async reorderFAQs(faqsWithOrder) {
        const updates = faqsWithOrder.map(({ id, display_order }) =>
            supabase
                .from('faqs')
                .update({ display_order })
                .eq('id', id)
        );

        await Promise.all(updates);
    },

    // ============================================
    // Blog Engagement (Likes & Comments)
    // ============================================

    // Get comments for a post
    async getComments(postId) {
        const { data, error } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('post_id', postId)
            .eq('is_approved', true) // Only show approved
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Submit a comment
    async submitComment(commentData) {
        const { data, error } = await supabase
            .from('blog_comments')
            .insert([commentData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete a comment (Owner only via RLS)
    async deleteComment(commentId) {
        const { error } = await supabase
            .from('blog_comments')
            .delete()
            .eq('id', commentId);

        if (error) throw error;
    },

    // Check if current user liked a post
    async checkUserLike(postId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('blog_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (error) return false;
        return !!data;
    },

    // Toggle Like (Like/Unlike)
    async toggleLike(postId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Check if already liked
        const { data: existingLike } = await supabase
            .from('blog_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existingLike) {
            // Unlike
            const { error } = await supabase
                .from('blog_likes')
                .delete()
                .eq('id', existingLike.id);
            if (error) throw error;
            return false; // Liked = false
        } else {
            // Like
            const { error } = await supabase
                .from('blog_likes')
                .insert([{ post_id: postId, user_id: user.id }]);
            if (error) throw error;
            return true; // Liked = true
        }
    }
};

export default blogService;
