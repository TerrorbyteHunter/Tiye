-- Create customers table for end users (customers from user app)
-- This table stores customer information for the user app

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on mobile for fast lookups
CREATE INDEX IF NOT EXISTS idx_customers_mobile ON customers(mobile);

-- Create index on email if you plan to use it
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- Insert a test customer (Popi)
INSERT INTO customers (mobile, name, email) 
VALUES ('260000000000', 'Popi', 'popi@example.com')
ON CONFLICT (mobile) DO NOTHING;

-- Verify the table was created
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'customers'
ORDER BY ordinal_position;

-- Show the test customer
SELECT * FROM customers; 