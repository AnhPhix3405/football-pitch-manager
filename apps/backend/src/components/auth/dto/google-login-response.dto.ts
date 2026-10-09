export class GoogleAuthenticatedUserDto {
  id!: string;

  email!: string;

  role!: string;

  status!: string;

  authProvider!: string;

  providerId!: string | null;
}

export class GoogleLoginSuccessDataDto {
  accessToken!: string;

  tokenType!: string;

  expiresIn!: number;

  user!: GoogleAuthenticatedUserDto;
}

export class GoogleLoginResponseDto {
  messageKey!: string;

  data!: GoogleLoginSuccessDataDto;
}
