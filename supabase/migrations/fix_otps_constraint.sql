-- Allow any purpose in OTPS table (fixing the test email issue)
ALTER TABLE public.otps DROP CONSTRAINT IF EXISTS otps_purpose_check;
