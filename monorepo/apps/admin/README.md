# Tiyende Admin App

## Overview
The Tiyende Admin App is a modern web dashboard for managing the Tiyende platform. Admins can oversee vendors, customers, routes, tickets, analytics, notifications, system settings, and more. The app is built with React, TypeScript, and Tailwind CSS, and communicates with a backend API for all data operations.

---

## Tech Stack
- **Language:** TypeScript
- **Frontend Framework:** React 18+
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **State Management:** React Query, React hooks
- **Routing:** React Router DOM v6
- **API Communication:** Axios
- **UI Libraries:** Custom components, @tiyende/ui, Radix UI
- **Other:** dotenv, express (for local server), cors

---

## Folder Structure
```
monorepo/apps/admin/
├── client/
│   ├── src/
│   │   ├── components/   # Main UI components (dashboard, analytics, users, vendors, etc.)
│   │   ├── pages/        # Route-based pages (dashboard, notifications, settings, etc.)
│   │   ├── lib/          # API utilities and helpers
│   │   ├── types/        # TypeScript type definitions
│   │   └── index.css     # Global styles (Tailwind base)
│   ├── index.html
│   └── ...
├── server/               # Backend API (Express, routes, services)
│   ├── routes.ts
│   ├── storage.ts
│   └── ...
├── attached_assets/      # SQL and data files
├── shared/               # Shared types and schema
├── package.json          # Project dependencies and scripts
├── vite.config.ts        # Vite build configuration
├── tsconfig.json         # TypeScript configuration
└── ...
```

---

## Main Features
- **Dashboard:** Overview of bookings, revenue, vendors, and recent activity.
- **Analytics:** Charts and reports for business insights.
- **User Management:** Create, edit, and manage admin users.
- **Vendor Management:** Approve, edit, and manage vendors.
- **Route Management:** Add, edit, and remove bus routes.
- **Ticket Management:** View and manage all tickets.
- **Notifications:** Send and manage notifications to users and vendors.
- **Audit Logs:** Track admin actions and system events.
- **System Settings:** Configure system-wide settings and backup/restore.
- **Role Management:** Assign and manage admin roles and permissions.
- **Backup/Restore:** Manage database backups and restores.

---

## API Usage
- All data is fetched from the backend API (proxied via `/api`).
- API endpoints are defined in `client/src/lib/api.ts`.
- Authentication tokens are stored in localStorage/session and sent with each request.
- Example API usage:
  ```ts
  import { getVendors } from '../lib/api';
  const vendors = await getVendors();
  ```

---

## Environment Setup
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or as configured by Vite).
3. **API Proxy:**
   - All `/api` requests are proxied to `http://localhost:3001` (see `vite.config.ts`).
   - Ensure the backend API is running on port 3001.

---

## Scripts
- `npm run dev` — Start the Vite development server
- `npm run build` — Build the app for production
- `npm run preview` — Preview the production build
- `npm run lint` — Run ESLint on the codebase
- `npm run test` — Run backend and frontend tests (if available)

---

## Important Notes
- **Type Safety:** All code is written in TypeScript for safety and maintainability.
- **UI/UX:** Uses Tailwind CSS and Radix UI for a modern, responsive design.
- **Role-Based Access:** Only authorized admins can access certain features.
- **Audit Logging:** All critical actions are logged for security and compliance.
- **Backup/Restore:** Use the backup manager for regular database backups.
- **Notifications:** Send targeted or broadcast notifications to users and vendors.

---

## Contributing & Maintenance
- Follow the existing code style and use TypeScript strict mode.
- Add new components to `client/src/components/` and shared elements to `client/src/components/shared/`.
- Update type definitions in `client/src/types/` as needed.
- For backend/API changes, coordinate with the backend team to keep endpoints in sync.

---

## Contact
For support or questions, contact the Tiyende team or open an issue in the repository. 