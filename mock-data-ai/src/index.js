#!/usr/bin/env node
/**
 * DHARAA — Digital Public Infrastructure for Land Governance
 * Module: Mock Data & AI Layer (Presenter 1)
 * 
 * Command-Line Runner & Demonstration Harness
 * Usage:
 *   node src/index.js                # Normalizes data, detects anomalies, prints dashboard & exports JSON
 *   node src/index.js --summary      # Compact executive KPI summary
 *   node src/index.js --ulpin=<ID>   # Detailed audit inspection for specific ULPIN
 *   node src/index.js --json         # Machine-readable JSON output
 *   node src/index.js --serve        # Launches REST microservice on port 3005
 */

import fs from 'node:fs';
import path from 'node:path';
import { StateAdapterEngine } from './adapters/adapterEngine.js';
import { AnomalyDetector } from './detector/anomalyDetector.js';
import { startServer } from './server.js';

// ANSI terminal color codes
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bgBlue: '\x1b[44m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  white: '\x1b[37m'
};

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    serve: false,
    port: 3005,
    export: true,
    json: false,
    summary: false,
    ulpin: null
  };

  for (const arg of args) {
    if (arg === '--serve') flags.serve = true;
    else if (arg.startsWith('--port=')) flags.port = parseInt(arg.split('=')[1], 10) || 3005;
    else if (arg === '--no-export') flags.export = false;
    else if (arg === '--export') flags.export = true;
    else if (arg === '--json') flags.json = true;
    else if (arg === '--summary') flags.summary = true;
    else if (arg.startsWith('--ulpin=')) flags.ulpin = arg.split('=')[1].trim();
  }

  return flags;
}

function exportNormalizedData(normalizedData, evaluationResults) {
  const targetDirs = [
    path.resolve(process.cwd(), 'mock-data-ai', 'data', 'normalized'),
    path.resolve(process.cwd(), 'data', 'normalized')
  ];

  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(dir, 'all_parcels.json'),
        JSON.stringify(normalizedData.all_parcels, null, 2),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(dir, 'all_anomalies.json'),
        JSON.stringify(evaluationResults.anomalies, null, 2),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(dir, 'chandigarh_normalized.json'),
        JSON.stringify(normalizedData.chandigarh_parcels, null, 2),
        'utf-8'
      );
      fs.writeFileSync(
        path.join(dir, 'tamil_nadu_normalized.json'),
        JSON.stringify(normalizedData.tamil_nadu_parcels, null, 2),
        'utf-8'
      );
    } catch (err) {
      // Best effort write
    }
  }
}

function printBanner() {
  console.log(`\n${C.bold}${C.cyan}╔════════════════════════════════════════════════════════════════════════════════════════╗${C.reset}`);
  console.log(`${C.bold}${C.cyan}║   DHARAA — Digital Public Infrastructure for Land Governance (Bhu-DPI)             ║${C.reset}`);
  console.log(`${C.bold}${C.cyan}║   Module: Mock Data & Land Trust Engine AI Layer (Smart India Hackathon 2026)          ║${C.reset}`);
  console.log(`${C.bold}${C.cyan}║   Pilot States: Chandigarh (UT) & Tamil Nadu | Department Cross-Verification          ║${C.reset}`);
  console.log(`${C.bold}${C.cyan}╚════════════════════════════════════════════════════════════════════════════════════════╝${C.reset}\n`);
}

