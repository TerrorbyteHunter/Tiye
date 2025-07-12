# Customer Management Guide for User App

## Overview

This guide explains how end users (customers) from the user app are now managed in the database instead of in-memory storage.

## Database Structure

### Customers Table
```sql
CREATE TABLE customers (
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
```

## How It Works

### 1. User Registration/Signup
- When a user signs up through the user app, they provide their mobile number and name
- The system checks if a customer with that mobile number already exists
- If not, a new customer record is created
- If yes, the existing customer is logged in

### 2. User Login
- Users login with their mobile number
- The system finds the customer by mobile number
- Updates the `last_login` timestamp
- Returns a JWT token for authentication

### 3. User Profile Management
- Users can view and update their profile information
- Profile data is stored in the `customers` table
- Mobile number is used as the unique identifier

## SQL Queries for Management

### Check if customers table exists:
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'customers'
) as table_exists;
```

### View all customers:
```sql
SELECT * FROM customers ORDER BY created_at DESC;
```

### Count total customers:
```sql
SELECT COUNT(*) as total_customers FROM customers;
```

### Find customer by mobile:
```sql
SELECT * FROM customers WHERE mobile = '260000000000';
```

### Find customer by email:
```sql
SELECT * FROM customers WHERE email = 'user@example.com';
```

### Get recent signups (last 7 days):
```sql
SELECT * FROM customers 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Get active customers (logged in recently):
```sql
SELECT * FROM customers 
WHERE last_login >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY last_login DESC;
```

### Get customers with their booking count:
```sql
SELECT 
    c.id,
    c.name,
    c.mobile,
    c.email,
    c.created_at,
    COUNT(t.id) as booking_count
FROM customers c
LEFT JOIN tickets t ON c.mobile = t.customer_phone
GROUP BY c.id, c.name, c.mobile, c.email, c.created_at
ORDER BY booking_count DESC;
```

### Update customer information:
```sql
UPDATE customers 
SET name = 'New Name', email = 'newemail@example.com', updated_at = CURRENT_TIMESTAMP
WHERE mobile = '260000000000';
```

### Deactivate a customer:
```sql
UPDATE customers 
SET is_active = false, updated_at = CURRENT_TIMESTAMP
WHERE mobile = '260000000000';
```

### Delete a customer (be careful!):
```sql
DELETE FROM customers WHERE mobile = '260000000000';
```

## API Endpoints

### User Registration/Login
- **POST** `/api/user/login`
- Handles both signup and login
- Creates new customer if mobile doesn't exist

### Get User Profile
- **GET** `/api/user/me`
- Returns current user's profile information

### Update User Profile
- **PATCH** `/api/user/me`
- Updates user's name and email

## Migration from In-Memory to Database

The system has been updated to use the database instead of in-memory storage. This means:

1. **Data Persistence**: Customer data survives server restarts
2. **Scalability**: Can handle many more customers
3. **Query Capability**: Can run complex queries and analytics
4. **Backup**: Data can be backed up with the database

## Testing

### Test Customer Creation:
```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "260123456789", "name": "Test User"}'
```

### Test Customer Login:
```bash
curl -X POST http://localhost:4000/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "260123456789"}'
```

## Security Considerations

1. **Mobile Number Validation**: Ensure mobile numbers are properly validated
2. **Rate Limiting**: Consider implementing rate limiting for login attempts
3. **Data Privacy**: Ensure customer data is handled according to privacy regulations
4. **Backup**: Regular database backups are essential

## Future Enhancements

1. **Email Verification**: Add email verification for customers
2. **Password Support**: Add optional password-based authentication
3. **Profile Pictures**: Implement avatar upload functionality
4. **Customer Analytics**: Add analytics dashboard for customer behavior
5. **Customer Support**: Add customer support ticket system 