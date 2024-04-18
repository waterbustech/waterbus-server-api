import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { auth } from 'waterbus-proto';
import { CCUService } from './ccu.service';
import { CCU } from 'src/core/entities/ccu.entity';
import { UserUseCases } from '../user/user.usecase';
import { EnvironmentConfigService } from 'src/core/config/environment/environments';

@Controller()
export class AuthGrpcController implements auth.AuthService {
  constructor(
    private readonly environment: EnvironmentConfigService,
    private readonly jwtService: JwtService,
    private readonly ccuService: CCUService,
    private readonly userUseCases: UserUseCases,
  ) {}

  @GrpcMethod('AuthService', 'ping')
  ping(payload: any) {
    return payload;
  }

  @GrpcMethod('AuthService', 'verifyToken')
  verifyToken(
    data: auth.VerifyTokenRequest,
  ): Observable<auth.VerifyTokenResponse> {
    const token = data.token;

    try {
      const decodedToken: any = this.jwtService.verify(token, {
        secret: this.environment.getJwtSecret(),
      });

      const isValidToken = decodedToken != null;

      const response: auth.VerifyTokenResponse = {
        valid: isValidToken,
        userId: isValidToken ? decodedToken.id : null,
      };

      return new Observable<auth.VerifyTokenResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    } catch (error) {
      const response: auth.VerifyTokenResponse = {
        valid: false,
        userId: null,
      };

      return new Observable<auth.VerifyTokenResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    }
  }

  @GrpcMethod('AuthService', 'createCCU')
  createCCU(data: auth.CreateCCURequest): Observable<auth.StatusResponse> {
    try {
      this.userUseCases.getUserById(data.userId).then((user) => {
        const ccu = new CCU();
        ccu.podName = data.podName;
        ccu.socketId = data.socketId;
        ccu.user = user;

        this.ccuService.create(ccu);
      });

      const response: auth.StatusResponse = {
        succeed: true,
      };

      return new Observable<auth.StatusResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    } catch (error) {
      const response: auth.StatusResponse = {
        succeed: false,
      };

      return new Observable<auth.StatusResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    }
  }

  @GrpcMethod('AuthService', 'removeCCU')
  removeCCU(data: auth.RemoveCCURequest): Observable<auth.StatusResponse> {
    try {
      this.ccuService.findOne({ socketId: data.socketId }).then((ccu) => {
        this.ccuService.remove(ccu);
      });

      const response: auth.StatusResponse = {
        succeed: true,
      };

      return new Observable<auth.StatusResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    } catch (error) {
      const response: auth.StatusResponse = {
        succeed: false,
      };

      return new Observable<auth.StatusResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    }
  }

  @GrpcMethod('AuthService', 'shutDownPod')
  shutDownPod(data: auth.ShutDownPodRequest): Observable<auth.StatusResponse> {
    try {
      this.ccuService.destroyByPodName(data.podName);

      const response: auth.StatusResponse = {
        succeed: true,
      };

      return new Observable<auth.StatusResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    } catch (error) {
      const response: auth.StatusResponse = {
        succeed: false,
      };

      return new Observable<auth.StatusResponse>((observer) => {
        observer.next(response);
        observer.complete();
      });
    }
  }
}