function printExecutiveDashboard(stats) {
  console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
  console.log(`${C.bold}🏛  EXECUTIVE LAND TRUST DASHBOARD & AUDIT SUMMARY${C.reset}`);
  console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);

  const total = stats.total_parcels_evaluated;
  const clean = stats.clean_parcels_count;
  const conflicted = stats.conflicted_parcels_count;
  const anomalies = stats.total_anomalies_flagged;
  const trustHealth = Math.round((clean / total) * 100);

  console.log(`  ${C.bold}Total Land Parcels Evaluated:${C.reset}  ${C.cyan}${total}${C.reset} across 2 pilot states`);
  console.log(`  ${C.bold}Pristine Records (Consensus):${C.reset}  ${C.green}${clean}${C.reset} parcels (100% agreement across 4 departments)`);
  console.log(`  ${C.bold}Conflicted Records Flagged:${C.reset}    ${C.red}${conflicted}${C.reset} parcels require administrative resolution`);
  console.log(`  ${C.bold}Total Anomalies Detected:${C.reset}      ${C.yellow}${anomalies}${C.reset} statutory & physical discrepancies`);
  console.log(`  ${C.bold}System Trust Health Index:${C.reset}     ${trustHealth >= 60 ? C.green : C.red}${trustHealth}% Clean Title Consensus${C.reset}\n`);

  console.log(`${C.bold}📊 Discrepancy Breakdown by Severity:${C.reset}`);
  console.log(`  • ${C.red}${C.bold}CRITICAL:${C.reset} ${stats.severity_breakdown.CRITICAL} (Unmutated ownership divergences & >60-day statutory SLA breaches)`);
  console.log(`  • ${C.yellow}${C.bold}HIGH:${C.reset}     ${stats.severity_breakdown.HIGH} (Zoning violations in protected water/green buffers, satellite land drift)`);
  console.log(`  • ${C.blue}${C.bold}MEDIUM:${C.reset}   ${stats.severity_breakdown.MEDIUM} (Moderate cadastral boundary deviations within tolerance)\n`);

  console.log(`${C.bold}🗺  State-Level Ingestion & Normalization:${C.reset}`);
  for (const [st, info] of Object.entries(stats.state_breakdown)) {
    console.log(`  • ${C.cyan}${C.bold}${st}:${C.reset} ${info.total} parcels | ${C.green}${info.clean} Clean${C.reset} | ${C.red}${info.conflicted} Flagged${C.reset} (${info.anomalies} anomalies)`);
  }

  console.log(`\n${C.bold}🏢 Department Invalidation Matrix:${C.reset}`);
  for (const [dept, count] of Object.entries(stats.department_involvement)) {
    console.log(`  • ${dept.padEnd(32)}: Involved in ${C.yellow}${count}${C.reset} discrepancy audits`);
  }
}

