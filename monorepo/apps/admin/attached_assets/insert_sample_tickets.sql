-- Insert sample tickets for analytics testing
-- This creates tickets across different dates to show revenue and booking trends

INSERT INTO tickets (
  vendorid, route_id, customer_name, customer_email, customer_phone, 
  seat_number, amount, status, travel_date, booking_reference, created_at
) VALUES
-- Recent tickets (last 30 days)
(1, 1, 'John Banda', 'john.banda@email.com', '+260955123456', 1, 400.00, 'confirmed', '2024-12-15 04:00:00', 'BK20241215001', NOW() - INTERVAL '1 day'),
(1, 1, 'Mary Phiri', 'mary.phiri@email.com', '+260955123457', 2, 400.00, 'confirmed', '2024-12-15 04:00:00', 'BK20241215002', NOW() - INTERVAL '1 day'),
(1, 2, 'David Mwanza', 'david.mwanza@email.com', '+260955123458', 3, 450.00, 'confirmed', '2024-12-15 10:00:00', 'BK20241215003', NOW() - INTERVAL '2 days'),
(1, 3, 'Sarah Ngoma', 'sarah.ngoma@email.com', '+260955123459', 4, 410.00, 'confirmed', '2024-12-16 04:00:00', 'BK20241216001', NOW() - INTERVAL '3 days'),
(1, 4, 'Peter Chilufya', 'peter.chilufya@email.com', '+260955123460', 5, 390.00, 'confirmed', '2024-12-16 10:00:00', 'BK20241216002', NOW() - INTERVAL '3 days'),
(1, 5, 'Grace Mwale', 'grace.mwale@email.com', '+260955123461', 6, 470.00, 'confirmed', '2024-12-17 04:00:00', 'BK20241217001', NOW() - INTERVAL '4 days'),
(1, 6, 'Michael Bwalya', 'michael.bwalya@email.com', '+260955123462', 7, 480.00, 'confirmed', '2024-12-17 10:00:00', 'BK20241217002', NOW() - INTERVAL '4 days'),
(1, 7, 'Alice Lungu', 'alice.lungu@email.com', '+260955123463', 8, 460.00, 'confirmed', '2024-12-18 04:00:00', 'BK20241218001', NOW() - INTERVAL '5 days'),
(1, 8, 'James Mumba', 'james.mumba@email.com', '+260955123464', 9, 490.00, 'confirmed', '2024-12-18 10:00:00', 'BK20241218002', NOW() - INTERVAL '5 days'),
(1, 9, 'Patricia Zulu', 'patricia.zulu@email.com', '+260955123465', 10, 500.00, 'confirmed', '2024-12-19 04:00:00', 'BK20241219001', NOW() - INTERVAL '6 days'),

-- More tickets for different dates
(1, 10, 'Robert Chisenga', 'robert.chisenga@email.com', '+260955123466', 11, 470.00, 'confirmed', '2024-12-19 10:00:00', 'BK20241219002', NOW() - INTERVAL '7 days'),
(1, 11, 'Dorothy Mulenga', 'dorothy.mulenga@email.com', '+260955123467', 12, 480.00, 'confirmed', '2024-12-20 04:00:00', 'BK20241220001', NOW() - INTERVAL '8 days'),
(1, 12, 'Francis Mwamba', 'francis.mwamba@email.com', '+260955123468', 13, 490.00, 'confirmed', '2024-12-20 10:00:00', 'BK20241220002', NOW() - INTERVAL '8 days'),
(1, 13, 'Hellen Chanda', 'hellen.chanda@email.com', '+260955123469', 14, 480.00, 'confirmed', '2024-12-21 04:00:00', 'BK20241221001', NOW() - INTERVAL '9 days'),
(1, 14, 'Simon Mwape', 'simon.mwape@email.com', '+260955123470', 15, 470.00, 'confirmed', '2024-12-21 10:00:00', 'BK20241221002', NOW() - INTERVAL '9 days'),
(1, 15, 'Agnes Mwanza', 'agnes.mwanza@email.com', '+260955123471', 16, 460.00, 'confirmed', '2024-12-22 04:00:00', 'BK20241222001', NOW() - INTERVAL '10 days'),
(1, 16, 'Patrick Mwale', 'patrick.mwale@email.com', '+260955123472', 17, 490.00, 'confirmed', '2024-12-22 10:00:00', 'BK20241222002', NOW() - INTERVAL '10 days'),
(1, 17, 'Ruth Banda', 'ruth.banda@email.com', '+260955123473', 18, 500.00, 'confirmed', '2024-12-23 04:00:00', 'BK20241223001', NOW() - INTERVAL '11 days'),
(1, 18, 'Daniel Phiri', 'daniel.phiri@email.com', '+260955123474', 19, 470.00, 'confirmed', '2024-12-23 10:00:00', 'BK20241223002', NOW() - INTERVAL '11 days'),
(1, 19, 'Esther Ngoma', 'esther.ngoma@email.com', '+260955123475', 20, 480.00, 'confirmed', '2024-12-24 04:00:00', 'BK20241224001', NOW() - INTERVAL '12 days'),

