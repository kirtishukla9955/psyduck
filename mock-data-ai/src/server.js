/**
 * DHARAA — Digital Public Infrastructure for Land Governance
 * Land Trust Engine: Mock Data & AI Layer HTTP Microservice
 * 
 * Provides high-performance, zero-dependency REST endpoints for P2 (FastAPI),
 * P3 (Citizen Portal), and P4 (Admin Dashboard) integrations.
 */

import http from 'node:http';
import url from 'node:url';
import { StateAdapterEngine } from './adapters/adapterEngine.js';
import { AnomalyDetector } from './detector/anomalyDetector.js';

export function createServer(options = {}) {
  const adapterEngine = new StateAdapterEngine();
  const detector = new AnomalyDetector(options);

  // Ingest and evaluate mock datasets
  let normalizedData = adapterEngine.loadAndNormalizeAll();
  let evaluationResults = detector.evaluateAll(normalizedData.all_parcels);

  const server = http.createServer((req, res) => {
    // Enable permissive CORS for frontend/backend teammate integration
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    const sendJson = (statusCode, data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data, null, 2));
    };

    // Routing
    // 1. Health check
    if (pathname === '/api/health' || pathname === '/health') {
      return sendJson(200, {
        status: 'UP',
        service: 'DHARAA Mock Data & Land Trust Engine AI Layer',
        timestamp: new Date().toISOString(),
        total_parcels: normalizedData.total_parcels,
        total_anomalies: evaluationResults.statistics.total_anomalies_flagged,
        statutory_sla_days: detector.statutorySlaDays,
        supported_states: ['Chandigarh (UT)', 'Tamil Nadu']
      });
    }

    // 2. Statistics and KPIs
    if (pathname === '/api/statistics' || pathname === '/api/kpis') {
      return sendJson(200, {
        timestamp: evaluationResults.evaluation_timestamp,
        reference_date: evaluationResults.reference_date,
        statistics: evaluationResults.statistics
      });
    }

    // 3. All detected anomalies (with query filters)
    if (pathname === '/api/anomalies') {
      let filtered = [...evaluationResults.anomalies];

      if (query.state) {
        const qState = query.state.toUpperCase();
        filtered = filtered.filter(a =>
          a.state_code === qState || a.state.toUpperCase().includes(qState)
        );
      }
      if (query.severity) {
        filtered = filtered.filter(a => a.severity === query.severity.toUpperCase());
      }
      if (query.type) {
        filtered = filtered.filter(a => a.conflict_type === query.type.toUpperCase());
      }
      if (query.department) {
        filtered = filtered.filter(a =>
          a.departments_involved.some(d => d.toLowerCase().includes(query.department.toLowerCase()))
        );
      }

      return sendJson(200, {
        count: filtered.length,
        anomalies: filtered
      });
    }

    // 4. Single parcel anomalies by ULPIN (/api/anomalies/:ulpin)
    if (pathname.startsWith('/api/anomalies/')) {
      const targetUlpin = decodeURIComponent(pathname.replace('/api/anomalies/', '')).trim();
      const parcelEval = evaluationResults.parcels.find(p => p.ulpin.toUpperCase() === targetUlpin.toUpperCase());
      if (!parcelEval) {
        return sendJson(404, { error: `Parcel with ULPIN '${targetUlpin}' not found.` });
      }
      return sendJson(200, parcelEval);
    }

    // 5. All normalized parcels with trust scores
    if (pathname === '/api/parcels') {
      let result = normalizedData.all_parcels.map(p => {
        const evalInfo = evaluationResults.parcels.find(e => e.ulpin === p.ulpin);
        return {
          ulpin: p.ulpin,
          state: p.state,
          centroid: p.centroid,
          master_owner: p.master_owner,
          trust_score: evalInfo?.trust_score ?? 100,
          trust_tier: evalInfo?.trust_tier ?? 'HIGH_TRUST',
          has_conflicts: evalInfo?.has_conflicts ?? false,
          conflict_count: evalInfo?.conflict_count ?? 0
        };
      });

      if (query.conflicted === 'true') {
        result = result.filter(p => p.has_conflicts);
      } else if (query.clean === 'true') {
        result = result.filter(p => !p.has_conflicts);
      }
      if (query.state) {
        const s = query.state.toUpperCase();
        result = result.filter(p => p.state.toUpperCase().includes(s));
      }

      return sendJson(200, {
        count: result.length,
        parcels: result
      });
    }

    // 6. Single parcel full 4-department view (/api/parcels/:ulpin)
    if (pathname.startsWith('/api/parcels/')) {
      const targetUlpin = decodeURIComponent(pathname.replace('/api/parcels/', '')).trim();
      const rawParcel = normalizedData.all_parcels.find(p => p.ulpin.toUpperCase() === targetUlpin.toUpperCase());
      if (!rawParcel) {
        return sendJson(404, { error: `Parcel with ULPIN '${targetUlpin}' not found.` });
      }
      const evalInfo = evaluationResults.parcels.find(e => e.ulpin.toUpperCase() === targetUlpin.toUpperCase());
      return sendJson(200, {
        ...rawParcel,
        evaluation: evalInfo
      });
    }

    // 7. Trigger re-normalization and re-evaluation
    if (pathname === '/api/recalculate' && req.method === 'POST') {
      normalizedData = adapterEngine.loadAndNormalizeAll();
      evaluationResults = detector.evaluateAll(normalizedData.all_parcels);
      return sendJson(200, {
        message: 'Re-normalized all state datasets and executed conflict detection rules.',
        timestamp: new Date().toISOString(),
        total_parcels: normalizedData.total_parcels,
        total_anomalies: evaluationResults.statistics.total_anomalies_flagged
      });
    }

    // Default 404
    sendJson(404, {
      error: 'Not Found',
      available_endpoints: [
        'GET /api/health',
        'GET /api/statistics',
        'GET /api/anomalies',
        'GET /api/anomalies/:ulpin',
        'GET /api/parcels',
        'GET /api/parcels/:ulpin',
        'POST /api/recalculate'
      ]
    });
  });

  return server;
}

export function startServer(port = 3005) {
  const server = createServer();
  server.listen(port, () => {
    console.log(`\n\x1b[32m✔ DHARAA Mock Data & AI Microservice active on http://localhost:${port}\x1b[0m`);
    console.log(`  - Health endpoint:     http://localhost:${port}/api/health`);
    console.log(`  - Anomalies endpoint:  http://localhost:${port}/api/anomalies`);
    console.log(`  - Parcels endpoint:    http://localhost:${port}/api/parcels`);
    console.log(`  - Statistics:          http://localhost:${port}/api/statistics\n`);
  });
  return server;
}
