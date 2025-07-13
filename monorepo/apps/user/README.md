# User App Backend (Tiyende)

## Automated Dependency Lockfile Sync (Husky)

This project uses [Husky](https://typicode.github.io/husky/) to automatically run `npm install` before every commit. This ensures that your `package-lock.json` is always up to date and in sync with `package.json`, which is required for successful CI/CD and Railway deployments.

**How it works:**
- On every commit, Husky runs `npm install`.
- If you add or change dependencies, the lock file will be updated automatically.
- Always commit the updated `package-lock.json` if it changes.

No manual steps are needed—just commit as usual!

---

## Overview
This backend powers the user-facing app for Tiyende. It is built with Node.js, Express, and connects to a PostgreSQL database using the `pg` library (node-postgres). Authentication uses bcrypt for password hashing. Logging is handled by Winston.

## Database Access
- **Library:** [pg (node-postgres)](https://node-postgres.com/)
- **Connection:** Uses a PostgreSQL connection pool (`Pool` from `pg`).
- **Environment:** The database connection string is loaded from the `DATABASE_URL` environment variable.

## Key Endpoints

### `/api/user/routes`
- **Purpose:** Returns all available bus routes. Optionally filterable by vendor.
- **Vendor Name:**
  - The backend joins the `routes` and `vendors` tables to include the vendor's name as `vendorname` in each route object.
  - Example SQL:
    ```sql
    SELECT routes.*, vendors.name AS vendorname
    FROM routes
    JOIN vendors ON routes.vendor_id = vendors.id
    [WHERE routes.vendor_id = $1] -- if filtering by vendor
    ```
- **Frontend Usage:** The frontend should display `route.vendorname` for the bus vendor name.

### `/api/user/login` and `/api/user/signup`
- Standard login and signup endpoints using username, mobile, and password.

## Table Structure (Relevant Columns)
- **routes**: `id`, `vendor_id`, `departure`, `destination`, `departure_time`, ...
- **vendors**: `id`, `name`, ...

## How to Add Vendor Names to Routes
- Always join the `vendors` table when fetching routes.
- Return the vendor name as `vendorname` in the API response.
- The frontend will use this field to display the correct bus company.

## Tech Stack
- Node.js
- Express
- PostgreSQL
- pg (node-postgres)
- bcryptjs
- winston

## CORS
- Configured to allow requests from the user frontend (default: `http://localhost:6173`).

## Logging
- All requests and errors are logged using Winston.

---

For more details, see `server/index.ts` in this directory. 

# User App Structure & Route Date/Time Handling

## Where Route Dates/Times Are Rendered

- **Route search results and booking cards** are rendered in:
  - `src/components/SearchResults.tsx` (main route list UI)
    - Uses the `formatTime` function to display `departureTime` and `arrivalTime`.
    - Expects these fields to be valid ISO date strings or at least parseable by JavaScript's `Date` constructor.
  - `src/components/TicketList.tsx` (user's booked tickets)

## Where Route Data Comes From

- **API call:**
  - `src/lib/api.ts` → `routes.getAll()` calls `/api/user/routes` on the backend.
- **Backend endpoint:**
  - `server/index.ts` (this app) → `/api/user/routes` endpoint
    - Joins `routes` and `vendors` tables.
    - Returns fields: `departureTime`, `estimatedArrival`, etc.
    - These are sent as they are in the database (e.g., `routes.departuretime AS "departureTime"`).

## Common 'Invalid Date' Issue

- If the backend sends only a time (e.g., `"04:00:00"`) instead of a full date/time (e.g., `"2024-01-01T04:00:00.000Z"`), the frontend will show 'Invalid Date'.
- **Fix:** Ensure the backend sends a full ISO date string for all date/time fields.
  - If you only have a time, combine it with a date before sending to the frontend.
- **Debug:**
  - Console log the value before passing to `new Date()` in the frontend.
  - Check the network response for the actual value sent by the backend.

## Related Files

- **Frontend:**
  - `src/components/SearchResults.tsx` (route cards, date/time rendering)
  - `src/components/TicketList.tsx` (user's tickets)
  - `src/lib/api.ts` (API calls)
- **Backend:**
  - `server/index.ts` (`/api/user/routes` endpoint)
  - Database: `routes` table, fields: `departuretime`, `estimatedarrival`

---

**If you see 'Invalid Date', check the backend response and ensure all date/time fields are valid ISO strings!** 