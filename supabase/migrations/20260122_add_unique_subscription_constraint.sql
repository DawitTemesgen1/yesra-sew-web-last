-- 1. Remove duplicates (keeping the most recently created one)
-- This is necessary before adding a unique constraint
DELETE FROM public.user_subscriptions a 
USING public.user_subscriptions b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.plan_id = b.plan_id;

-- 2. Add Unique Constraint safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_subscriptions_user_id_plan_id_key'
    ) THEN
        ALTER TABLE public.user_subscriptions
        ADD CONSTRAINT user_subscriptions_user_id_plan_id_key UNIQUE (user_id, plan_id);
    END IF;
END
$$;
