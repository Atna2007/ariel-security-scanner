export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Vulnerability {
  type: string;
  severity: Severity;
  url: string;
  parameter?: string;
  evidence: string;
  description: string;
  recommendation: string;
  cweId?: string;
}

export interface ScanResult {
  target: string;
  scannedAt: string;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  vulnerabilities: Vulnerability[];
  failedModules: string[];
}

export interface VulnerabilityModule {
  name: string;
  severity: Severity;
  scan(target: Target): Promise<Vulnerability[]>;
}

export class Target {
  url: URL;
  baseUrl: string;
  params: URLSearchParams;

  constructor(urlString: string) {
    this.url = new URL(urlString);
    this.baseUrl = `${this.url.protocol}//${this.url.host}`;
    this.params = this.url.searchParams;
  }

  isValid(): boolean {
    return this.url.protocol === 'http:' || this.url.protocol === 'https:';
  }

  getFullUrl(): string {
    return this.url.toString();
  }
}