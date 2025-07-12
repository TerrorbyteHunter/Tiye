-- Create sample vendor for analytics testing
-- This ensures there's a vendor with ID 1 for the sample tickets to reference

INSERT INTO vendors (
  id, name, contact_person, email, phone, address, status, logo, permissions, created_at
) VALUES 
(1, 'Zambia Express Bus Company', 'John Mwale', 'info@zambiaexpress.com', '+260955123456', 'Lusaka Central Business District', 'active', NULL, ARRAY['dashboard_view', 'routes_view', 'routes_create', 'tickets_view', 'tickets_create', 'reports_view'], NOW())
ON CONFLICT (id) DO NOTHING;

-- Create a second vendor for comparison
INSERT INTO vendors (
  id, name, contact_person, email, phone, address, status, logo, permissions, created_at
) VALUES 
(2, 'Copperbelt Transport Services', 'Sarah Banda', 'info@copperbelttransport.com', '+260955123457', 'Ndola Industrial Area', 'active', NULL, ARRAY['dashboard_view', 'routes_view', 'routes_create', 'tickets_view', 'tickets_create', 'reports_view'], NOW())
ON CONFLICT (id) DO NOTHING; 