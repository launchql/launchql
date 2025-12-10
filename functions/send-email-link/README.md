# @launchql/send-email-link-fn

Knative-compatible email link function used with the LaunchQL jobs system. It is designed to be invoked by `@launchql/knative-job-worker` as an HTTP function named `send-email-link`.

The function:
- Reads metadata about the tenant/site from a GraphQL API
- Generates a styled HTML email using `@launchql/mjml`
- Sends the email via `@launchql/postmaster`
- Supports invite, password reset, and email verification flows

## Expected job payload

Jobs should use `task_identifier = 'send-email-link'` and a JSON payload like:

```json
{
  "email_type": "invite_email",
  "email": "user@example.com",
  "invite_token": "abc123",
  "sender_id": "00000000-0000-0000-0000-000000000001"
}
```

Supported `email_type` values and parameters:

- `invite_email`
  - `email` (string, required)
  - `invite_token` (string, required)
  - `sender_id` (UUID string, required)
- `forgot_password`
  - `email` (string, required)
  - `user_id` (UUID string, required)
  - `reset_token` (string, required)
- `email_verification`
  - `email` (string, required)
  - `email_id` (UUID string, required)
  - `verification_token` (string, required)

If required fields are missing the function returns a small JSON object like:

```json
{ "missing": "email_type" }
```

## HTTP contract (with knative-job-worker)

The function is wrapped by `@launchql/knative-job-fn`, so it expects:

- HTTP method: `POST`
- Body: JSON job payload (see above)
- Headers (set by `@launchql/knative-job-worker`):
  - `X-Worker-Id`
  - `X-Job-Id`
  - `X-Database-Id`
  - `X-Callback-Url`

The handler will:

1. Resolve the tenant/site by `databaseId` via GraphQL
2. Generate an email link and HTML via `@launchql/mjml`
3. Send the email with `@launchql/postmaster`
4. Respond with HTTP 200 and JSON:

```json
{ "complete": true }
```

Errors are propagated through the Express error middleware installed by `@launchql/knative-job-fn`, so they can be translated into `X-Job-Error` callbacks by your gateway/callback server.

## Environment variables

Required:

- `GRAPHQL_URL`  
  GraphQL endpoint for the tenant database (for `GetUser` and/or per-tenant data).

Recommended / optional:

- `META_GRAPHQL_URL`  
  GraphQL endpoint for meta/database-level schema. Defaults to `GRAPHQL_URL` when not set.
- `GRAPHQL_AUTH_TOKEN`  
  Bearer token to send as `Authorization` header for GraphQL requests.
- `DEFAULT_DATABASE_ID`  
  Used if `X-Database-Id` is not provided by the worker. In normal jobs usage, `X-Database-Id` should always be present.

Email delivery (used by `@launchql/postmaster`):

- Typically Mailgun or another provider; consult `@launchql/postmaster` docs. A common pattern is:
  - `MAILGUN_API_KEY`
  - `MAILGUN_DOMAIN`
  - `MAILGUN_FROM`

## Building locally

From the repo root:

```bash
pnpm --filter="@launchql/send-email-link-fn" build
```

This compiles TypeScript into `dist/`.

## Dockerfile

The function is intended to be containerized and run as a Knative Service. A minimal Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@9 && pnpm install --prod

# Copy compiled code
COPY dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/index.js"]
```

Build and push:

```bash
pnpm --filter="@launchql/send-email-link-fn" build
docker build -t your-registry/send-email-link-fn:latest functions/send-email-link
docker push your-registry/send-email-link-fn:latest
```

## Example Knative Service

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: send-email-link
  namespace: default
spec:
  template:
    spec:
      containers:
        - image: your-registry/send-email-link-fn:latest
          env:
            - name: GRAPHQL_URL
              value: "https://api.your-domain.com/graphql"
            - name: META_GRAPHQL_URL
              value: "https://meta-api.your-domain.com/graphql"
            - name: GRAPHQL_AUTH_TOKEN
              valueFrom:
                secretKeyRef:
                  name: graphql-auth
                  key: token
            # MAILGUN / Postmaster config here...
            - name: MAILGUN_API_KEY
              valueFrom:
                secretKeyRef:
                  name: mailgun
                  key: api-key
```

Once deployed, point `@launchql/knative-job-worker` at this service by configuring:

- `KNATIVE_SERVICE_URL` to route `/send-email-link` to this function
- `JOBS_SUPPORTED=send-email-link` (or `JOBS_SUPPORT_ANY=true`)

