export class AuthenticatedUserDto {
  id!: string;

  email!: string;

  role!: string;

  status!: string;

  authProvider!: string;
}

export class LoginSuccessDataDto {
  accessToken!: string;

  tokenType!: string;

  expiresIn!: number;

  user!: AuthenticatedUserDto;
}

export class LoginResponseDto {
  messageKey!: string;

  data!: LoginSuccessDataDto;
}
