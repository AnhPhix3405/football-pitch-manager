jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { FastifyReply, FastifyRequest } from 'fastify';
import { GoogleLoginRequestDto } from '../dto/google-login-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { AuthSessionService } from '../services/auth-session.service';
import { LoginGoogleService } from '../services/login-google.service';
import { LoginService } from '../services/login.service';
import { LogoutService } from '../services/logout.service';
import { RefreshTokenService } from '../services/refresh-token.service';
import { RegisterAccountService } from '../services/register-account.service';
import { TokenService } from '../services/token.service';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  const mockRegisterAccountService = {
    execute: jest.fn(),
  };
  const mockLoginService = {
    execute: jest.fn(),
  };
  const mockLoginGoogleService = {
    execute: jest.fn(),
  };
  const mockRefreshTokenService = {
    execute: jest.fn(),
  };
  const mockLogoutService = {
    execute: jest.fn(),
  };
  const mockAuthSessionService = {
    createSession: jest.fn(),
  };
  const mockTokenService = {
    getRefreshCookieName: jest.fn(() => 'refresh_token'),
    getRefreshTokenCookieOptions: jest.fn(() => ({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 604800,
    })),
    generateTokenPair: jest.fn(() =>
      Promise.resolve({
        accessToken: 'mock.access.token',
        refreshToken: 'mock.refresh.token',
        tokenType: 'Bearer' as const,
        expiresIn: 900,
      }),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterAccountService,
          useValue: mockRegisterAccountService,
        },
        {
          provide: LoginService,
          useValue: mockLoginService,
        },
        {
          provide: LoginGoogleService,
          useValue: mockLoginGoogleService,
        },
        {
          provide: RefreshTokenService,
          useValue: mockRefreshTokenService,
        },
        {
          provide: LogoutService,
          useValue: mockLogoutService,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: AuthSessionService,
          useValue: mockAuthSessionService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('calls registerAccountService.execute with input', async () => {
      const registerDto: RegisterRequestDto = {
        email: 'user@example.com',
        password: 'Password@123',
      };
      const expectedResult: RegisterResponseDto = {
        messageKey: 'success.accountRegistered',
        data: {
          id: 'user-id',
          email: 'user@example.com',
          role: 'user',
          authProvider: 'local',
          profile: { fullName: null },
        },
      };
      mockRegisterAccountService.execute.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);
      expect(mockRegisterAccountService.execute).toHaveBeenCalledWith(
        registerDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('login', () => {
    it('calls loginService.execute, creates session, issues tokens and wraps in LoginResponseDto', async () => {
      const loginDto: LoginRequestDto = {
        email: 'user@example.com',
        password: 'Password@123',
      };
      const authenticatedUser = {
        id: 'user-id',
        email: 'user@example.com',
        role: 'user',
        status: 'active',
        authProvider: 'local',
      };
      const req = {
        headers: { 'user-agent': 'Jest-Agent' },
        ip: '127.0.0.1',
      } as unknown as FastifyRequest;
      const reply = {
        header: jest.fn(),
      } as unknown as FastifyReply;

      mockLoginService.execute.mockResolvedValue(authenticatedUser);
      mockAuthSessionService.createSession.mockResolvedValue({ id: 'session-id' });

      const result = await controller.login(loginDto, req, reply);

      expect(mockLoginService.execute).toHaveBeenCalledWith(loginDto);
      expect(mockTokenService.generateTokenPair).toHaveBeenCalled();
      expect(mockAuthSessionService.createSession).toHaveBeenCalled();
      expect(reply.header).toHaveBeenCalledWith(
        'Set-Cookie',
        expect.stringContaining('refresh_token=mock.refresh.token'),
      );
      expect(result).toEqual({
        messageKey: 'success.loginSuccess',
        data: {
          accessToken: 'mock.access.token',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: authenticatedUser,
        },
      });
    });
  });

  describe('loginGoogle', () => {
    it('calls loginGoogleService.execute, creates session, issues tokens and wraps in GoogleLoginResponseDto', async () => {
      const googleLoginDto: GoogleLoginRequestDto = {
        idToken: 'sample-google-id-token',
      };
      const googleUser = {
        id: 'google-user-id',
        email: 'google@example.com',
        role: 'user',
        status: 'active',
        authProvider: 'google',
        providerId: 'sub-12345',
      };
      const req = {
        headers: { 'user-agent': 'Jest-Agent' },
        ip: '127.0.0.1',
      } as unknown as FastifyRequest;
      const reply = {
        header: jest.fn(),
      } as unknown as FastifyReply;

      mockLoginGoogleService.execute.mockResolvedValue(googleUser);
      mockAuthSessionService.createSession.mockResolvedValue({ id: 'session-id' });

      const result = await controller.loginGoogle(googleLoginDto, req, reply);

      expect(mockLoginGoogleService.execute).toHaveBeenCalledWith(
        googleLoginDto,
      );
      expect(mockTokenService.generateTokenPair).toHaveBeenCalled();
      expect(mockAuthSessionService.createSession).toHaveBeenCalled();
      expect(reply.header).toHaveBeenCalledWith(
        'Set-Cookie',
        expect.stringContaining('refresh_token=mock.refresh.token'),
      );
      expect(result).toEqual({
        messageKey: 'success.loginGoogleSuccess',
        data: {
          accessToken: 'mock.access.token',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: googleUser,
        },
      });
    });
  });

  describe('refresh', () => {
    it('extracts token from cookie/body, refreshes session and sets cookie', async () => {
      const req = {
        headers: { cookie: 'refresh_token=sample.refresh.token' },
      } as unknown as FastifyRequest;
      const reply = {
        header: jest.fn(),
      } as unknown as FastifyReply;

      const refreshDto: RefreshTokenRequestDto = {};
      const refreshResult = {
        tokens: {
          accessToken: 'new.access.token',
          refreshToken: 'new.refresh.token',
          tokenType: 'Bearer' as const,
          expiresIn: 900,
        },
        user: {
          id: 'user-id',
          email: 'user@example.com',
          role: 'user',
          status: 'active',
          authProvider: 'local',
        },
      };
      mockRefreshTokenService.execute.mockResolvedValue(refreshResult);

      const result = await controller.refresh(refreshDto, req, reply);

      expect(mockRefreshTokenService.execute).toHaveBeenCalledWith(
        'sample.refresh.token',
      );
      expect(reply.header).toHaveBeenCalledWith(
        'Set-Cookie',
        expect.stringContaining('refresh_token=new.refresh.token'),
      );
      expect(result).toEqual({
        messageKey: 'success.refreshSuccess',
        data: {
          accessToken: 'new.access.token',
          tokenType: 'Bearer',
          expiresIn: 900,
          user: refreshResult.user,
        },
      });
    });
  });

  describe('logout', () => {
    it('extracts token, revokes session and clears cookie', async () => {
      const req = {
        headers: { cookie: 'refresh_token=sample.refresh.token' },
      } as unknown as FastifyRequest;
      const reply = {
        header: jest.fn(),
      } as unknown as FastifyReply;

      const logoutDto: RefreshTokenRequestDto = {};
      mockLogoutService.execute.mockResolvedValue({ success: true });

      const result = await controller.logout(logoutDto, req, reply);

      expect(mockLogoutService.execute).toHaveBeenCalledWith(
        'sample.refresh.token',
      );
      expect(reply.header).toHaveBeenCalledWith(
        'Set-Cookie',
        expect.stringContaining('Max-Age=0'),
      );
      expect(result).toEqual({
        messageKey: 'success.logoutSuccess',
        data: null,
      });
    });
  });
});
