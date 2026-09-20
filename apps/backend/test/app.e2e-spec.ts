jest.mock('../src/components/auth/auth.module', () => ({
  AuthModule: class AuthModule {},
}));
jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRootAsync: () => class TypeOrmRootModule {},
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './../src/app.module';
import { configureApplication } from './../src/common/configure-application';
import { ApiErrorResponse } from './../src/common/dto/api-response.dto';

describe('Application (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApplication(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', async () => {
    const response = await app.inject({ method: 'GET', url: '/' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
      data: { status: 'ok' },
    });
  });

  it('returns a standardized error response', async () => {
    const response = await app.inject({ method: 'GET', url: '/not-found' });
    const body = response.json<ApiErrorResponse>();

    expect(response.statusCode).toBe(404);
    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Cannot GET /not-found',
      },
      path: '/not-found',
    });
    expect(body.timestamp).toEqual(expect.any(String));
  });
});
