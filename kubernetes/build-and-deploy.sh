#!/bin/bash
set -e

REGISTRY_URL=${REGISTRY_URL:-"docker.io/yourusername"}
FUNCTION_NAME=$1
FUNCTION_VERSION=${2:-"latest"}
LOCAL_TEST=${LOCAL_TEST:-"true"}  # Default to local testing
DEPLOY_ONLY=${DEPLOY_ONLY:-"false"}

if [ -z "$FUNCTION_NAME" ]; then
  echo "Usage: $0 <function-name> [version] [options]"
  echo "Example: $0 get-users v1.0.0"
  echo ""
  echo "Options:"
  echo "  LOCAL_TEST=true|false   Test function locally before pushing (default: true)"
  echo "  DEPLOY_ONLY=true|false  Skip build and push, only deploy (default: false)"
  echo "  REGISTRY_URL=url        Container registry URL (default: docker.io/yourusername)"
  exit 1
fi

FUNCTION_DIR="./funcs/$FUNCTION_NAME"
if [ ! -d "$FUNCTION_DIR" ]; then
  echo "Error: Function directory $FUNCTION_DIR does not exist"
  exit 1
fi

function test_locally() {
  echo "Testing function locally..."
  cd "$FUNCTION_DIR"
  
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
  fi
  
  echo "Building TypeScript..."
  npm run build
  
  echo "Starting function locally on port 8080..."
  npm start &
  PID=$!
  
  sleep 2
  
  echo "Testing function endpoints..."
  curl -s http://localhost:8080/ || { echo "Error: Function not responding"; kill $PID; exit 1; }
  echo ""
  echo "Testing POST endpoint..."
  curl -s -X POST http://localhost:8080/users -H "Content-Type: application/json" -d '{"filter":"john"}' || { echo "Error: POST endpoint failed"; kill $PID; exit 1; }
  echo ""
  
  echo "Local test successful, stopping function..."
  kill $PID
  
  cd - > /dev/null
}

if [ "$DEPLOY_ONLY" != "true" ]; then
  if [ "$LOCAL_TEST" == "true" ]; then
    test_locally
  fi
  
  echo "Building Docker image for $FUNCTION_NAME..."
  cd "$FUNCTION_DIR"
  docker build -t "$REGISTRY_URL/$FUNCTION_NAME:$FUNCTION_VERSION" .
  cd - > /dev/null
  
  if [ "$LOCAL_TEST" == "true" ]; then
    echo "Testing Docker image locally..."
    docker run -d --name test-$FUNCTION_NAME -p 8080:8080 "$REGISTRY_URL/$FUNCTION_NAME:$FUNCTION_VERSION"
    
    sleep 2
    
    echo "Testing function in Docker..."
    curl -s http://localhost:8080/ || { echo "Error: Function in Docker not responding"; docker rm -f test-$FUNCTION_NAME; exit 1; }
    echo ""
    
    docker rm -f test-$FUNCTION_NAME
  fi
  
  read -p "Push image to registry $REGISTRY_URL? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Pushing image to registry..."
    docker push "$REGISTRY_URL/$FUNCTION_NAME:$FUNCTION_VERSION"
  else
    echo "Skipping push to registry."
    REGISTRY_URL="localhost"
  fi
fi

read -p "Deploy to Knative? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Deploying Knative service..."
  cd "$FUNCTION_DIR"
  sed "s|\${REGISTRY_URL}|$REGISTRY_URL|g" knative-service.yaml > /tmp/knative-service-resolved.yaml
  kubectl apply -f /tmp/knative-service-resolved.yaml
  
  echo "Waiting for service to be ready..."
  kubectl wait --for=condition=Ready ksvc/$FUNCTION_NAME --timeout=60s
  
  SERVICE_URL=$(kubectl get ksvc $FUNCTION_NAME -o jsonpath='{.status.url}')
  echo "Function deployed successfully!"
  echo "Service URL: $SERVICE_URL"
else
  echo "Skipping Knative deployment."
fi

echo "Process completed successfully!"
