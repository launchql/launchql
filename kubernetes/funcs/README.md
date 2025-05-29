# Knative Functions

This directory contains TypeScript-based cloud functions designed to run on Knative Serving.

## Function Structure

Each function follows this structure:

```
function-name/
  ├── Dockerfile         # Container build definition
  ├── package.json       # Node.js dependencies
  ├── tsconfig.json      # TypeScript configuration
  ├── src/
  │   └── index.ts       # Function implementation
  └── knative-service.yaml # Knative service definition
```

## Creating a New Function

To create a new function:

1. Copy the `get-users` directory as a template:
   ```bash
   cp -r get-users my-new-function
   ```

2. Update the `package.json` with your function name and dependencies

3. Implement your function logic in `src/index.ts`

4. Update the `knative-service.yaml` with your function name and resource requirements

## Building and Testing Locally

To build and test a function locally:

```bash
cd my-function
npm install
npm run dev
```

The function will be available at http://localhost:8080

## Deploying to Knative

Use the provided helper script to build and deploy:

```bash
../build-and-deploy.sh my-function
```

Or manually:

```bash
# Build the Docker image
docker build -t my-registry/my-function:latest .

# Push to registry
docker push my-registry/my-function:latest

# Deploy to Knative
sed "s|\${REGISTRY_URL}|my-registry|g" knative-service.yaml | kubectl apply -f -
```
