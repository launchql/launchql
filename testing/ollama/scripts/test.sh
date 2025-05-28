#!/bin/bash

# Endpoint and model
OLLAMA_URL="http://localhost:11434/api/generate"
MODEL="mistral"

# Prompt to send
read -r -d '' PROMPT << EOM
What's the capital of France?
EOM

# Send POST request
RESPONSE=$(curl -s -X POST "$OLLAMA_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL\",
    \"prompt\": \"$PROMPT\"
  }")

# Output response
echo "Response from Mistral:"
echo "$RESPONSE"
