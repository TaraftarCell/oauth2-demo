# OAuth2 Authentication Demo - TaraftarCell Integration

A comprehensive Next.js application demonstrating OAuth2 authentication integration with **TaraftarCell's FenerTalk** and **GalaTalk** platforms, showcasing professional implementation patterns for Turkish sports community applications.

## 🏗 Architecture Overview

This application implements a secure OAuth2 authentication flow using the Authorization Code Grant with PKCE (Proof Key for Code Exchange) for enhanced security. The system supports multi-provider authentication through TaraftarCell's unified OAuth2 infrastructure.

## 🔐 OAuth2 Provider Configuration

### Required OAuth2 Credentials

Before setting up the application, you must obtain the following credentials from TaraftarCell's Developer Console:

#### FenerTalk Provider
- **Client ID**: `AUTH_FENERTALK_CLIENT_ID`
- **Client Secret**: `AUTH_FENERTALK_CLIENT_SECRET`
- **Scopes**: `profile email fenertalk.read fenertalk.write`
- **Redirect URI**: `{YOUR_DOMAIN}/api/auth/callback/fenertalk`

#### GalaTalk Provider
- **Client ID**: `AUTH_GALATALK_CLIENT_ID`
- **Client Secret**: `AUTH_GALATALK_CLIENT_SECRET`
- **Scopes**: `profile email galatalk.read galatalk.write`
- **Redirect URI**: `{YOUR_DOMAIN}/api/auth/callback/galatalk`

### Environment Configuration

Create a `.env.local` file with the following OAuth2 configuration:

```env
# OAuth2 Base Configuration
TARAFTARCELL_OAUTH_URL="https://oauth.taraftarcell.com"
AUTH_SECRET="your-secure-random-string-min-32-chars"

# FenerTalk OAuth2 Provider
AUTH_FENERTALK_CLIENT_ID="your_fenertalk_client_id"
AUTH_FENERTALK_CLIENT_SECRET="your_fenertalk_client_secret"

# GalaTalk OAuth2 Provider
AUTH_GALATALK_CLIENT_ID="your_galatalk_client_id"
AUTH_GALATALK_CLIENT_SECRET="your_galatalk_client_secret"

# Database (Required for session storage)
DATABASE_URL="postgresql://username:password@localhost:5432/oauth_demo"
```

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18.17+ 
- PostgreSQL 12+
- TaraftarCell Developer Account
- Registered OAuth2 Applications

### Installation Steps

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd oauth-demo
   pnpm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your OAuth2 credentials
   ```

3. **Setup Database**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. **Start Development Server**
   ```bash
   pnpm dev
   ```

## 📊 OAuth2 Flow Architecture

### Authentication Flow Diagram

The following diagram illustrates the complete OAuth2 authentication flow implemented in this application:

```mermaid
sequenceDiagram
    participant User as User Browser
    participant App as Next.js App
    participant Auth as NextAuth.js
    participant OAuth as TaraftarCell OAuth2
    participant DB as PostgreSQL

    User->>App: Click "Sign in with FenerTalk/GalaTalk"
    App->>Auth: Initiate OAuth2 flow
    Auth->>OAuth: Redirect to authorization endpoint
    Note over OAuth: /oauth2/authorize?client_id=...&scope=...&code_challenge=...
    
    OAuth->>User: Present login form
    User->>OAuth: Enter credentials & authorize
    OAuth->>Auth: Redirect with authorization code
    Note over Auth: /api/auth/callback/fenertalk?code=...&state=...
    
    Auth->>OAuth: Exchange code for tokens
    Note over OAuth: POST /oauth2/token
    OAuth->>Auth: Return access_token & id_token
    
    Auth->>OAuth: Fetch user profile
    Note over OAuth: GET /oauth2/userinfo
    OAuth->>Auth: Return user profile data
    
    Auth->>DB: Create/update user session
    Auth->>User: Set secure session cookies
    User->>App: Authenticated access granted
```

### Provider Configuration Structure

```mermaid
graph TD
    A[TaraftarCell OAuth2 Base] --> B[FenerTalk Provider]
    A --> C[GalaTalk Provider]
    
    B --> D[Client ID: FENERTALK_*]
    B --> E[Scopes: fenertalk.read, fenertalk.write]
    B --> F[Callback: /callback/fenertalk]
    
    C --> G[Client ID: GALATALK_*]
    C --> H[Scopes: galatalk.read, galatalk.write]
    C --> I[Callback: /callback/galatalk]
    
    D --> J[NextAuth.js Configuration]
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K[Session Management]
    J --> L[Database Integration]
    J --> M[Type-Safe User Profile]