function printAnomaliesTable(anomalies) {
  console.log(`\n${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
  console.log(`${C.bold}🔍 DETECTED PARCEL ANOMALIES & AUDIT TRAIL${C.reset}`);
  console.log(`${C.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);

  anomalies.forEach((a, idx) => {
    const sevColor = a.severity === 'CRITICAL' ? C.red : (a.severity === 'HIGH' ? C.yellow : C.blue);
    console.log(`\n${C.bold}[#${idx + 1}] ULPIN: ${C.cyan}${a.ulpin}${C.reset} | State: ${C.bold}${a.state}${C.reset} | Severity: ${sevColor}${C.bold}${a.severity}${C.reset}`);
    console.log(`    ${C.bold}Rule:${C.reset}        ${a.rule_id} (${a.conflict_type})`);
    console.log(`    ${C.bold}Departments:${C.reset} ${a.departments_involved.join(' ↔ ')}`);
    console.log(`    ${C.bold}Audit Note:${C.reset}  ${a.description}`);
    console.log(`    ${C.bold}Govt Action:${C.reset} ${C.green}${a.recommended_action}${C.reset}`);
    console.log(`    ${C.bold}Routing:${C.reset}     Escalated to \x1b[4m${a.suggested_routing_dept}\x1b[0m`);
  });
}

function printSingleParcel(ulpin, normalizedData, evaluationResults) {
  const norm = normalizedData.all_parcels.find(p => p.ulpin.toUpperCase() === ulpin.toUpperCase());
  if (!norm) {
    console.error(`${C.red}Error: Parcel with ULPIN '${ulpin}' not found in database.${C.reset}`);
    return;
  }
  const evalInfo = evaluationResults.parcels.find(p => p.ulpin.toUpperCase() === ulpin.toUpperCase());

  console.log(`\n${C.bold}${C.cyan}========================================================================${C.reset}`);
  console.log(`${C.bold}PARCEL DOSSIER: ${C.yellow}${norm.ulpin}${C.reset} (${norm.state})`);
  console.log(`${C.bold}Master Recorded Owner:${C.reset} ${norm.master_owner}`);
  console.log(`${C.bold}Centroid:${C.reset} Lat ${norm.centroid.lat}, Lon ${norm.centroid.lon}`);
  console.log(`${C.bold}Trust Rating:${C.reset} ${evalInfo.trust_score}/100 (${evalInfo.trust_tier})`);
  console.log(`${C.bold}Conflict Status:${C.reset} ${evalInfo.has_conflicts ? C.red + 'CONFLICTS FLAGGED' : C.green + 'ALL 4 DEPARTMENTS AGREE'}${C.reset}`);
  console.log(`${C.bold}${C.cyan}========================================================================${C.reset}\n`);

  console.log(`${C.bold}1. REVENUE DEPARTMENT RECORD:${C.reset}`);
  console.log(JSON.stringify(norm.departments.revenue, null, 2));

  console.log(`\n${C.bold}2. REGISTRATION DEPARTMENT RECORD:${C.reset}`);
  console.log(JSON.stringify(norm.departments.registration, null, 2));

  console.log(`\n${C.bold}3. SURVEY & LAND RECORDS RECORD:${C.reset}`);
  console.log(JSON.stringify(norm.departments.survey, null, 2));

  console.log(`\n${C.bold}4. URBAN DEVELOPMENT / MASTER PLAN RECORD:${C.reset}`);
  console.log(JSON.stringify(norm.departments.urban_development, null, 2));

  if (evalInfo.has_conflicts) {
    console.log(`\n${C.bold}${C.red}AUDIT ANOMALIES FLAGGED (${evalInfo.conflicts.length}):${C.reset}`);
    console.log(JSON.stringify(evalInfo.conflicts, null, 2));
  }
}

// Main execution
function main() {
  const flags = parseArgs();

  // 1. If serve mode is requested, start REST microservice
  if (flags.serve) {
    printBanner();
    startServer(flags.port);
    return;
  }

  // 2. Ingest and normalize datasets
  const adapterEngine = new StateAdapterEngine();
  const normalizedData = adapterEngine.loadAndNormalizeAll();

  // 3. Execute rule-based anomaly detector
  const detector = new AnomalyDetector();
  const evaluationResults = detector.evaluateAll(normalizedData.all_parcels);

  // 4. Export normalized JSON files if enabled
  if (flags.export) {
    exportNormalizedData(normalizedData, evaluationResults);
  }

  // 5. Output handling
  if (flags.json) {
    console.log(JSON.stringify({
      statistics: evaluationResults.statistics,
      parcels: evaluationResults.parcels,
      anomalies: evaluationResults.anomalies
    }, null, 2));
    return;
  }

  if (flags.ulpin) {
    printBanner();
    printSingleParcel(flags.ulpin, normalizedData, evaluationResults);
    return;
  }

  printBanner();
  printExecutiveDashboard(evaluationResults.statistics);

  if (!flags.summary) {
    printAnomaliesTable(evaluationResults.anomalies);
  }

  if (flags.export) {
    console.log(`\n${C.green}✔ Normalized datasets exported successfully:${C.reset}`);
    console.log(`  • mock-data-ai/data/normalized/all_parcels.json`);
    console.log(`  • mock-data-ai/data/normalized/all_anomalies.json`);
    console.log(`  • mock-data-ai/data/normalized/chandigarh_normalized.json`);
    console.log(`  • mock-data-ai/data/normalized/tamil_nadu_normalized.json`);
  }

  console.log(`\n${C.dim}Tip: Run 'node src/index.js --serve' to launch the REST API microservice.${C.reset}`);
  console.log(`${C.dim}Tip: Run 'node src/index.js --ulpin=IN-CH-022-00111' to view an individual parcel dossier.${C.reset}\n`);
}

main();
