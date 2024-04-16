import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  getPort(): number {
    return Number(this.configService.get<number>('APP_PORT'));
  }

  getJwtSecret(): string {
    return this.configService.get<string>('AUTH_JWT_SECRET');
  }

  getApiKey(): string {
    return this.configService.get<string>('API_KEY');
  }

  getApiPrefix(): string {
    return this.configService.get<string>('API_PREFIX');
  }

  getWsGrpcUrl(): string {
    return this.configService.get<string>('WEBSOCKET_GRPC_ADDRESS');
  }

  getAuthGrpcUrl(): string {
    return this.configService.get<string>('AUTH_GRPC_URL');
  }

  getMeetingGrpcUrl(): string {
    return this.configService.get<string>('MEETING_GRPC_URL');
  }

  getPodName(): string {
    return this.configService.get<string>('HOSTNAME');
  }
}
