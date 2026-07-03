# Authentication

## Provider

**Better Auth** with Drizzle adapter.

Better Auth handles:

- Session management
- Password hashing
- Email/password authentication
- Forgot / reset password flow
- CSRF protection

## Auth Configuration

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
})
```

## Auth Routes (Better Auth handles these)

| Route | Purpose |
|-------|---------|
| /api/auth/sign-in | Login |
| /api/auth/sign-up | Registration |
| /api/auth/sign-out | Logout |
| /api/auth/forgot-password | Request reset |
| /api/auth/reset-password | Reset password |

## Application Auth Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | /login | Email + password form |
| Register | /register | Email + password + name form |
| Forgot Password | /forgot-password | Email input, sends reset link |
| Reset Password | /reset-password | New password form with token |

## Registration

- **Open registration** — anyone can sign up
- New users get the "User" role by default
- No email verification required

## Session

- Better Auth manages sessions via HTTP-only cookies
- Middleware checks session on protected routes
- Session is refreshed automatically by Better Auth

## Middleware Protection

```typescript
// src/middleware.ts
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register|forgot-password|reset-password).*)',
  ],
}
```

## Password Recovery

1. User enters email on `/forgot-password`
2. Better Auth sends reset email (configurable transport)
3. User clicks link → `/reset-password?token=xxx`
4. User enters new password → token consumed

## Password Change (authenticated)

- Available on `/profile` page
- Requires current password verification
- Uses Better Auth's built-in password update
