export interface ApiSuccessResponse<T> {
  success: true;
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
