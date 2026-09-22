jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { Test, TestingModule } from '@nestjs/testing';
import { GoogleLoginRequestDto } from '../dto/google-login-request.dto';
import { LoginRequestDto } from '../dto/login-request.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { AuthController } from './auth.controller';
import { LoginGoogleService } from '../services/login-google.service';
import { LoginService } from '../services/login.service';
import { RegisterAccountService } from '../services/register-account.service';

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
    it('calls loginService.execute and wraps user data in LoginResponseDto', async () => {
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
      mockLoginService.execute.mockResolvedValue(authenticatedUser);

      const result = await controller.login(loginDto);
      expect(mockLoginService.execute).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        messageKey: 'success.loginSuccess',
        data: authenticatedUser,
      });
    });
  });

  describe('loginGoogle', () => {
    it('calls loginGoogleService.execute and wraps user data in GoogleLoginResponseDto', async () => {
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
      mockLoginGoogleService.execute.mockResolvedValue(googleUser);

      const result = await controller.loginGoogle(googleLoginDto);
      expect(mockLoginGoogleService.execute).toHaveBeenCalledWith(
        googleLoginDto,
      );
      expect(result).toEqual({
        messageKey: 'success.loginGoogleSuccess',
        data: googleUser,
      });
    });
  });
});
