-- Alter otps table to support email addresses in phone column
ALTER TABLE otps ALTER COLUMN phone TYPE varchar(255);

-- Add comment to clarify the column can store both phone and email
COMMENT ON COLUMN otps.phone IS 'Can store phone number or email address';
