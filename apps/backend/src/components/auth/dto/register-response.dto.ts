export class RegisteredProfileResponseDto {
  fullName!: string | null;
}

export class RegisteredAccountResponseDto {
  id!: string;

  email!: string;

  role!: string;

  authProvider!: string;

  profile!: RegisteredProfileResponseDto;
}

export class RegisterResponseDto {
  messageKey!: string;

  data!: RegisteredAccountResponseDto;
}
