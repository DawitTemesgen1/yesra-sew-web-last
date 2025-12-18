-- ============================================
-- UPDATE SYSTEM SETTINGS: Twitter -> TikTok
-- ============================================

-- Rename the social_twitter key to social_tiktok if it exists
UPDATE public.system_settings 
SET key = 'social_tiktok' 
WHERE key = 'social_twitter';

-- Ensure default value for show_social_footer if missing
INSERT INTO public.system_settings (key, value)
VALUES ('show_social_footer', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.system_settings (key, value)
VALUES ('show_app_footer', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
