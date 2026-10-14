/**
 * Tests for CORS configuration builders.
 */

import { buildPrivateCorsRules,buildUploadCorsRules } from '../src/cors';

describe('buildUploadCorsRules', () => {
  it('builds rules with allowed origins', () => {
    const rules = buildUploadCorsRules(['https://app.example.com']);
    expect(rules).toHaveLength(1);

    const rule = rules[0];
    expect(rule.allowedOrigins).toEqual(['https://app.example.com']);
    expect(rule.allowedMethods).toContain('PUT');
    expect(rule.allowedMethods).toContain('GET');
    expect(rule.allowedMethods).toContain('HEAD');
  });

  it('includes required headers for presigned uploads', () => {
    const rules = buildUploadCorsRules(['https://app.example.com']);
    const rule = rules[0];

    expect(rule.allowedHeaders).toContain('Content-Type');
    expect(rule.allowedHeaders).toContain('Content-Length');
    expect(rule.allowedHeaders).toContain('Authorization');
  });

  it('exposes ETag and Content-Length', () => {
    const rules = buildUploadCorsRules(['https://app.example.com']);
    const rule = rules[0];

    expect(rule.exposedHeaders).toContain('ETag');
    expect(rule.exposedHeaders).toContain('Content-Length');
    expect(rule.exposedHeaders).toContain('Content-Type');
  });

  it('uses default maxAgeSeconds of 3600', () => {
    const rules = buildUploadCorsRules(['https://app.example.com']);
    expect(rules[0].maxAgeSeconds).toBe(3600);
  });

  it('accepts custom maxAgeSeconds', () => {
    const rules = buildUploadCorsRules(['https://app.example.com'], 7200);
    expect(rules[0].maxAgeSeconds).toBe(7200);
  });

  it('supports multiple origins', () => {
    const origins = ['https://app.example.com', 'https://staging.example.com'];
    const rules = buildUploadCorsRules(origins);
    expect(rules[0].allowedOrigins).toEqual(origins);
  });

  it('throws on empty origins', () => {
    expect(() => buildUploadCorsRules([])).toThrow('allowedOrigins must contain at least one origin');
  });
});

describe('buildPrivateCorsRules', () => {
  it('builds rules with PUT, GET and HEAD for explicitly allowed origins', () => {
    const rules = buildPrivateCorsRules(['https://app.example.com']);
    expect(rules).toHaveLength(1);
    expect(rules[0].allowedOrigins).toEqual(['https://app.example.com']);

    const rule = rules[0];
    expect(rule.allowedMethods).toContain('PUT');
    expect(rule.allowedMethods).toContain('HEAD');
    expect(rule.allowedMethods).toContain('GET');
  });

  it('includes required headers for presigned uploads', () => {
    const rules = buildPrivateCorsRules(['https://app.example.com']);
    const rule = rules[0];

    expect(rule.allowedHeaders).toContain('Content-Type');
    expect(rule.allowedHeaders).toContain('Content-Length');
    expect(rule.allowedHeaders).toContain('Authorization');
  });

  it('uses default maxAgeSeconds of 3600', () => {
    const rules = buildPrivateCorsRules(['https://app.example.com']);
    expect(rules[0].maxAgeSeconds).toBe(3600);
  });

  it('throws on empty origins', () => {
    expect(() => buildPrivateCorsRules([])).toThrow('allowedOrigins must contain at least one origin');
  });
});
