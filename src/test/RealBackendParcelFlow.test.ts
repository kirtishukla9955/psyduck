import { describe, it, expect, beforeAll } from 'vitest';
import { HttpParcelService } from '@/api/http/httpService';

const BACKEND_URL = 'http://localhost:8000';

describe('Real backend integration: Parcel flow', () => {
  beforeAll(async () => {
    const health = await fetch(`${BACKEND_URL}/`).catch(() => null);
    if (!health || !health.ok) {
      throw new Error(
        `Backend not reachable at ${BACKEND_URL}. Run: cd backend && python -m uvicorn app.main:app --port 8000`
      );
    }
  });

  it('fetches a real seeded parcel from Postgres via the real backend', async () => {
    const service = new HttpParcelService();
    const parcel = await service.getParcelByUlpin('01926770808179');

    expect(parcel).not.toBeNull();
    expect(parcel?.ulpin).toBe('01926770808179');
    expect(parcel?.areaValue).toBeGreaterThan(0);
  });
});