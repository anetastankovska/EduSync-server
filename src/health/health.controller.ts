import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  liveness() {
    return this.health.liveness();
  }

  @Get('ready')
  async readiness() {
    const res = await this.health.readiness();
    // Return 200 if healthy; 503 if DB check failed
    const status =
      res.status === 'ok' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return {
      ...res,
      _httpStatus: status, // helpful in logs; not required
    };
  }
}
