import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser middleware - 쿠키 파싱을 위해 필요
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('One Day Pub API')
    .setDescription(
      `One Day Pub 백엔드 API 문서

## 인증 방식
- SMS 인증을 통한 JWT 토큰 기반 인증
- Bearer Token을 Authorization 헤더에 포함하여 요청

## API 그룹
- **인증 (Authentication)**: 회원가입, 로그인, 토큰 갱신
- **사용자 관리 (Users)**: 사용자 정보 조회/수정, 관리
- **부스 (Booths)**: 축제 부스 정보 조회
- **무대 (Stages)**: 축제 무대 정보 조회

## 역할 체계
- **USER**: 일반 사용자
- **BOOTH**: 부스 관리자
- **SAFETY**: 안전 요원
- **ADMIN**: 시스템 관리자
    `
    )
    .setVersion('1.0')
    .setContact('SPARCS', 'https://sparcs.org', 'contact@sparcs.org')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'JWT 토큰을 입력해주세요',
        in: 'header',
      },
      'access-token'
    )
    .addServer(
      process.env.NODE_ENV === 'production'
        ? `http://localhost:${process.env.API_PORT || 8000}`
        : `http://localhost:${process.env.API_PORT || 8000}`,
      process.env.NODE_ENV === 'production' ? '프로덕션 서버' : '개발 서버'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'One Day Pub API 문서',
  });

  const port = process.env.API_PORT || 8000;
  await app.listen(port);

  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api`);
}

bootstrap();
