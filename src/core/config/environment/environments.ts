import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvironmentConfigService {
  constructor(private configService: ConfigService) {}

  // App
  getPort(): number {
    return Number(this.configService.get<number>('APP_PORT'));
  }

  getApiPrefix(): string {
    return this.configService.get<string>('API_PREFIX');
  }

  getPodName(): string {
    return this.configService.get<string>('HOSTNAME');
  }

  // Secure
  getJwtSecret(): string {
    return this.configService.get<string>('AUTH_JWT_SECRET');
  }

  getApiKey(): string {
    return this.configService.get<string>('API_KEY');
  }

  // Typesense
  getTypesenseHost(): string {
    return this.configService.get<string>('TYPESENSE_HOST');
  }

  getTypesensePort(): number {
    return this.configService.get<number>('TYPESENSE_PORT');
  }

  getTypesenseApiKey(): string {
    return this.configService.get<string>('TYPESENSE_API_KEY');
  }

  // GRPC
  getWsGrpcUrl(): string {
    return this.configService.get<string>('WEBSOCKET_GRPC_ADDRESS');
  }

  getAuthGrpcUrl(): string {
    return this.configService.get<string>('AUTH_GRPC_URL');
  }

  getMeetingGrpcUrl(): string {
    return this.configService.get<string>('MEETING_GRPC_URL');
  }
}
