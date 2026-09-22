import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export interface GoogleTokenPayload {
  providerId: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

@Injectable()
export class GoogleAuthService {
  private readonly client: OAuth2Client;
  private readonly googleClientId: string;

  constructor(private readonly configService: ConfigService) {
    this.googleClientId =
      this.configService.get<string>('app.googleClientId') ?? '';
    this.client = new OAuth2Client(this.googleClientId);
  }

  async verify(idToken: string): Promise<GoogleTokenPayload | null> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.googleClientId ? this.googleClientId : undefined,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        return null;
      }

      return {
        providerId: payload.sub,
        email: payload.email.trim().toLowerCase(),
        name: payload.name ?? null,
        avatar: payload.picture ?? null,
      };
    } catch {
      return null;
    }
  }
}
