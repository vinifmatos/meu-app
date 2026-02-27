export interface ApiResponse<T = any> {
  message?: string;
  errors?: any;
  data?: T;
}
