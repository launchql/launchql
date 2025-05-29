process.env.LOG_SCOPE = 'ollama';
jest.setTimeout(60000);

import { PgTestClient, getConnections } from 'pgsql-test';
import { OllamaClient } from '../src/utils/ollama';
import fetch from 'cross-fetch';

let pg: PgTestClient;
let teardown: () => Promise<void>;
let ollama: OllamaClient;

const formatVector = (embedding: number[]): string => `[${embedding.join(',')}]`;

// Log collection
const logs: string[] = [];
const addLog = (service: string, action: string, duration: number) => {
  logs.push(`[${service.toUpperCase()}] ${action}: ${duration.toFixed(2)}ms`);
};

// Helper function to measure time
const measureTime = async <T>(service: 'ollama' | 'postgres' | 'other', action: string, fn: () => Promise<T>): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  addLog(service, action, end - start);
  return result;
};

// Helper to add summary logs
const addSummary = (title: string, value: string) => {
  logs.push(`[SUMMARY] ${title}: ${value}`);
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
      'ollama',
      'generateEmbedding (full document)',
      () => ollama.generateEmbedding(longDocument)
    );

    // 3. Insert the document
    const docResult = await measureTime(
      'postgres',
      'INSERT (documents table)',
      () => pg.client.query(
        `INSERT INTO intelligence.documents (title, content, embedding)
         VALUES ($1, $2, $3::vector)
         RETURNING id`,
        ['InterchainJS and Hyperweb Overview', longDocument, formatVector(docEmbedding)]
      )
    );
    const docId = docResult.rows[0].id;

    // 4. Create chunks
    // can this be done off-db?
    await measureTime(
      'postgres',
      'create_document_chunks',
      () => pg.client.query(
        'SELECT intelligence.create_document_chunks($1, $2, $3)',
        [docId, 300, 100]
      )
    );

    // 5. Get chunks and generate embeddings
    const chunks = await measureTime(
      'postgres',
      'SELECT (chunks table)',
      () => pg.client.query(
        `SELECT id, content FROM intelligence.chunks WHERE document_id = $1 ORDER BY chunk_index`,
        [docId]
      )
    );

    // Process chunks
    let totalChunkTime = 0;
    for (const [index, chunk] of chunks.rows.entries()) {
      const chunkStart = performance.now();
      
      const chunkEmbedding = await measureTime(
        'ollama',
        `generateEmbedding (chunk ${index + 1}/${chunks.rows.length})`,
        () => ollama.generateEmbedding(chunk.content)
      );

      await measureTime(
        'postgres',
        `UPDATE (chunk ${index + 1} embedding)`,
        () => pg.client.query(
          'UPDATE intelligence.chunks SET embedding = $1::vector WHERE id = $2',
          [formatVector(chunkEmbedding), chunk.id]
        )
      );

      const chunkEnd = performance.now();
      totalChunkTime += chunkEnd - chunkStart;
    }

    // 6. Search for similar chunks using a query
    const query = 'How does the Interchain JavaScript Stack simplify cross-chain app development? Can you give me a few taglines for a new webpage I can use as h1 and h2s?';
    
    const queryEmbedding = await measureTime(
      'ollama',
      'generateEmbedding (query)',
      () => ollama.generateEmbedding(query)
    );

    const similarChunks = await measureTime(
      'postgres',
      'find_similar_chunks',
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
      'ollama',
      'generate (RAG response)',
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

    // Add summaries at the end
    logs.push(''); // Add blank line before summary
    logs.push('Summary:');
    logs.push('========');

    // Calculate service totals
    const serviceTotals = logs.reduce((acc, log) => {
      if (log.startsWith('[OLLAMA]')) {
        acc.ollama += parseFloat(log.split(': ')[1]);
      } else if (log.startsWith('[POSTGRES]')) {
        acc.postgres += parseFloat(log.split(': ')[1]);
      }
      return acc;
    }, { ollama: 0, postgres: 0 });

    addSummary('Total Ollama time', `${serviceTotals.ollama.toFixed(2)}ms`);
    addSummary('Total Postgres time', `${serviceTotals.postgres.toFixed(2)}ms`);
    addSummary('Total chunk processing time', `${totalChunkTime.toFixed(2)}ms`);
    addSummary('Average time per chunk', `${(totalChunkTime / chunks.rows.length).toFixed(2)}ms`);

    // Log everything at once
    console.log('\nPerformance Log:');
    console.log('===============');
    console.log(logs.join('\n'));
    console.log('\n[RAG] Response:');
    console.log(response.response);

    // 9. Verify the response
    expect(response.response).toBeTruthy();
    expect(response.response.length).toBeGreaterThan(0);
  });
});
