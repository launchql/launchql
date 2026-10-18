/**
 * graphile-llm Types
 *
 * Shared type definitions for the LLM plugin.
 */

// ─── Embedder Types ─────────────────────────────────────────────────────────

/**
 * Result from an embedding call, including real token usage from the provider.
 */
export interface EmbeddingResult {
  /** The vector embedding */
  embedding: number[];
  /** Number of prompt tokens consumed (from provider; 0 if unavailable) */
  promptTokens: number;
}

/**
 * A function that converts text into a vector embedding with token usage.
 */
export type EmbedderFunction = (text: string) => Promise<EmbeddingResult>;

/**
 * Configuration for an embedding provider.
 */
export interface EmbedderConfig {
  /** Provider name: 'ollama', 'openai', or 'custom' */
  provider: string;
  /** Model identifier (e.g. 'nomic-embed-text', 'text-embedding-3-small') */
  model?: string;
  /** Base URL for the provider (e.g. 'http://localhost:11434' for Ollama) */
  baseUrl?: string;
}

// ─── Token Usage Types ──────────────────────────────────────────────────────

/**
 * Token usage metadata returned by LLM providers.
 * Maps to the billing schema's inference_log columns.
 */
export interface LlmUsage {
  /** Prompt / input tokens consumed */
  input: number;
  /** Completion / output tokens generated (includes reasoning for providers that count it) */
  output: number;
  /** Reasoning tokens (subset of output — not additive) */
  reasoning: number;
  /** Tokens served from prompt cache (zero cost) */
  cacheRead: number;
  /** Tokens written to prompt cache */
  cacheWrite: number;
  /** input + output + cacheRead + cacheWrite */
  totalTokens: number;
}

// ─── Chat Completion Types ──────────────────────────────────────────────────

/**
 * A single message in a chat conversation.
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Options for a chat completion request.
 */
export interface ChatOptions {
  /** Maximum tokens to generate */
  maxTokens?: number;
  /** Temperature for sampling (0 = deterministic, 1 = creative) */
  temperature?: number;
}

/**
 * Result from a chat completion call, including real token usage.
 */
export interface ChatResult {
  content: string;
  usage: LlmUsage;
}

/**
 * A function that sends messages to a chat completion provider
 * and returns the response with token usage metadata.
 */
export type ChatFunction = (messages: ChatMessage[], options?: ChatOptions) => Promise<ChatResult>;

/**
 * Configuration for a chat completion provider.
 */
export interface ChatConfig {
  /** Provider name: 'ollama', 'openai', or 'custom' */
  provider: string;
  /** Model identifier (e.g. 'llama3', 'gpt-4o') */
  model?: string;
  /** Base URL for the provider */
  baseUrl?: string;
}

// ─── LLM Module Types ───────────────────────────────────────────────────────

/**
 * The shape of the `llm_module` configuration stored in `metaschema_modules_public.llm_module`.
 *
 * This is the per-database configuration that controls which LLM provider
 * and models are available for that API.
 */
export interface LlmModuleData {
  /** Embedding provider: 'ollama', 'openai', or 'custom' */
  embedding_provider: string;
  /** Embedding model identifier */
  embedding_model?: string;
  /** Base URL for the embedding provider */
  embedding_base_url?: string;
  /** Number of dimensions the embedding model produces */
  embedding_dimensions?: number;
  /** Chat/completion provider (for RAG/conversation features) */
  chat_provider?: string;
  /** Chat model identifier */
  chat_model?: string;
  /** Base URL for the chat provider */
  chat_base_url?: string;
  /** Rate limit: requests per minute */
  rate_limit_rpm?: number;
  /** Maximum tokens per request */
  max_tokens_per_request?: number;
  /** Default number of context items for RAG queries */
  rag_context_limit?: number;
}

// ─── RAG Types ──────────────────────────────────────────────────────────────

/**
 * Default configuration for RAG (Retrieval-Augmented Generation) queries.
 */
export interface RagDefaults {
  /**
   * Default number of context items to feed into the RAG prompt.
   * Per-query `contextLimit` overrides this.
   * @default 5
   */
  contextLimit?: number;

  /**
   * Default maximum tokens for the chat completion response.
   * @default 4000
   */
  maxTokens?: number;

  /**
   * Default minimum similarity threshold (0..1).
   * Only chunks with similarity >= this threshold are included.
   * Converted to max distance internally (1 - minSimilarity for cosine).
   * @default 0 (no threshold)
   */
  minSimilarity?: number;

