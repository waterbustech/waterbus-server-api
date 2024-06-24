import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EnvironmentConfigService } from 'src/core/config/environment/environments';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly environment: EnvironmentConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['api-key'] ?? req.query.api_key;

    if (key != this.environment.getApiKey()) {
      throw new UnauthorizedException('API_KEY is wrong');
    }

    return true;
  }
}
