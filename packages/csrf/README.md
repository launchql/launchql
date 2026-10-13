# @constructive-io/csrf

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
  <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE">
    <img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  </a>
  <a href="https://www.npmjs.com/package/@constructive-io/csrf">
    <img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=packages%2Fcsrf%2Fpackage.json"/>
  </a>
</p>

> Lightweight CSRF protection for Express applications

A minimal, zero-dependency CSRF protection library using the double-submit cookie pattern. Provides cryptographically secure token generation with timing-safe verification.

## Installation

```bash
pnpm add @constructive-io/csrf
```

## Quick Start

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import { createCsrfMiddleware, csrfErrorHandler } from '@constructive-io/csrf';

const app = express();
app.use(cookieParser());
app.use(express.json());

const csrf = createCsrfMiddleware();

// Set CSRF token cookie on all requests
app.use(csrf.setToken);

// Protect state-changing routes
app.post('/api/*', csrf.protect);
app.put('/api/*', csrf.protect);
app.delete('/api/*', csrf.protect);

// Handle CSRF errors
app.use(csrfErrorHandler);
```

## Usage

### Form Submissions

Include the CSRF token as a hidden field in your forms:

```html
<form method="POST" action="/api/submit">
  <input type="hidden" name="_csrf" value="{{csrfToken}}" />
  <button type="submit">Submit</button>
</form>
```

Get the token value from the cookie or use the `getToken` helper:

```typescript
app.get('/form', (req, res) => {
  const token = csrf.getToken(req);
  res.render('form', { csrfToken: token });
});
```

### AJAX/Fetch Requests

For JavaScript requests, read the token from the cookie and send it in a header:

```typescript
// Client-side JavaScript
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrf_token='))
  ?.split('=')[1];

fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token,
  },
  body: JSON.stringify({ data: 'value' }),
});
```

## Configuration

```typescript
const csrf = createCsrfMiddleware({
  cookieName: 'csrf_token',        // Cookie name (default: 'csrf_token')
  headerName: 'x-csrf-token',      // Header name for AJAX (default: 'x-csrf-token')
  fieldName: '_csrf',              // Form field name (default: '_csrf')
  tokenLength: 32,                 // Token length in bytes (default: 32)
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],  // Methods to skip (default)
  cookieOptions: {
    httpOnly: true,                // Not accessible via JavaScript
    secure: true,                  // HTTPS only in production
    sameSite: 'lax',              // CSRF protection
    maxAge: 86400 * 1000,         // 24 hours, in milliseconds (Express `res.cookie` unit)
    path: '/',
  },
});
```

## API

### `createCsrfMiddleware(config?)`

Creates CSRF middleware with the following methods:

- `setToken(req, res, next)` - Sets CSRF token cookie if not present
- `protect(req, res, next)` - Validates CSRF token on state-changing requests
- `getToken(req)` - Returns the current CSRF token from cookies
- `generateToken()` - Generates a new random token
- `verifyToken(expected, actual)` - Timing-safe token comparison

### `csrfErrorHandler(err, req, res, next)`

Express error handler for CSRF errors. Returns 403 with JSON error response.

### `generateToken(length?)`

Generate a cryptographically random token (default 32 bytes = 64 hex chars).

### `verifyToken(expected, actual)`

Timing-safe comparison of two tokens. Returns `true` if they match.

## How It Works

This library implements the **double-submit cookie pattern**:

1. Server generates a random token and stores it in a cookie
2. Client includes the token in requests (header or form field)
3. Server compares the cookie value with the submitted value
4. If they match, the request is legitimate

This works because:
- Attackers can't read cookies from other domains (same-origin policy)
- Attackers can't set cookies for your domain
- Only legitimate requests from your site can include both the cookie and the matching token