  /**
   * Default system prompt prepended to RAG context.
   * Can be overridden per-query.
   */
  systemPrompt?: string;
}

/**
 * Info about a chunk-aware table discovered during schema build.
 * Parsed from the @hasChunks smart tag on the parent table's codec.
 */
export interface ChunkTableInfo {
  /** Parent table codec name */
  parentCodecName: string;
  /** Schema of the chunks table (or null for public/default) */
  chunksSchema: string | null;
  /** Exact schema containing the pgvector type and operators. */
  vectorSchema: string;
  /** Name of the chunks table */
  chunksTableName: string;
  /** FK column on chunks table pointing to parent */
  parentFkField: string;
  /** PK column on parent table */
  parentPkField: string;
  /** Embedding vector column on chunks table */
  embeddingField: string;
  /** Text content column on chunks table (the actual chunk text) */
  contentField: string;
}

// ─── Metering Types ─────────────────────────────────────────────────────────

/**
 * Configuration for billing/metering integration.
 * When provided, embedding and chat calls are wrapped with quota checks
 * and usage recording via the billing_module functions.
 */
export interface MeteringConfig {
  /**
   * Meter slug for embedding operations.
   * Must match a slug in the billing_module meters table.
   *
   * @default the embedding model name (e.g. 'text-embedding-3-small')
   * — meter slug = model name, so each model has its own meter
   * in the three-level waterfall (per-model → inference pool → universal).
   */
  embeddingMeterSlug?: string;

  /**
   * Meter slug for chat completion operations.
   *
   * @default the chat model name (e.g. 'gpt-4o-mini')
   */
  chatMeterSlug?: string;

  /**
   * Disable metering entirely (e.g. for local dev).
   * When true, billing functions are never called.
   * @default false
   */
  skipMetering?: boolean;

  /**
   * Resolve the billing entity_id from pgSettings.
   * The entity_id identifies who gets billed (user, org, etc.).
   *
   * @default reads jwt.claims.user_id
   */
  resolveEntityId?: (pgSettings: Record<string, string>) => string | null;
}

// ─── Plugin Options ─────────────────────────────────────────────────────────

/**
 * Options for the GraphileLlmPreset.
 */
export interface GraphileLlmOptions {
  /**
   * Default embedding provider when no llm_module is configured.
   * Useful for development/testing without requiring llm_module setup.
   * @default undefined (requires llm_module to be configured)
   */
  defaultEmbedder?: EmbedderConfig;

  /**
   * Default chat completion provider when no llm_module is configured.
   * Required for RAG queries.
   * @default undefined
   */
  defaultChatCompleter?: ChatConfig;

  /**
   * Whether to add `text` field to VectorNearbyInput for text-based vector search.
   * @default true
   */
  enableTextSearch?: boolean;

  /**
   * Controls behavior when the embedder returns null (e.g. billing quota exceeded).
   *
   * - `'degrade'` (default): Skip the vector search silently and fall back to
   *   text-only adapters (tsvector, BM25, trgm). If no text adapters are
   *   available, throws an error regardless of this setting.
   * - `'throw'`: Always throw an error when the embedder fails, even if
   *   text adapters could handle the query. Use this when semantic search
   *   is critical and keyword-only results are unacceptable.
   *
   * @default 'degrade'
   */
  onQuotaExceeded?: 'degrade' | 'throw';

  /**
   * Whether to add `*Text` companion fields on mutation inputs for vector columns.
   * @default true
   */
  enableTextMutations?: boolean;

  /**
   * Whether to enable RAG (Retrieval-Augmented Generation) query support.
   * When enabled, detects tables with @hasChunks smart tag and adds:
   * - `ragQuery` root query field for context-aware LLM answers
   * - `embedText` root query field for text-to-vector conversion
   * @default false
   */
  enableRag?: boolean;

  /**
   * Default configuration for RAG queries.
   * Individual queries can override these values.
   */
  ragDefaults?: RagDefaults;

  /**
   * Billing/metering configuration (opt-in).
   * When truthy, loads the LlmMeteringPlugin which wraps the embedder
   * with billing quota checks + usage recording.
   *
   * Set to `true` to enable metering with defaults (entity_id from jwt.claims.user_id).
   * Provide a MeteringConfig object for fine-grained control (custom entity_id, meter slugs).
   * Set to `false` or omit to disable metering entirely.
   *
   * @default undefined (metering disabled)
   */
  metering?: boolean | MeteringConfig;

}
