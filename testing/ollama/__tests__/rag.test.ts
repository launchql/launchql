process.env.LOG_SCOPE = 'ollama';
jest.setTimeout(60000);

import { PgTestClient, getConnections } from 'pgsql-test';
import { OllamaClient } from '../src/utils/ollama';
import fetch from 'cross-fetch';

let pg: PgTestClient;
let teardown: () => Promise<void>;
let ollama: OllamaClient;

const formatVector = (embedding: number[]): string => `[${embedding.join(',')}]`;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
  ollama = new OllamaClient();
});

afterAll(() => teardown());

describe('Retrieval Augmented Generation (RAG)', () => {
  it('should generate a response using retrieved context', async () => {
    // 1. Create a document with clear sections about machine learning and neural networks
    const longDocument = `
      Machine Learning Basics:
      Machine learning is a subset of artificial intelligence that enables systems to learn from data.
      These systems improve their performance through experience without explicit programming.
      Machine learning algorithms can be supervised, unsupervised, or reinforcement learning based.

      Neural Networks Explained:
      Neural networks are a fundamental concept in machine learning, inspired by the human brain.
      They consist of interconnected nodes that process information in layers.
      Deep learning uses neural networks with many layers to solve complex problems.
      Each layer in a neural network can learn different features from the input data.
      Neural networks are particularly effective for pattern recognition and classification tasks.

      Deep Learning Applications:
      Deep learning has revolutionized many fields through its use of neural networks.
      It has achieved breakthroughs in computer vision, natural language processing, and more.
      The success of deep learning depends on both the architecture of neural networks and the quality of training data.
    `.trim();

    // 2. Generate embedding for the full document
    const docEmbedding = await ollama.generateEmbedding(longDocument);

    // 3. Insert the document
    const docResult = await pg.client.query(
      `INSERT INTO intelligence.documents (title, content, embedding)
       VALUES ($1, $2, $3::vector)
       RETURNING id`,
      ['ML and Neural Networks Guide', longDocument, formatVector(docEmbedding)]
    );
    const docId = docResult.rows[0].id;

    // 4. Create chunks
    await pg.client.query(
      'SELECT intelligence.create_document_chunks($1, $2, $3)',
      [docId, 300, 100]
    );

    // 5. Get chunks and generate embeddings
    const chunks = await pg.client.query(
      `SELECT id, content FROM intelligence.chunks WHERE document_id = $1 ORDER BY chunk_index`,
      [docId]
    );

    for (const chunk of chunks.rows) {
      const chunkEmbedding = await ollama.generateEmbedding(chunk.content);
      await pg.client.query(
        'UPDATE intelligence.chunks SET embedding = $1::vector WHERE id = $2',
        [formatVector(chunkEmbedding), chunk.id]
      );
    }

    // 6. Search for similar chunks using a query
    const query = 'How do neural networks work and what makes them effective?';
    const queryEmbedding = await ollama.generateEmbedding(query);

    const similarChunks = await pg.client.query(
      `SELECT content, similarity
       FROM intelligence.find_similar_chunks($1::vector, $2, $3)
       ORDER BY similarity DESC`,
      [formatVector(queryEmbedding), 3, 0.3]
    );

    // 7. Prepare context for RAG
    const context = similarChunks.rows
      .map(row => row.content)
      .join('\n\n');

    // 8. Generate RAG response using Ollama
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'mistral',
        prompt: `Based on the following context, answer the question. If the context doesn't contain enough information, say so.

Context:
${context}

Question: ${query}

Answer:`,
        stream: false
      })
    });

    const result = await response.json();
    console.log('\nRAG Response:');
    console.log(result.response);

    // 9. Verify the response
    expect(result.response).toBeTruthy();
    expect(result.response.length).toBeGreaterThan(0);
    
    // Check if the response contains relevant terms
    const responseLower = result.response.toLowerCase();
    expect(responseLower).toMatch(/neural\s+network/);
    expect(responseLower).toMatch(/layer/);
  });
}); 