#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { Scanner } from '../core/Scanner.js';
import { ReportGenerator } from '../core/Report.js';
import { Target } from '../types/index.js';
import { HeadersModule } from '../modules/headers/HeadersModule.js';
import { CookiesModule } from '../modules/cookies/CookiesModule.js';
import { XSSModule } from '../modules/xss/XSSModule.js';
import { CORSModule } from '../modules/cors/CORSModule.js';
import { FormsModule } from '../modules/forms/FormsModule.js';
import { logger } from '../utils/logger.js';

const program = new Command();

program
  .name('security-scanner')
  .description('Web vulnerability scanner for security auditing')
  .version('1.0.0')
  .argument('<url>', 'Target URL to scan')
  .option('-m, --modules <modules>', 'Comma-separated list of modules to run', 'all')
  .option('-f, --format <format>', 'Output format (json, html, md)', 'json')
  .option('-o, --output <file>', 'Output file path')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('--insecure', 'Skip SSL verification', false)
  .action(async (url: string, options: any) => {
    if (options.verbose) {
      (logger as any).level = 'debug';
    }

    const target = new Target(url);
    if (!target.isValid()) {
      logger.error('Invalid URL. Must be HTTP or HTTPS.');
      process.exit(1);
    }

    const scanner = new Scanner(target);
    const moduleMap: Record<string, any> = {
      headers: HeadersModule,
      cookies: CookiesModule,
      xss: XSSModule,
      cors: CORSModule,
      forms: FormsModule,
    };

    const selectedModules = options.modules === 'all'
      ? Object.keys(moduleMap)
      : (options.modules as string).split(',');

    for (const moduleName of selectedModules) {
      const ModuleClass = moduleMap[moduleName.trim()];
      if (ModuleClass) {
        scanner.registerModule(new ModuleClass());
      } else {
        logger.warn(`Unknown module: ${moduleName}`);
      }
    }

    console.log(chalk.blue('\nStarting security scan...\n'));
    console.log(`Target: ${chalk.cyan(url)}`);
    console.log(`Modules: ${chalk.cyan(selectedModules.join(', '))}\n`);

    const result = await scanner.scan();

    const generator = new ReportGenerator(result);
    const format = (options.format as 'json' | 'html' | 'md') || 'json';

    if (options.output) {
      generator.save(options.output as string, format);
      console.log(chalk.green(`\nReport saved to: ${options.output}`));
    } else {
      console.log('\n' + '='.repeat(50));
      console.log(chalk.bold('SCAN RESULTS'));
      console.log('='.repeat(50));
      console.log(generator.toMarkdown());
    }

    console.log('\n' + '='.repeat(50));
    console.log(chalk.bold('Summary:'));
    console.log(`  Total: ${result.summary.total}`);
    console.log(`  Critical: ${chalk.red(result.summary.critical)}`);
    console.log(`  High: ${chalk.yellow(result.summary.high)}`);
    console.log(`  Medium: ${chalk.blue(result.summary.medium)}`);
    console.log(`  Low: ${chalk.green(result.summary.low)}`);
    console.log('='.repeat(50) + '\n');

    if (result.vulnerabilities.length > 0) {
      process.exit(1);
    }
  });

program.parse();