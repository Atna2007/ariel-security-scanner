import { Target, VulnerabilityModule, ScanResult, Vulnerability } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class Scanner {
  private target: Target;
  private modules: VulnerabilityModule[];

  constructor(target: Target) {
    this.target = target;
    this.modules = [];
  }

  getTarget(): Target {
    return this.target;
  }

  getModules(): VulnerabilityModule[] {
    return this.modules;
  }

  registerModule(module: VulnerabilityModule): void {
    this.modules.push(module);
    logger.debug(`Registered module: ${module.name}`);
  }

  async scan(): Promise<ScanResult> {
    const vulnerabilities: Vulnerability[] = [];
    const failedModules: string[] = [];

    logger.info(`Starting scan of ${this.target.getFullUrl()}`);
    logger.info(`Running ${this.modules.length} modules`);

    for (const module of this.modules) {
      try {
        logger.debug(`Running module: ${module.name}`);
        const results = await module.scan(this.target);
        vulnerabilities.push(...results);

        if (results.length > 0) {
          logger.info(`${module.name}: Found ${results.length} vulnerability(s)`);
        }
      } catch (error) {
        logger.error(`Module ${module.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failedModules.push(module.name);
      }
    }

    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter((v) => v.severity === 'CRITICAL').length,
      high: vulnerabilities.filter((v) => v.severity === 'HIGH').length,
      medium: vulnerabilities.filter((v) => v.severity === 'MEDIUM').length,
      low: vulnerabilities.filter((v) => v.severity === 'LOW').length,
    };

    logger.info(`Scan complete: ${summary.total} vulnerabilities found`);

    return {
      target: this.target.getFullUrl(),
      scannedAt: new Date().toISOString(),
      summary,
      vulnerabilities,
      failedModules,
    };
  }
}