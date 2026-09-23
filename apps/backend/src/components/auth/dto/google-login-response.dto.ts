export class GoogleAuthenticatedUserDto {
  id!: string;

  email!: string;

  role!: string;

  status!: string;

  authProvider!: string;

  providerId!: string | null;
}

export class GoogleLoginResponseDto {
  messageKey!: string;

  data!: GoogleAuthenticatedUserDto;
}
