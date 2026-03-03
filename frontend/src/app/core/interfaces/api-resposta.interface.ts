export interface ApiResposta<T> {
  message?: string;
  validationErrors?: Record<string, string[]>;
  data: T | null;
}
