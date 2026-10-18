# graphile-llm

<p align="center" width="100%">
  <img height="250" src="https://raw.githubusercontent.com/constructive-io/constructive/refs/heads/main/assets/outline-logo.svg" />
</p>

<p align="center" width="100%">
  <a href="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml">
    <img height="20" src="https://github.com/constructive-io/constructive/actions/workflows/run-tests.yaml/badge.svg" />
  </a>
   <a href="https://github.com/constructive-io/constructive/blob/main/LICENSE"><img height="20" src="https://img.shields.io/badge/license-MIT-blue.svg"/></a>
   <a href="https://www.npmjs.com/package/graphile-llm"><img height="20" src="https://img.shields.io/github/package-json/v/constructive-io/constructive?filename=graphile%2Fgraphile-llm%2Fpackage.json"/></a>
</p>

LLM integration plugin for PostGraphile v5 — server-side text-to-vector embedding, resolve-time vector injection, and RAG (Retrieval-Augmented Generation) for pgvector columns using `@agentic-kit/ollama`.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Plugins](#plugins)
- [Configuration](#configuration)
- [RAG queries](#rag-queries)
- [License](#license)

## Installation

```bash
npm install graphile-llm
```

## Usage

```typescript
import { GraphileLlmPreset } from 'graphile-llm';

const preset = {
  extends: [
    GraphileLlmPreset({
      defaultEmbedder: {
        provider: 'ollama',
        model: 'nomic-embed-text',
        baseUrl: 'http://localhost:11434',
      },
    }),
  ],
};
```

The preset bundles all plugins listed below. You can also import each plugin individually (`createLlmModulePlugin`, `createLlmTextSearchPlugin`, `createLlmTextMutationPlugin`, `createLlmRagPlugin`) if you prefer a-la-carte.

## Features

- **Text-based vector search** — adds `text: String` field to `VectorNearbyInput`; clients pass natural language instead of raw float vectors
- **Text mutation fields** — adds `{column}Text: String` companion fields on create/update inputs for vector columns
- **RAG queries** — adds `ragQuery` and `embedText` root query fields; detects `@hasChunks` smart tags for chunk-aware retrieval
- **Pluggable providers** — provider-based architecture for both embedding and chat completion (Ollama via `@agentic-kit/ollama`, extensible to OpenAI, etc.)
- **Per-database configuration** — reads `llm_module` from `constructive_routing_public.api_modules` for per-API provider config
- **Toggleable** — each capability (`enableTextSearch`, `enableTextMutations`, `enableRag`) can be independently enabled or disabled
- **Plugin-conditional** — fields only appear in the schema when the plugin is loaded

### Cache ownership

Runtime billing and inference-log configuration is cached per database ID and
cache owner. `getLlmBillingConfig(client, databaseId, owner)` accepts the
Graphile build as the owner; the owner is optional for compatibility with the
original two-argument call and then defaults to the client. Cache statistics
require an owner. `invalidateLlmBillingConfig(databaseId, owner)` clears one
owner, while omitting the owner clears all owners.

## Plugins

| Plugin | Description | Toggle |
|--------|-------------|--------|
| `LlmModulePlugin` | Resolves embedder and chat completer from config; stores on build context | Always included |
| `LlmTextSearchPlugin` | Adds `text: String` to `VectorNearbyInput` with resolve-time embedding | `enableTextSearch` (default: `true`) |
| `LlmTextMutationPlugin` | Adds `{column}Text` companion fields on mutation inputs | `enableTextMutations` (default: `true`) |
| `LlmRagPlugin` | Adds `ragQuery` and `embedText` root query fields | `enableRag` (default: `false`) |

## Configuration

```typescript
GraphileLlmPreset({
  // Embedding provider (required for text fields and RAG)
  defaultEmbedder: {
    provider: 'ollama',
    model: 'nomic-embed-text',
    baseUrl: 'http://localhost:11434',
  },

  // Chat completion provider (required for RAG)
  defaultChatCompleter: {
    provider: 'ollama',
    model: 'llama3',
    baseUrl: 'http://localhost:11434',
  },

  // Toggle individual capabilities
  enableTextSearch: true,      // text field on VectorNearbyInput
  enableTextMutations: true,   // *Text companion fields on mutations
  enableRag: false,            // ragQuery + embedText root fields

  // RAG defaults (overridable per-query)
  ragDefaults: {
    contextLimit: 10,
    maxTokens: 4000,
    minSimilarity: 0.3,
  },
})
```

Providers can also be configured via environment variables (`EMBEDDER_PROVIDER`, `EMBEDDER_MODEL`, `EMBEDDER_BASE_URL`, `CHAT_PROVIDER`, `CHAT_MODEL`, `CHAT_BASE_URL`).

## RAG queries

When `enableRag: true` and tables have `@hasChunks` smart tags, the plugin adds:

```graphql
# Full RAG: embed prompt, search chunks, assemble context, call chat LLM
query {
  ragQuery(
    prompt: "What is machine learning?"
    contextLimit: 5
    minSimilarity: 0.3
  ) {
    answer
    sources { content similarity tableName parentId }
    tokensUsed
  }
}

# Standalone embedding
query {
  embedText(text: "machine learning concepts") {
    vector
    dimensions
  }
}
```
