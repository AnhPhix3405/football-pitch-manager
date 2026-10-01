import { FastifyReply } from 'fastify';
import { RefreshCookieOptions } from '../interfaces/jwt-payload.interface';

export const setRefreshTokenCookie = (
  reply: FastifyReply,
  cookieName: string,
  refreshToken: string,
  options: RefreshCookieOptions,
): void => {
  if (typeof (reply as any).setCookie === 'function') {
    (reply as any).setCookie(cookieName, refreshToken, {
      httpOnly: options.httpOnly,
      secure: options.secure,
      sameSite: options.sameSite,
      path: options.path,
      maxAge: options.maxAge,
    });
  } else {
    const cookieParts = [
      `${cookieName}=${refreshToken}`,
      `Path=${options.path}`,
      `Max-Age=${options.maxAge}`,
      options.httpOnly ? 'HttpOnly' : '',
      options.secure ? 'Secure' : '',
      `SameSite=${options.sameSite}`,
    ].filter(Boolean);

    reply.header('Set-Cookie', cookieParts.join('; '));
  }
};
