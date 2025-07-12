CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL,
    route_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticket_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id),
    FOREIGN KEY (route_id) REFERENCES routes(id),
    FOREIGN KEY (admin_id) REFERENCES admins(id)
); 