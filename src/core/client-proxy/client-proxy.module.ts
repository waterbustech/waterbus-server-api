import { DynamicModule, Module } from '@nestjs/common';
import {
  ClientProxyFactory,
  GrpcOptions,
  Transport,
} from '@nestjs/microservices';
import { EPackage, getIncludeDirs, getProtoPath } from 'waterbus-proto';
import { EnvironmentConfigModule } from '../config/env/environment.module';
import { EnvironmentConfigService } from '../config/env/environments';

export const getGrpcClientOptions = (
  config: EnvironmentConfigService,
  _package: EPackage,
): GrpcOptions => {
  let url = '';
  switch (_package) {
    case EPackage.CHAT:
      url = config.getWsGrpcUrl();
      break;
  }
  return {
    transport: Transport.GRPC,
    options: {
      url: url,
      package: _package,
      protoPath: getProtoPath(_package),
      loader: {
        includeDirs: [getIncludeDirs()],
      },
    },
  };
};

@Module({
  imports: [EnvironmentConfigModule],
})
export class ClientProxyModule {
  static chatClientProxy = 'chatClientProxy';
  static register(): DynamicModule {
    return {
      module: ClientProxyModule,
      providers: [
        {
          provide: ClientProxyModule.chatClientProxy,
          inject: [EnvironmentConfigService],
          useFactory: (config: EnvironmentConfigService) =>
            ClientProxyFactory.create(
              getGrpcClientOptions(config, EPackage.CHAT),
            ),
        },
      ],
      exports: [ClientProxyModule.chatClientProxy],
    };
  }
}
