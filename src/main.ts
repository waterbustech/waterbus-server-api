import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from './core/config/config.type';
import validationOptions from './utils/validation-options';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestExpressApplication } from '@nestjs/platform-express';
import { EPackage, getProtoPath, getIncludeDirs } from 'waterbus-proto';

const { SwaggerTheme, SwaggerThemeNameEnum } = require('swagger-themes');
const swaggerUi = require('swagger-ui-express');

const theme = new SwaggerTheme();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.enableShutdownHooks();
  app.setGlobalPrefix(
    configService.getOrThrow('app.apiPrefix', { infer: true }),
    {
      exclude: ['/'],
    },
  );
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const options = new DocumentBuilder()
    .setTitle('Waterbus Server API - @waterbus.tech')
    .setDescription(
      'Open source video conferencing app built on latest WebRTC SDK. Android/iOS/MacOS/Web',
    )
    .setVersion('2.0')
    .addApiKey({
      type: 'apiKey',
    })
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);

  const optionsTheme = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK),
  };

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(document, optionsTheme));

  const authGrpcUrl = configService.getOrThrow('grpc.authUrl', { infer: true });
  const meetingGrpcUrl = configService.getOrThrow('grpc.meetingUrl', {
    infer: true,
  });

  const authMicroserviceOptions: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: EPackage.AUTH,
      protoPath: getProtoPath(EPackage.AUTH),
      url: authGrpcUrl,
      loader: {
        includeDirs: [getIncludeDirs()],
      },
    },
  };
  const meetingMicroserviceOptions: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: EPackage.MEETING,
      protoPath: getProtoPath(EPackage.MEETING),
      url: meetingGrpcUrl,
      loader: {
        includeDirs: [getIncludeDirs()],
      },
    },
  };

  app.connectMicroservice(authMicroserviceOptions);
  app.connectMicroservice(meetingMicroserviceOptions);
  await app.startAllMicroservices();

  await app.listen(configService.getOrThrow('app.port', { infer: true }));
}
void bootstrap();