```

## 🔧 OAuth2 Implementation Details

### Provider Configuration

The OAuth2 providers are configured in `src/server/auth/config.ts`:

```typescript
// FenerTalk OAuth2 Provider Configuration
{
  id: "fenertalk",
  name: "Fenertalk",
  type: "oauth" as const,
  clientId: env.AUTH_FENERTALK_CLIENT_ID,
  clientSecret: env.AUTH_FENERTALK_CLIENT_SECRET,
  issuer: `${env.TARAFTARCELL_OAUTH_URL}/`,
  wellKnown: `${env.TARAFTARCELL_OAUTH_URL}/.well-known/openid-configuration`,
  authorization: {
    url: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/authorize`,
    params: {
      scope: "profile email fenertalk.read fenertalk.write",
      response_type: "code",
    },
  },
  token: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/token`,
  userinfo: `${env.TARAFTARCELL_OAUTH_URL}/oauth2/userinfo`,
  checks: ["pkce"], // Enhanced security with PKCE
}
```

### Security Features

- **PKCE Implementation**: Code challenge/verifier for enhanced security
- **State Parameter**: CSRF protection during OAuth2 flow
- **Secure Cookies**: HTTPOnly, Secure, SameSite cookie configuration
- **Token Validation**: JWT signature verification and claims validation
- **Session Management**: Database-backed session storage

### User Profile Mapping

```typescript
interface TaraftarCellProfile {
  sub: string;                    // Unique user identifier
  email?: string;                 // User email address
  given_name?: string;           // First name
  family_name?: string;          // Last name
  name?: string;                 // Full display name
  preferred_username?: string;   // Username
  email_verified?: boolean;      // Email verification status
  picture?: string;              // Profile picture URL
}
```

## 📋 API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signin` | GET | Displays authentication providers |
| `/api/auth/callback/fenertalk` | GET | FenerTalk OAuth2 callback handler |
| `/api/auth/callback/galatalk` | GET | GalaTalk OAuth2 callback handler |
| `/api/auth/signout` | POST | Terminates user session |
| `/api/auth/session` | GET | Returns current session data |

### Development Commands

```bash
# Development server with hot reload
pnpm dev

# Production build
pnpm build && pnpm start

# Database operations
pnpm db:generate    # Generate Prisma client
pnpm db:migrate     # Apply database migrations
pnpm db:studio      # Launch Prisma Studio GUI

# Code quality
pnpm lint           # ESLint check
pnpm typecheck      # TypeScript validation
pnpm format:check   # Prettier formatting check
```

## 🛠 Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 15 | Full-stack React framework with App Router |
| **Authentication** | NextAuth.js v5 | OAuth2/OIDC authentication library |
| **Database** | Prisma + PostgreSQL | Type-safe database operations |
| **API Layer** | tRPC | End-to-end type-safe API |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Type Safety** | TypeScript + Zod | Runtime type validation |

## 🚀 Deployment Configuration

### Vercel Deployment

1. **Environment Variables Setup**
   ```bash
   # Add to Vercel dashboard or use CLI
   vercel env add AUTH_SECRET
   vercel env add AUTH_FENERTALK_CLIENT_ID
   vercel env add AUTH_FENERTALK_CLIENT_SECRET
   vercel env add AUTH_GALATALK_CLIENT_ID
   vercel env add AUTH_GALATALK_CLIENT_SECRET
   vercel env add TARAFTARCELL_OAUTH_URL
   vercel env add DATABASE_URL
   ```

2. **OAuth2 Redirect URIs**
   Update your TaraftarCell OAuth2 applications with production URLs:
   - FenerTalk: `https://your-domain.vercel.app/api/auth/callback/fenertalk`
   - GalaTalk: `https://your-domain.vercel.app/api/auth/callback/galatalk`

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔍 Troubleshooting Guide

### Common OAuth2 Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| **Invalid Redirect URI** | Mismatch between configured and actual callback URL | Update OAuth2 app settings in TaraftarCell console |
| **Invalid Client** | Incorrect client ID or secret | Verify credentials in `.env.local` |
| **Scope Error** | Requested scopes not granted | Check scope configuration in provider setup |
| **Token Exchange Failed** | Network or configuration issue | Enable debug mode and check logs |

### Debug Configuration

Enable detailed logging in development:

```env
NODE_ENV=development
NEXTAUTH_DEBUG=true
```

## 📚 Documentation References

- [NextAuth.js OAuth2 Provider Guide](https://next-auth.js.org/providers/oauth)
- [TaraftarCell OAuth2 API Documentation](https://docs.taraftarcell.com/oauth2)
- [PKCE RFC 7636 Specification](https://tools.ietf.org/html/rfc7636)
- [OAuth2 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
