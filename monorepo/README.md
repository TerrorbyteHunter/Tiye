# Tiyende Monorepo

This is a monorepo containing all Tiyende applications and shared packages.

## Project Structure

```
monorepo/
├── apps/                    # Application packages
│   ├── admin/              # Admin dashboard application
│   ├── user/               # User-facing application
│   └── vendor/             # Vendor portal application
├── packages/               # Shared packages
│   ├── config/            # Shared configuration
│   ├── ui/                # Shared UI components
│   └── utils/             # Shared utilities
└── package.json           # Root package.json
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

3. Build all applications:
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start all applications in development mode
- `npm run build` - Build all applications
- `npm run test` - Run tests across all packages
- `npm run lint` - Run linting across all packages 