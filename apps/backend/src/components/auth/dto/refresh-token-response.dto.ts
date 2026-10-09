import { AuthenticatedUserDto } from './login-response.dto';

export class RefreshTokenDataDto {
  accessToken!: string;
  refreshToken?: string;
  tokenType!: 'Bearer';
  expiresIn!: number;
  user!: AuthenticatedUserDto;
}

export class RefreshTokenResponseDto {
  messageKey!: string;
  data!: RefreshTokenDataDto;
}