-- Tickets from 2-4 weeks ago
(1, 20, 'Christopher Chilufya', 'christopher.chilufya@email.com', '+260955123476', 21, 490.00, 'confirmed', '2024-12-24 10:00:00', 'BK20241224002', NOW() - INTERVAL '15 days'),
(1, 21, 'Veronica Mwale', 'veronica.mwale@email.com', '+260955123477', 22, 400.00, 'confirmed', '2024-12-25 04:00:00', 'BK20241225001', NOW() - INTERVAL '16 days'),
(1, 22, 'Andrew Bwalya', 'andrew.bwalya@email.com', '+260955123478', 23, 420.00, 'confirmed', '2024-12-25 10:00:00', 'BK20241225002', NOW() - INTERVAL '16 days'),
(1, 23, 'Beatrice Lungu', 'beatrice.lungu@email.com', '+260955123479', 24, 410.00, 'confirmed', '2024-12-26 04:00:00', 'BK20241226001', NOW() - INTERVAL '17 days'),
(1, 24, 'Gabriel Mumba', 'gabriel.mumba@email.com', '+260955123480', 25, 430.00, 'confirmed', '2024-12-26 10:00:00', 'BK20241226002', NOW() - INTERVAL '17 days'),
(1, 25, 'Faith Zulu', 'faith.zulu@email.com', '+260955123481', 26, 350.00, 'confirmed', '2024-12-27 04:00:00', 'BK20241227001', NOW() - INTERVAL '18 days'),
(1, 26, 'Isaac Chisenga', 'isaac.chisenga@email.com', '+260955123482', 27, 360.00, 'confirmed', '2024-12-27 10:00:00', 'BK20241227002', NOW() - INTERVAL '18 days'),
(1, 27, 'Joyce Mulenga', 'joyce.mulenga@email.com', '+260955123483', 28, 370.00, 'confirmed', '2024-12-28 04:00:00', 'BK20241228001', NOW() - INTERVAL '19 days'),
(1, 28, 'Kenneth Mwamba', 'kenneth.mwamba@email.com', '+260955123484', 29, 380.00, 'confirmed', '2024-12-28 10:00:00', 'BK20241228002', NOW() - INTERVAL '19 days'),
(1, 29, 'Lydia Chanda', 'lydia.chanda@email.com', '+260955123485', 30, 350.00, 'confirmed', '2024-12-29 04:00:00', 'BK20241229001', NOW() - INTERVAL '20 days'),

-- Some cancelled tickets to show different statuses
(1, 30, 'Mark Mwape', 'mark.mwape@email.com', '+260955123486', 31, 360.00, 'cancelled', '2024-12-29 10:00:00', 'BK20241229002', NOW() - INTERVAL '21 days'),
(1, 31, 'Nancy Mwanza', 'nancy.mwanza@email.com', '+260955123487', 32, 370.00, 'cancelled', '2024-12-30 04:00:00', 'BK20241230001', NOW() - INTERVAL '22 days'),
(1, 32, 'Oscar Mwale', 'oscar.mwale@email.com', '+260955123488', 33, 380.00, 'refunded', '2024-12-30 10:00:00', 'BK20241230002', NOW() - INTERVAL '22 days'),
(1, 33, 'Pauline Banda', 'pauline.banda@email.com', '+260955123489', 34, 420.00, 'confirmed', '2024-12-31 04:00:00', 'BK20241231001', NOW() - INTERVAL '23 days'),
(1, 34, 'Quentin Phiri', 'quentin.phiri@email.com', '+260955123490', 35, 430.00, 'confirmed', '2024-12-31 10:00:00', 'BK20241231002', NOW() - INTERVAL '23 days'),
(1, 35, 'Rachel Ngoma', 'rachel.ngoma@email.com', '+260955123491', 36, 410.00, 'confirmed', '2025-01-01 04:00:00', 'BK20250101001', NOW() - INTERVAL '24 days'),
(1, 36, 'Samuel Chilufya', 'samuel.chilufya@email.com', '+260955123492', 37, 440.00, 'confirmed', '2025-01-01 10:00:00', 'BK20250101002', NOW() - INTERVAL '24 days'),
(1, 37, 'Theresa Mwale', 'theresa.mwale@email.com', '+260955123493', 38, 470.00, 'confirmed', '2025-01-02 04:00:00', 'BK20250102001', NOW() - INTERVAL '25 days'),
(1, 38, 'Victor Bwalya', 'victor.bwalya@email.com', '+260955123494', 39, 480.00, 'confirmed', '2025-01-02 10:00:00', 'BK20250102002', NOW() - INTERVAL '25 days'),
(1, 39, 'Wendy Lungu', 'wendy.lungu@email.com', '+260955123495', 40, 460.00, 'confirmed', '2025-01-03 04:00:00', 'BK20250103001', NOW() - INTERVAL '26 days'),

