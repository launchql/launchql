-- Deploy my-ollama:migration to pg

BEGIN;

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create schema if missing
CREATE SCHEMA IF NOT EXISTS intelligence;

-- Store full documents
CREATE TABLE IF NOT EXISTS intelligence.documents (
    id SERIAL PRIMARY KEY,
    title TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(4096),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store document chunks
CREATE TABLE IF NOT EXISTS intelligence.chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES intelligence.documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding VECTOR(4096),
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chunks from documents
CREATE OR REPLACE FUNCTION intelligence.create_document_chunks(
    p_document_id INTEGER,
    p_chunk_size INTEGER DEFAULT 1000,
    p_chunk_overlap INTEGER DEFAULT 200
)
RETURNS VOID AS $$
DECLARE
    v_content TEXT;
    v_position INTEGER := 1;
    v_chunk_index INTEGER := 0;
    v_chunk TEXT;
    v_len INTEGER;
BEGIN
    SELECT content INTO v_content
    FROM intelligence.documents
    WHERE id = p_document_id;

    IF v_content IS NULL THEN
        RAISE NOTICE 'No content found for document_id %', p_document_id;
        RETURN;
    END IF;

    v_len := LENGTH(v_content);

    WHILE v_position <= v_len LOOP
        v_chunk := SUBSTRING(v_content FROM v_position FOR p_chunk_size);

        INSERT INTO intelligence.chunks (document_id, content, chunk_index)
        VALUES (p_document_id, v_chunk, v_chunk_index);

        v_position := v_position + (p_chunk_size - p_chunk_overlap);
        v_chunk_index := v_chunk_index + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Similarity search using pgvector
CREATE OR REPLACE FUNCTION intelligence.find_similar_chunks(
    p_embedding VECTOR(4096),
    p_limit INTEGER DEFAULT 5,
    p_similarity_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
    id INTEGER,
    content TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.content,
        1 - (c.embedding <=> p_embedding) AS similarity
    FROM intelligence.chunks c
    WHERE c.embedding IS NOT NULL
      AND 1 - (c.embedding <=> p_embedding) > p_similarity_threshold
    ORDER BY c.embedding <=> p_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON intelligence.chunks(document_id);

-- Optional: index for vector search (approximate ANN in the future)
-- CREATE INDEX ON intelligence.chunks USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

COMMIT;
