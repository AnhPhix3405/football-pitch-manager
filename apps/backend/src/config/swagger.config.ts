import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const configureSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('Football Pitch Manager API')
    .setDescription(
      'Tài liệu API hệ thống quản lý sân bóng đá (Football Pitch Management Platform)',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập Bearer JWT Access Token để xác thực các tài nguyên được bảo vệ',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
};
