import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  liveness() {
    return {
      status: 'ok',
      uptime_ms: Math.round(process.uptime() * 1000),
    };
  }

  async readiness() {
    // Minimal DB connectivity probe
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        db: 'up',
      };
    } catch (e) {
      return {
        status: 'fail',
        db: 'down',
        error: e?.message ?? 'DB check failed',
      };
    }
  }
}
