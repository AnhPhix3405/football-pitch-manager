export class AuthenticatedUserDto {
  id!: string;

  email!: string;

  role!: string;

  status!: string;

  authProvider!: string;
}

export class LoginResponseDto {
  messageKey!: string;

  data!: AuthenticatedUserDto;
}
