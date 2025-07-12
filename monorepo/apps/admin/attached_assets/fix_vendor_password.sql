-- Set the password for the vendor to 'Vendor123' (bcrypt hash)
UPDATE vendors
SET password = '$2b$10$O7nDfEnhKan3Hmizb3LaUuZLJdymS/D9eoASb6DkpIyu8C0kOVuAO'
WHERE email = 'info@zambiaexpress.com'; 