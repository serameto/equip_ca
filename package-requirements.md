# Required Package Installation

This casino equipment management system requires the following package to be installed:

## Supabase Client

```bash
npm install @supabase/supabase-js
```

## Package Information

- **Package**: `@supabase/supabase-js`
- **Purpose**: PostgreSQL database client for real-time applications
- **Usage**: Database operations, authentication, real-time subscriptions
- **Fallback**: LocalStorage mock implementation when not configured

## Environment Setup

The application will work in two modes:

### 1. Mock Mode (Default)
- Uses localStorage for data persistence
- No external dependencies required
- Includes sample data for testing

### 2. Supabase Mode (Production)
- Requires valid Supabase project credentials
- Real PostgreSQL database
- Real-time updates and collaboration

## Configuration

Set up your environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Or use the built-in setup interface to configure Supabase connection dynamically.