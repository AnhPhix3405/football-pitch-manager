import type { FastifyReply, FastifyRequest } from 'fastify';
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

export const extractRefreshTokenFromRequest = (
  req: FastifyRequest,
  cookieName: string,
  bodyToken?: string | null,
): string | null => {
  if (bodyToken && typeof bodyToken === 'string' && bodyToken.trim().length > 0) {
    return bodyToken.trim();
  }

  if ((req as any).cookies?.[cookieName]) {
    return (req as any).cookies[cookieName];
  }

  const cookieHeader = req.headers?.cookie;
  if (cookieHeader && typeof cookieHeader === 'string') {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    for (const cookie of cookies) {
      const [name, ...rest] = cookie.split('=');
      if (name === cookieName) {
        return decodeURIComponent(rest.join('='));
      }
    }
  }

  return null;
};

export const clearRefreshTokenCookie = (
  reply: FastifyReply,
  cookieName: string,
  path: string = '/api/auth',
): void => {
  if (typeof (reply as any).clearCookie === 'function') {
    (reply as any).clearCookie(cookieName, { path });
  } else {
    reply.header(
      'Set-Cookie',
      `${cookieName}=; Path=${path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
    );
  }
};
