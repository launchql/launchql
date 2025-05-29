import fetch from 'cross-fetch';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

interface OllamaEmbeddingResponse {
  embedding: number[];
}

export class OllamaClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embedding: ${response.statusText}`);
    }

    const data: OllamaEmbeddingResponse = await response.json();
    return data.embedding;
  }

  async generateResponse(prompt: string, context?: string): Promise<string> {
    const fullPrompt = context 
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer:`
      : prompt;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: fullPrompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate response: ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  }

  async generateStreamingResponse(
    prompt: string,
    onChunk: (chunk: string) => void,
    context?: string
  ): Promise<void> {
    const fullPrompt = context 
      ? `Context: ${context}\n\nQuestion: ${prompt}\n\nAnswer:`
      : prompt;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: fullPrompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate streaming response: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data: OllamaResponse = JSON.parse(line);
          if (data.response) {
            onChunk(data.response);
          }
        } catch (error) {
          console.error('Error parsing chunk:', error);
        }
      }
    }
  }
}

// Example usage:
/*
const ollama = new OllamaClient();

// Generate embedding
const embedding = await ollama.generateEmbedding('Hello, world!');

// Generate response with context
const response = await ollama.generateResponse(
  'What is the capital of France?',
  'Paris is the capital city of France.'
);

// Generate streaming response
await ollama.generateStreamingResponse(
  'Tell me a story',
  undefined,
  (chunk) => console.log(chunk)
);
*/ 