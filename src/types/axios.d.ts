import "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    skipAuthRedirect?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    skipAuthRedirect?: boolean;
    _retry?: boolean;
    _sessionId?: number;
  }
}
