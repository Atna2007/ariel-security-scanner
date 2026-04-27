import { describe, it, expect } from 'vitest';
import { ReportGenerator } from '../../src/core/Report.js';
import { ScanResult } from '../../src/types/index.js';

describe('ReportGenerator', () => {
  const mockResult: ScanResult = {
    target: 'https://example.com',
    scannedAt: '2026-04-27T10:00:00Z',
    summary: {
      total: 2,
      critical: 0,
      high: 1,
      medium: 1,
      low: 0,
    },
    vulnerabilities: [
      {
        type: 'XSS',
        severity: 'HIGH',
        url: 'https://example.com/search',
        parameter: 'q',
        evidence: '<script>alert(1)</script> reflected',
        description: 'Reflected XSS vulnerability',
        recommendation: 'Sanitize user input',
      },
      {
        type: 'MissingHeader',
        severity: 'MEDIUM',
        url: 'https://example.com',
        evidence: 'X-Frame-Options header missing',
        description: 'Security header not present',
        recommendation: 'Add X-Frame-Options header',
      },
    ],
    failedModules: [],
  };

  it('generates valid JSON report', () => {
    const generator = new ReportGenerator(mockResult);
    const json = generator.toJSON();
    const parsed = JSON.parse(json);

    expect(parsed.target).toBe('https://example.com');
    expect(parsed.summary.total).toBe(2);
  });

  it('generates HTML report with vulnerability details', () => {
    const generator = new ReportGenerator(mockResult);
    const html = generator.toHTML();

    expect(html).toContain('https://example.com');
    expect(html).toContain('XSS');
    expect(html).toContain('HIGH');
  });

  it('generates Markdown report', () => {
    const generator = new ReportGenerator(mockResult);
    const md = generator.toMarkdown();

    expect(md).toContain('https://example.com');
    expect(md).toContain('## Summary');
    expect(md).toContain('## Vulnerabilities');
  });
});