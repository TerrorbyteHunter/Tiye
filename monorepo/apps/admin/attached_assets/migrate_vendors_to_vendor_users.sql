-- Migrate all vendors to vendor_users as admin users
-- Only insert if the email does not already exist in vendor_users
INSERT INTO vendor_users (vendor_id, username, password, email, full_name, role, active, created_at, updated_at)
SELECT 
  v.id AS vendor_id,
  v.name AS username,
  v.password,
  v.email,
  v.name AS full_name,
  'admin' AS role,
  true AS active,
  COALESCE(v.createdat, NOW()),
  COALESCE(v.updatedat, NOW())
FROM vendors v
LEFT JOIN vendor_users vu ON vu.email = v.email
WHERE vu.id IS NULL; 