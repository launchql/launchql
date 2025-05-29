process.env.LOG_SCOPE = 'ollama';
jest.setTimeout(60000);

import { PgTestClient, getConnections } from 'pgsql-test';
import { OllamaClient } from '../src/utils/ollama';
import fetch from 'cross-fetch';

let pg: PgTestClient;
let teardown: () => Promise<void>;
let ollama: OllamaClient;

const formatVector = (embedding: number[]): string => `[${embedding.join(',')}]`;

// Helper function to measure time
const measureTime = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`${label}: ${(end - start).toFixed(2)}ms`);
  return result;
};

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
  ollama = new OllamaClient();
});

afterAll(() => teardown());

describe('Retrieval Augmented Generation (RAG)', () => {
  it('should generate a response using retrieved context', async () => {
    // 1. Create a document with clear sections about the Interchain JS Stack and Hyperweb
    const longDocument = `
      Interchain JavaScript Stack Overview:
      The Interchain JavaScript Stack (InterchainJS) enables developers to build cross-chain applications using familiar TypeScript tooling.
      Built by the creators of CosmWasm, InterchainJS abstracts away blockchain complexities, making smart contract and app development seamless.

      Hyperweb and TypeScript Smart Contracts:
      Hyperweb brings TypeScript fully on-chain with its custom Hyperweb Virtual Machine (HVM), enabling developers to write smart contracts in JavaScript.
      It powers apps across ecosystems like Osmosis, dYdX, and Celestia, providing unified access to decentralized and cloud infrastructure.

      Developer Experience and Infrastructure:
      Hyperweb eliminates the need for Go or Rust, allowing anyone with frontend skills to build full-stack dApps.
      It integrates serverless compute, traditional databases, and decentralized networks in one cohesive stack.
    `.trim();

    // 2. Generate embedding for the full document
    const docEmbedding = await measureTime(
      'Generate document embedding',
      () => ollama.generateEmbedding(longDocument)
    );

    // 3. Insert the document
    const docResult = await measureTime(
      'Insert document',
      () => pg.client.query(
        `INSERT INTO intelligence.documents (title, content, embedding)
         VALUES ($1, $2, $3::vector)
         RETURNING id`,
        ['InterchainJS and Hyperweb Overview', longDocument, formatVector(docEmbedding)]
      )
    );
    const docId = docResult.rows[0].id;

    // 4. Create chunks
    await measureTime(
      'Create document chunks',
      () => pg.client.query(
        'SELECT intelligence.create_document_chunks($1, $2, $3)',
        [docId, 300, 100]
      )
    );

    // 5. Get chunks and generate embeddings
    const chunks = await measureTime(
      'Get chunks from database',
      () => pg.client.query(
        `SELECT id, content FROM intelligence.chunks WHERE document_id = $1 ORDER BY chunk_index`,
        [docId]
      )
    );

    console.log(`Processing ${chunks.rows.length} chunks...`);
    let totalChunkTime = 0;
    for (const chunk of chunks.rows) {
      const chunkStart = performance.now();
      const chunkEmbedding = await ollama.generateEmbedding(chunk.content);
      await pg.client.query(
        'UPDATE intelligence.chunks SET embedding = $1::vector WHERE id = $2',
        [formatVector(chunkEmbedding), chunk.id]
      );
      const chunkEnd = performance.now();
      totalChunkTime += chunkEnd - chunkStart;
    }
    console.log(`Total chunk processing time: ${totalChunkTime.toFixed(2)}ms`);
    console.log(`Average time per chunk: ${(totalChunkTime / chunks.rows.length).toFixed(2)}ms`);

    // 6. Search for similar chunks using a query
    const query = 'How does the Interchain JavaScript Stack simplify cross-chain app development? Can you give me a few taglines for a new webpage I can use as h1 and h2s?';
    
    const queryEmbedding = await measureTime(
      'Generate query embedding',
      () => ollama.generateEmbedding(query)
    );

    const similarChunks = await measureTime(
      'Find similar chunks',
      () => pg.client.query(
        `SELECT content, similarity
         FROM intelligence.find_similar_chunks($1::vector, $2, $3)
         ORDER BY similarity DESC`,
        [formatVector(queryEmbedding), 3, 0.3]
      )
    );

    // 7. Prepare context for RAG
    const context = similarChunks.rows
      .map(row => row.content)
      .join('\n\n');

    // 8. Generate RAG response using Ollama
    const response = await measureTime(
      'Generate RAG response',
      () => fetch('http://localhost:11434/api/generate', {
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
      }).then(res => res.json())
    );

    console.log('\nRAG Response:');
    console.log(response.response);

    // 9. Verify the response
    expect(response.response).toBeTruthy();
    expect(response.response.length).toBeGreaterThan(0);
  });
});
