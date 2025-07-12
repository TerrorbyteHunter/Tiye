## User Profile Editing & Persistence

- The Edit Profile page allows users to update their name, email, phone, and address.
- When the form is submitted, the frontend sends the updated data to the backend via a PATCH request to `/api/user/me`.
- The backend authenticates the user and updates the relevant fields in the PostgreSQL database.
- The backend endpoint supports both `name` and `fullName` fields from the frontend. If only `name` is provided, it is mapped to `fullName` for database consistency.
- All changes are persistent: when the user reloads the profile page, the latest data is fetched from the backend and shown in the UI.
- The backend returns the updated user object (excluding sensitive fields like password and token).

**Supported fields for update:**
- `fullName` (or `name`)
- `email`
- `phone`
- `address`

**How it works:**
1. User edits their profile and submits the form.
2. Frontend sends a PATCH request to `/api/user/me` with the updated fields.
3. Backend validates and updates the user in the database.
4. Changes are immediately persistent and visible on next profile load. 