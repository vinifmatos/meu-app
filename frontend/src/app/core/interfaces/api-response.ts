export interface ApiData<T = unknown> {
  data: T;
}

export interface ApiError {
  message: string;
}

export interface ApiValidationError extends ApiError {
  errors: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiData<T> | ApiError | ApiValidationError;
