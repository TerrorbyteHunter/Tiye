-- Add updated_at column to notifications table if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='notifications'
          AND column_name='updated_at'
    ) THEN
        ALTER TABLE notifications
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END$$;

-- Backfill updated_at for existing rows
UPDATE notifications SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Allow long user IDs/emails in read_notifications
ALTER TABLE read_notifications
ALTER COLUMN user_id TYPE TEXT; 