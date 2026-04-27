import { describe, it, expect, vi } from 'vitest';
import { Scanner } from '../../src/core/Scanner.js';
import { Target, VulnerabilityModule, Vulnerability } from '../../src/types/index.js';

describe('Scanner', () => {
  it('initializes with a target', () => {
    const target = new Target('https://example.com');
    const scanner = new Scanner(target);
    expect(scanner.getTarget()).toBe(target);
  });

  it('registers vulnerability modules', () => {
    const target = new Target('https://example.com');
    const scanner = new Scanner(target);

    const mockModule: VulnerabilityModule = {
      name: 'TestModule',
      severity: 'HIGH',
      scan: vi.fn().mockResolvedValue([]),
    };

    scanner.registerModule(mockModule);
    expect(scanner.getModules().length).toBe(1);
  });

  it('runs all registered modules and aggregates results', async () => {
    const target = new Target('https://example.com/test?q=hello');
    const scanner = new Scanner(target);

    const mockVuln: Vulnerability = {
      type: 'XSS',
      severity: 'HIGH',
      url: 'https://example.com/test',
      parameter: 'q',
      evidence: 'Payload reflected',
      description: 'XSS found',
      recommendation: 'Sanitize input',
    };

    const mockModule: VulnerabilityModule = {
      name: 'XSSModule',
      severity: 'HIGH',
      scan: vi.fn().mockResolvedValue([mockVuln]),
    };

    scanner.registerModule(mockModule);
    const results = await scanner.scan();

    expect(results.vulnerabilities.length).toBe(1);
    expect(results.vulnerabilities[0].type).toBe('XSS');
  });

  it('tracks failed modules without crashing', async () => {
    const target = new Target('https://example.com');
    const scanner = new Scanner(target);

    const failingModule: VulnerabilityModule = {
      name: 'FailingModule',
      severity: 'MEDIUM',
      scan: vi.fn().mockRejectedValue(new Error('Network error')),
    };

    scanner.registerModule(failingModule);
    const results = await scanner.scan();

    expect(results.failedModules).toContain('FailingModule');
  });
});