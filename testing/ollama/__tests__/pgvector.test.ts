process.env.LOG_SCOPE = 'ollama';
jest.setTimeout(60000);

import { PgTestClient, getConnections } from 'pgsql-test';
import { OllamaClient } from '../src/utils/ollama';

let pg: PgTestClient;
let teardown: () => Promise<void>;
let ollama: OllamaClient;

const formatVector = (embedding: number[]): string => `[${embedding.join(',')}]`;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
  ollama = new OllamaClient();
});

afterAll(() => teardown());

describe('Vector Search with Document Chunks', () => {
    it('should chunk, embed, and retrieve semantically relevant content', async () => {
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

    // 4. Create chunks of the document with very small size and high overlap
    // Use a reasonably sized chunk size
    await pg.client.query(
      'SELECT intelligence.create_document_chunks($1, $2, $3)',
      [docId, 300, 100]
    );

    // 5. Get the chunks and generate embeddings for each
    const chunks = await pg.client.query(
      `SELECT id, content FROM intelligence.chunks WHERE document_id = $1 ORDER BY chunk_index`,
      [docId]
    );
    console.log(`Generated ${chunks.rows.length} chunks`);

    for (const chunk of chunks.rows) {
      const chunkEmbedding = await ollama.generateEmbedding(chunk.content);
      await pg.client.query(
        'UPDATE intelligence.chunks SET embedding = $1::vector WHERE id = $2',
        [formatVector(chunkEmbedding), chunk.id]
      );
    }

    // Verify chunks have embeddings
    const chunksWithEmbeddings = await pg.client.query(
      'SELECT COUNT(*) FROM intelligence.chunks WHERE embedding IS NOT NULL'
    );
    expect(Number(chunksWithEmbeddings.rows[0].count)).toBeGreaterThan(0);

    // 6. Search for similar chunks using a query
    const query = 'Tell me about machine learning and neural networks';
    const queryEmbedding = await ollama.generateEmbedding(query);

    const similarChunks = await pg.client.query(
      `SELECT content, similarity
       FROM intelligence.find_similar_chunks($1::vector, $2, $3)
       ORDER BY similarity DESC`,
      [formatVector(queryEmbedding), 5, 0.3]
    );

    // 7. Verify the results
    expect(similarChunks.rows.length).toBeGreaterThan(0);
    expect(similarChunks.rows[0].similarity).toBeGreaterThan(0.3);

    const relevantContent = similarChunks.rows
      .map(r => r.content.toLowerCase().replace(/\s+/g, ' '))
      .join(' ');

    console.log(relevantContent);
    
    // Fuzzy matching — regex handles chunking artifacts and partial matches
    expect(relevantContent).toMatch(/learning/);
    expect(relevantContent).toMatch(/neural\s+networks/);
  });
});
