# Kubernetes and Knative Setup

This directory contains Kubernetes manifests and Knative function templates for deploying a serverless FaaS environment.

## Directory Structure

```
kubernetes/
  base/                 # Base Kubernetes manifests for infrastructure services
    db.yaml             # PostgreSQL database deployment
    redis.yaml          # Redis cache deployment
  funcs/                # Knative function templates
    get-users/          # Example function for retrieving user data
      Dockerfile        # Container build definition
      index.ts          # TypeScript function implementation
      tsconfig.json     # TypeScript configuration
      package.json      # Node.js dependencies
      knative-service.yaml # Knative service definition
```

## Prerequisites

1. Kubernetes cluster with Knative Serving installed
2. Docker for building container images
3. kubectl configured to access your cluster
4. Container registry access (Docker Hub, GCR, ECR, etc.)

## Knative Functions

Each function in the `funcs/` directory is a self-contained TypeScript HTTP server that:

- Listens on port 8080 (Knative standard)
- Accepts HTTP requests (GET/POST)
- Returns JSON responses
- Can be built and deployed as a container

### Building and Deploying Functions

To build and deploy a function:

1. Build the Docker image:
   ```bash
   cd kubernetes/funcs/get-users
   docker build -t your-registry/get-users:latest .
   ```

2. Push the image to your container registry:
   ```bash
   docker push your-registry/get-users:latest
   ```

3. Deploy the Knative service:
   ```bash
   # Replace ${REGISTRY_URL} with your registry URL
   sed "s|\${REGISTRY_URL}|your-registry|g" knative-service.yaml | kubectl apply -f -
   ```

## Infrastructure Services

The `base/` directory contains Kubernetes manifests for core infrastructure services:

- **PostgreSQL**: Persistent database with volume storage
- **Redis**: In-memory cache with persistence

Deploy these services with:

```bash
kubectl apply -f kubernetes/base/
```

## Local Development

For local development of functions:

1. Install dependencies:
   ```bash
   cd kubernetes/funcs/get-users
   npm install
   ```

2. Run in development mode:
   ```bash
   npm run dev
   ```

3. Test the API:
   ```bash
   curl -X POST http://localhost:8080/users -H "Content-Type: application/json" -d '{"filter":"john"}'
   ```
