ALTER TABLE public.user_subscriptions
DROP CONSTRAINT IF EXISTS fk_user_subs_profiles;

ALTER TABLE public.user_subscriptions
ADD CONSTRAINT fk_user_subs_profiles
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
