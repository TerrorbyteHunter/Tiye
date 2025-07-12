-- Add 2FA column to vendor_users table
-- Run this script to enable two-factor authentication support

-- Add the two_factor_enabled column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'vendor_users' 
        AND column_name = 'two_factor_enabled'
    ) THEN
        ALTER TABLE vendor_users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added two_factor_enabled column to vendor_users table';
    ELSE
        RAISE NOTICE 'two_factor_enabled column already exists in vendor_users table';
    END IF;
END $$;

-- Add index for better performance when checking 2FA status
CREATE INDEX IF NOT EXISTS idx_vendor_users_2fa_enabled 
ON vendor_users(two_factor_enabled) 
WHERE two_factor_enabled = true;

-- Update existing vendor users to have 2FA disabled by default
UPDATE vendor_users 
SET two_factor_enabled = FALSE 
WHERE two_factor_enabled IS NULL;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'vendor_users' 
AND column_name = 'two_factor_enabled';

-- Show current 2FA status for all vendor users
SELECT 
    id,
    email,
    full_name,
    two_factor_enabled,
    created_at
FROM vendor_users 
ORDER BY created_at DESC; 