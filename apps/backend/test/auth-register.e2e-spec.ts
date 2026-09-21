jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AuthController } from '../src/components/auth/controllers/auth.controller';
import { RegisterAccountService } from '../src/components/auth/services/register-account.service';
import { configureApplication } from '../src/common/configure-application';

describe('Auth registration API (e2e)', () => {
  let app: NestFastifyApplication;
  const registerAccountService = { execute: jest.fn() };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterAccountService,
          useValue: registerAccountService,
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApplication(app);
    await app.init();
    jest.clearAllMocks();
  });

  afterEach(() => app.close());

  it('POST /auth/register returns 201 without exposing a password', async () => {
    registerAccountService.execute.mockResolvedValue({
      message: 'Account registered successfully',
      data: {
        id: '9175df40-fc7c-4d50-b07e-a35417a2eef2',
        email: 'user@example.com',
        role: 'user',
        authProvider: 'local',
        profile: { fullName: 'Nguyen Van A' },
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'user@example.com',
        password: 'Password@123',
        fullName: 'Nguyen Van A',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      success: true,
      data: {
        message: 'Account registered successfully',
        data: {
          id: '9175df40-fc7c-4d50-b07e-a35417a2eef2',
          email: 'user@example.com',
          role: 'user',
          authProvider: 'local',
          profile: { fullName: 'Nguyen Van A' },
        },
      },
    });
    expect(response.body).not.toContain('Password@123');
    expect(response.body).not.toContain('passwordHash');
  });

  it('rejects invalid input and system fields', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        email: 'invalid',
        password: 'short',
        role: 'admin',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    });
    expect(registerAccountService.execute).not.toHaveBeenCalled();
  });
});
