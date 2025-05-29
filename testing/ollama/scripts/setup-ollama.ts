import fetch from 'cross-fetch';

const OLLAMA_API = 'http://localhost:11434';

interface OllamaResponse {
  response: string;
  done: boolean;
}

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

interface OllamaModelsResponse {
  models: OllamaModel[];
}

interface PullResponse {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function safeApiCall<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

async function pullModel(modelName: string) {
  console.log(`Pulling model: ${modelName}...`);
  try {
    const response = await fetch(`${OLLAMA_API}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const lines = text.split('\n').filter(Boolean);

    for (const line of lines) {
      try {
        const data = JSON.parse(line) as PullResponse;
        if (data.status === 'pulling') {
          const progress = data.total ? Math.round((data.completed || 0) / data.total * 100) : 0;
          process.stdout.write(`\rPulling ${modelName}: ${progress}% complete`);
        } else if (data.status === 'success') {
          console.log('\nModel pulled successfully!');
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    }
  } catch (error) {
    console.error(`\nFailed to pull model ${modelName}:`, error);
    throw error;
  }
}

async function listModels() {
  try {
    const data = await safeApiCall<OllamaModelsResponse>(`${OLLAMA_API}/api/tags`);
    console.log('Available models:', data.models);
    return data.models;
  } catch (error) {
    console.error('Failed to list models:', error);
    throw error;
  }
}

async function testModel(modelName: string) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const messages: ChatMessage[] = [
      { role: 'user', content: 'Say hello in a creative way' }
    ];

    const response = await fetch(`${OLLAMA_API}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        messages,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const lines = text.split('\n').filter(Boolean);
    let fullResponse = '';

    for (const line of lines) {
      try {
        const data = JSON.parse(line) as { message: ChatMessage };
        if (data.message?.content) {
          fullResponse += data.message.content;
          process.stdout.write(data.message.content);
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    }
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error(`Failed to test model ${modelName}:`, error);
    throw error;
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  try {
    // Pull Mistral model
    await pullModel('mistral');
    
    // Wait for model to be fully loaded
    console.log('Waiting for model to be fully loaded...');
    await sleep(10000); // Increased to 10 seconds
    
    // List available models
    await listModels();
    
    // Test the model
    await testModel('mistral');
    
    console.log('Setup completed successfully!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main(); 