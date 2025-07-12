-- Insert sample tickets for current dates to test time filtering
-- This creates tickets for today, tomorrow, and next week

INSERT INTO tickets (
  vendorid, route_id, customer_name, customer_email, customer_phone, 
  seat_number, amount, status, travel_date, booking_reference, created_at
) VALUES
-- Today's tickets
(1, 1, 'Today Passenger 1', 'today1@email.com', '+260955123600', 1, 400.00, 'confirmed', CURRENT_DATE + INTERVAL '4 hours', 'BK20250115001', NOW()),
(1, 2, 'Today Passenger 2', 'today2@email.com', '+260955123601', 2, 450.00, 'confirmed', CURRENT_DATE + INTERVAL '10 hours', 'BK20250115002', NOW()),
(1, 3, 'Today Passenger 3', 'today3@email.com', '+260955123602', 3, 410.00, 'pending', CURRENT_DATE + INTERVAL '14 hours', 'BK20250115003', NOW()),

-- Tomorrow's tickets
(1, 4, 'Tomorrow Passenger 1', 'tomorrow1@email.com', '+260955123603', 4, 390.00, 'confirmed', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '4 hours', 'BK20250116001', NOW()),
(1, 5, 'Tomorrow Passenger 2', 'tomorrow2@email.com', '+260955123604', 5, 470.00, 'confirmed', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours', 'BK20250116002', NOW()),
(1, 6, 'Tomorrow Passenger 3', 'tomorrow3@email.com', '+260955123605', 6, 480.00, 'pending', CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours', 'BK20250116003', NOW()),

-- Next week's tickets
(1, 7, 'Next Week Passenger 1', 'nextweek1@email.com', '+260955123606', 7, 460.00, 'confirmed', CURRENT_DATE + INTERVAL '2 days' + INTERVAL '4 hours', 'BK20250117001', NOW()),
(1, 8, 'Next Week Passenger 2', 'nextweek2@email.com', '+260955123607', 8, 490.00, 'confirmed', CURRENT_DATE + INTERVAL '3 days' + INTERVAL '10 hours', 'BK20250118001', NOW()),
(1, 9, 'Next Week Passenger 3', 'nextweek3@email.com', '+260955123608', 9, 500.00, 'confirmed', CURRENT_DATE + INTERVAL '4 days' + INTERVAL '14 hours', 'BK20250119001', NOW()),
(1, 10, 'Next Week Passenger 4', 'nextweek4@email.com', '+260955123609', 10, 470.00, 'confirmed', CURRENT_DATE + INTERVAL '5 days' + INTERVAL '4 hours', 'BK20250120001', NOW()),
(1, 11, 'Next Week Passenger 5', 'nextweek5@email.com', '+260955123610', 11, 480.00, 'confirmed', CURRENT_DATE + INTERVAL '6 days' + INTERVAL '10 hours', 'BK20250121001', NOW()),
(1, 12, 'Next Week Passenger 6', 'nextweek6@email.com', '+260955123611', 12, 490.00, 'confirmed', CURRENT_DATE + INTERVAL '7 days' + INTERVAL '14 hours', 'BK20250122001', NOW()),

-- Past tickets (should not show in today/tomorrow filters)
(1, 13, 'Past Passenger 1', 'past1@email.com', '+260955123612', 13, 480.00, 'confirmed', CURRENT_DATE - INTERVAL '1 day' + INTERVAL '4 hours', 'BK20250114001', NOW()),
(1, 14, 'Past Passenger 2', 'past2@email.com', '+260955123613', 14, 470.00, 'confirmed', CURRENT_DATE - INTERVAL '2 days' + INTERVAL '10 hours', 'BK20250113001', NOW()),

-- Future tickets (beyond next week - should not show in week filter)
(1, 15, 'Future Passenger 1', 'future1@email.com', '+260955123614', 15, 460.00, 'confirmed', CURRENT_DATE + INTERVAL '10 days' + INTERVAL '4 hours', 'BK20250125001', NOW()),
(1, 16, 'Future Passenger 2', 'future2@email.com', '+260955123615', 16, 490.00, 'confirmed', CURRENT_DATE + INTERVAL '15 days' + INTERVAL '10 hours', 'BK20250130001', NOW()); 