-- Tickets from 1-2 months ago for longer period analytics
(1, 40, 'Xavier Mumba', 'xavier.mumba@email.com', '+260955123496', 41, 490.00, 'confirmed', '2025-01-03 10:00:00', 'BK20250103002', NOW() - INTERVAL '30 days'),
(1, 1, 'Yvonne Zulu', 'yvonne.zulu@email.com', '+260955123497', 42, 500.00, 'confirmed', '2025-01-04 04:00:00', 'BK20250104001', NOW() - INTERVAL '35 days'),
(1, 2, 'Zachary Chisenga', 'zachary.chisenga@email.com', '+260955123498', 43, 470.00, 'confirmed', '2025-01-04 10:00:00', 'BK20250104002', NOW() - INTERVAL '35 days'),
(1, 3, 'Abigail Mulenga', 'abigail.mulenga@email.com', '+260955123499', 44, 480.00, 'confirmed', '2025-01-05 04:00:00', 'BK20250105001', NOW() - INTERVAL '40 days'),
(1, 4, 'Benjamin Mwamba', 'benjamin.mwamba@email.com', '+260955123500', 1, 490.00, 'confirmed', '2025-01-05 10:00:00', 'BK20250105002', NOW() - INTERVAL '40 days'),
(1, 5, 'Catherine Chanda', 'catherine.chanda@email.com', '+260955123501', 2, 480.00, 'confirmed', '2025-01-06 04:00:00', 'BK20250106001', NOW() - INTERVAL '45 days'),
(1, 6, 'Dominic Mwape', 'dominic.mwape@email.com', '+260955123502', 3, 470.00, 'confirmed', '2025-01-06 10:00:00', 'BK20250106002', NOW() - INTERVAL '45 days'),
(1, 7, 'Eleanor Mwanza', 'eleanor.mwanza@email.com', '+260955123503', 4, 460.00, 'confirmed', '2025-01-07 04:00:00', 'BK20250107001', NOW() - INTERVAL '50 days'),
(1, 8, 'Frederick Mwale', 'frederick.mwale@email.com', '+260955123504', 5, 490.00, 'confirmed', '2025-01-07 10:00:00', 'BK20250107002', NOW() - INTERVAL '50 days'),
(1, 9, 'Genevieve Banda', 'genevieve.banda@email.com', '+260955123505', 6, 500.00, 'confirmed', '2025-01-08 04:00:00', 'BK20250108001', NOW() - INTERVAL '55 days'),

-- Tickets from 3-6 months ago for annual analytics
(1, 10, 'Harold Phiri', 'harold.phiri@email.com', '+260955123506', 7, 470.00, 'confirmed', '2025-01-08 10:00:00', 'BK20250108002', NOW() - INTERVAL '60 days'),
(1, 11, 'Irene Ngoma', 'irene.ngoma@email.com', '+260955123507', 8, 480.00, 'confirmed', '2025-01-09 04:00:00', 'BK20250109001', NOW() - INTERVAL '90 days'),
(1, 12, 'Jerome Chilufya', 'jerome.chilufya@email.com', '+260955123508', 9, 490.00, 'confirmed', '2025-01-09 10:00:00', 'BK20250109002', NOW() - INTERVAL '90 days'),
(1, 13, 'Katherine Mwale', 'katherine.mwale@email.com', '+260955123509', 10, 480.00, 'confirmed', '2025-01-10 04:00:00', 'BK20250110001', NOW() - INTERVAL '120 days'),
(1, 14, 'Lawrence Bwalya', 'lawrence.bwalya@email.com', '+260955123510', 11, 470.00, 'confirmed', '2025-01-10 10:00:00', 'BK20250110002', NOW() - INTERVAL '120 days'),
(1, 15, 'Margaret Lungu', 'margaret.lungu@email.com', '+260955123511', 12, 460.00, 'confirmed', '2025-01-11 04:00:00', 'BK20250111001', NOW() - INTERVAL '150 days'),
(1, 16, 'Nicholas Mumba', 'nicholas.mumba@email.com', '+260955123512', 13, 490.00, 'confirmed', '2025-01-11 10:00:00', 'BK20250111002', NOW() - INTERVAL '150 days'),
(1, 17, 'Olivia Zulu', 'olivia.zulu@email.com', '+260955123513', 14, 500.00, 'confirmed', '2025-01-12 04:00:00', 'BK20250112001', NOW() - INTERVAL '180 days'),
(1, 18, 'Patrick Chisenga', 'patrick.chisenga@email.com', '+260955123514', 15, 470.00, 'confirmed', '2025-01-12 10:00:00', 'BK20250112002', NOW() - INTERVAL '180 days'),
(1, 19, 'Queenie Mulenga', 'queenie.mulenga@email.com', '+260955123515', 16, 480.00, 'confirmed', '2025-01-13 04:00:00', 'BK20250113001', NOW() - INTERVAL '210 days'),
(1, 20, 'Reginald Mwamba', 'reginald.mwamba@email.com', '+260955123516', 17, 490.00, 'confirmed', '2025-01-13 10:00:00', 'BK20250113002', NOW() - INTERVAL '210 days'); 