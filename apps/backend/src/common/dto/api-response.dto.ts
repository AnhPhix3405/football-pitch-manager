export interface ApiSuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface TranslatableResponse<T> {
  messageKey: string;
  messageArgs?: Record<string, unknown>;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
  path: string;
  timestamp: string;
}
