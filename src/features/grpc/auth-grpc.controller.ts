import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { JwtService } from '@nestjs/jwt';
import { auth } from 'waterbus-proto';

@Controller()
export class AuthGrpcController implements auth.AuthService {
  constructor(private readonly jwtService: JwtService) {}

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
        secret: process.env.AUTH_JWT_SECRET,
      });

      const isValidToken = true;
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
}
