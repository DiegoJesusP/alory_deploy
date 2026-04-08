import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import AxiosClient from './axios';
import { tokenStorage } from '../../modules/auth/infrastructure/storage/LocalStorageTokenStorage';

// ── Backend ApiResponse shape ─────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  result: T | null;
  metadata: {
    total: number;
    totalFiltered: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  } | null;
  type: 'SUCCESS' | 'ERROR' | 'WARNING';
  text: string;
}

// ── Error messages ────────────────────────────────────────────────────────────
const errorMessages = {
  SESSION_EXPIRED: {
    title: 'Sesión expirada',
    description: 'Es necesario iniciar sesión nuevamente',
  },
  ACCESS_DENIED: {
    title: 'Acceso denegado',
    description: 'No tienes permisos para acceder a esta ruta',
  },
  SERVER_ERROR: {
    title: 'Error en el servidor',
    description: 'Ha ocurrido un error en el servidor, inténtalo más tarde',
  },
  CONNECTION_ERROR: {
    title: 'Error de conexión',
    description: 'No se pudo conectar al servidor',
  },
  UNEXPECTED_ERROR: {
    title: 'Error inesperado',
    description: 'Ha ocurrido un error inesperado, inténtalo más tarde',
  },
} as const;

// ── Refresh token queue ───────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ── Request interceptor — attach Bearer token ─────────────────────────────────
AxiosClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — refresh + error handling ──────────────────────────
AxiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const data = error.response?.data as Pick<ApiResponse, 'text' | 'type'> | undefined;

    // ── 401: try to refresh the access token ──────────────────────────────
    // Skip when: no token stored, or failing request is an auth endpoint itself
    const hasToken = !!tokenStorage.get();
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh') ||
      originalRequest?.url?.includes('/auth/password-reset');

    if (status === 401 && originalRequest && !originalRequest._retry && hasToken && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(AxiosClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data: refreshData } = await axios.post<ApiResponse<{ access_token: string }>>(
          `${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshData.result?.access_token ?? '';
        tokenStorage.save(newToken);
        AxiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return AxiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        tokenStorage.clear();
        delete AxiosClient.defaults.headers.common['Authorization'];

        toast.error(errorMessages.SESSION_EXPIRED.title, {
          description: errorMessages.SESSION_EXPIRED.description,
        });

        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403) {
      toast.warning(errorMessages.ACCESS_DENIED.title, {
        description: errorMessages.ACCESS_DENIED.description,
      });
      return Promise.reject(error);
    }

    if (status !== undefined && status >= 500) {
      toast.error(errorMessages.SERVER_ERROR.title, {
        description: errorMessages.SERVER_ERROR.description,
      });
      return Promise.reject(error);
    }

    // Password-reset endpoints return errors inline in the page — skip toast
    const isPasswordResetEndpoint = originalRequest?.url?.includes('/auth/password-reset');

    if (data?.text && !isPasswordResetEndpoint) {
      toast.error('Error', { description: data.text });
      return Promise.reject(error);
    }

    if (data?.text && isPasswordResetEndpoint) {
      return Promise.reject(error);
    }

    if (!error.response) {
      toast.error(errorMessages.CONNECTION_ERROR.title, {
        description: errorMessages.CONNECTION_ERROR.description,
      });
      return Promise.reject(error);
    }

    toast.error(errorMessages.UNEXPECTED_ERROR.title, {
      description: errorMessages.UNEXPECTED_ERROR.description,
    });
    return Promise.reject(error);
  }
);

// ── HTTP client ───────────────────────────────────────────────────────────────
const httpClient = {
  get:    (endpoint: string)                                     => AxiosClient.get(endpoint),
  post:   (endpoint: string, payload?: unknown, config?: object) => AxiosClient.post(endpoint, payload, config),
  put:    (endpoint: string, payload?: unknown)                  => AxiosClient.put(endpoint, payload),
  patch:  (endpoint: string, payload?: unknown)                  => AxiosClient.patch(endpoint, payload),
  delete: (endpoint: string)                                     => AxiosClient.delete(endpoint),
};

type HttpMethod = keyof typeof httpClient;

export const handleRequest = async <T>(
  method: HttpMethod,
  url: string,
  payload?: unknown
): Promise<ApiResponse<T>> => {
  try {
    const fn = httpClient[method] as (
      url: string,
      payload?: unknown
    ) => Promise<AxiosResponse<ApiResponse<T>>>;

    const { data } = await fn(url, payload);

    return {
      result:   data.result   ?? null,
      metadata: data.metadata ?? null,
      type:     data.type     ?? 'SUCCESS',
      text:     data.text     ?? 'Operación exitosa',
    };
  } catch (error: unknown) {
    const axiosError = axios.isAxiosError(error) ? error : null;
    return {
      result:   null,
      metadata: null,
      type:     'ERROR',
      text:     (axiosError?.response?.data as ApiResponse | undefined)?.text
                ?? `Error en solicitud ${method}`,
    };
  }
};

export default httpClient;
