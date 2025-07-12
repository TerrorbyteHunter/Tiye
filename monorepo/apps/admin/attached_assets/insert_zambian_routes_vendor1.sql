-- Insert common Zambian intercity routes for vendorid = 1
-- Each route has two schedules: morning (04:00–12:00) and afternoon (10:00–17:00)
-- Fares are randomly chosen between K350 and K500
-- Distances are actual city-to-city distances (km)
-- All days of week, status active, capacity 44, stops empty

INSERT INTO routes (
  vendorid, departure, destination, departuretime, estimatedarrival, fare, capacity, status, daysofweek, kilometers, stops
) VALUES
-- Lusaka ↔ Ndola
(1, 'Lusaka', 'Ndola', '04:00:00', '2024-01-01 08:00:00', 400, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 320, ARRAY[]::text[]),
(1, 'Lusaka', 'Ndola', '10:00:00', '2024-01-01 14:00:00', 450, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 320, ARRAY[]::text[]),
(1, 'Ndola', 'Lusaka', '04:00:00', '2024-01-01 08:00:00', 410, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 320, ARRAY[]::text[]),
(1, 'Ndola', 'Lusaka', '10:00:00', '2024-01-01 14:00:00', 390, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 320, ARRAY[]::text[]),
-- Lusaka ↔ Kitwe
(1, 'Lusaka', 'Kitwe', '04:00:00', '2024-01-01 09:00:00', 470, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 360, ARRAY[]::text[]),
(1, 'Lusaka', 'Kitwe', '10:00:00', '2024-01-01 15:00:00', 480, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 360, ARRAY[]::text[]),
(1, 'Kitwe', 'Lusaka', '04:00:00', '2024-01-01 09:00:00', 460, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 360, ARRAY[]::text[]),
(1, 'Kitwe', 'Lusaka', '10:00:00', '2024-01-01 15:00:00', 490, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 360, ARRAY[]::text[]),
-- Lusaka ↔ Livingstone
(1, 'Lusaka', 'Livingstone', '04:00:00', '2024-01-01 10:00:00', 500, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 485, ARRAY[]::text[]),
(1, 'Lusaka', 'Livingstone', '10:00:00', '2024-01-01 16:00:00', 470, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 485, ARRAY[]::text[]),
(1, 'Livingstone', 'Lusaka', '04:00:00', '2024-01-01 10:00:00', 480, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 485, ARRAY[]::text[]),
(1, 'Livingstone', 'Lusaka', '10:00:00', '2024-01-01 16:00:00', 490, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 485, ARRAY[]::text[]),
-- Lusaka ↔ Chipata
(1, 'Lusaka', 'Chipata', '04:00:00', '2024-01-01 11:00:00', 480, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 570, ARRAY[]::text[]),
(1, 'Lusaka', 'Chipata', '10:00:00', '2024-01-01 17:00:00', 470, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 570, ARRAY[]::text[]),
(1, 'Chipata', 'Lusaka', '04:00:00', '2024-01-01 11:00:00', 460, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 570, ARRAY[]::text[]),
(1, 'Chipata', 'Lusaka', '10:00:00', '2024-01-01 17:00:00', 490, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 570, ARRAY[]::text[]),
-- Lusaka ↔ Solwezi
(1, 'Lusaka', 'Solwezi', '04:00:00', '2024-01-01 11:00:00', 470, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 560, ARRAY[]::text[]),
(1, 'Lusaka', 'Solwezi', '10:00:00', '2024-01-01 17:00:00', 480, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 560, ARRAY[]::text[]),
(1, 'Solwezi', 'Lusaka', '04:00:00', '2024-01-01 11:00:00', 460, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 560, ARRAY[]::text[]),
(1, 'Solwezi', 'Lusaka', '10:00:00', '2024-01-01 17:00:00', 490, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 560, ARRAY[]::text[]),
-- Lusaka ↔ Kasama
(1, 'Lusaka', 'Kasama', '04:00:00', '2024-01-01 15:00:00', 500, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 850, ARRAY[]::text[]),
(1, 'Lusaka', 'Kasama', '10:00:00', '2024-01-01 21:00:00', 470, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 850, ARRAY[]::text[]),
(1, 'Kasama', 'Lusaka', '04:00:00', '2024-01-01 15:00:00', 480, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 850, ARRAY[]::text[]),
(1, 'Kasama', 'Lusaka', '10:00:00', '2024-01-01 21:00:00', 490, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 850, ARRAY[]::text[]),
-- Lusaka ↔ Mongu
(1, 'Lusaka', 'Mongu', '04:00:00', '2024-01-01 11:00:00', 400, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 600, ARRAY[]::text[]),
(1, 'Lusaka', 'Mongu', '10:00:00', '2024-01-01 17:00:00', 420, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 600, ARRAY[]::text[]),
(1, 'Mongu', 'Lusaka', '04:00:00', '2024-01-01 11:00:00', 410, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 600, ARRAY[]::text[]),
(1, 'Mongu', 'Lusaka', '10:00:00', '2024-01-01 17:00:00', 430, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 600, ARRAY[]::text[]),
-- Lusaka ↔ Choma
(1, 'Lusaka', 'Choma', '04:00:00', '2024-01-01 07:30:00', 350, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 285, ARRAY[]::text[]),
(1, 'Lusaka', 'Choma', '10:00:00', '2024-01-01 13:30:00', 360, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 285, ARRAY[]::text[]),
(1, 'Choma', 'Lusaka', '04:00:00', '2024-01-01 07:30:00', 370, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 285, ARRAY[]::text[]),
(1, 'Choma', 'Lusaka', '10:00:00', '2024-01-01 13:30:00', 380, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 285, ARRAY[]::text[]),
-- Lusaka ↔ Kabwe
(1, 'Lusaka', 'Kabwe', '04:00:00', '2024-01-01 06:00:00', 350, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 140, ARRAY[]::text[]),
(1, 'Lusaka', 'Kabwe', '10:00:00', '2024-01-01 12:00:00', 360, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 140, ARRAY[]::text[]),
(1, 'Kabwe', 'Lusaka', '04:00:00', '2024-01-01 06:00:00', 370, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 140, ARRAY[]::text[]),
(1, 'Kabwe', 'Lusaka', '10:00:00', '2024-01-01 12:00:00', 380, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 140, ARRAY[]::text[]),
-- Lusaka ↔ Mufulira
(1, 'Lusaka', 'Mufulira', '04:00:00', '2024-01-01 09:30:00', 420, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 410, ARRAY[]::text[]),
(1, 'Lusaka', 'Mufulira', '10:00:00', '2024-01-01 15:30:00', 430, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 410, ARRAY[]::text[]),
(1, 'Mufulira', 'Lusaka', '04:00:00', '2024-01-01 09:30:00', 410, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 410, ARRAY[]::text[]),
(1, 'Mufulira', 'Lusaka', '10:00:00', '2024-01-01 15:30:00', 440, 44, 'active', ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], 410, ARRAY[]::text[]); 