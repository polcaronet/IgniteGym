import { storageAuthTokenGet, storageAuthTokenSave } from '@storage/storageAuthToken';
import { AppError } from '@utils/AppError';
import axios, { AxiosInstance, AxiosError } from 'axios';

type SignOut = () => void;

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

const api = axios.create({
  baseURL: 'http://192.168.1.2:3333',
  timeout: 6000,
}) as APIInstanceProps;

let failedQueue: Array<PromiseType> = [];
let isRefreshing = false;

api.registerInterceptTokenManager = (signOut) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { response } = error;

      if (response?.status === 401) {
        const errorMessage = response.data?.message;

        if (errorMessage === 'token.expired' || errorMessage === 'token.invalid') {
          const { refresh_token } = await storageAuthTokenGet();

          if (!refresh_token) {
            signOut();
            return Promise.reject(error);
          }

          const originalRequest = error.config;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                onSuccess: (token: string) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                  resolve(api(originalRequest));
                },
                onFailure: (refreshError: AxiosError) => {
                  reject(refreshError);
                },
              });
            });
          }

          isRefreshing = true;

          try {
            const { data } = await api.post('/sessions/refresh-token', { refresh_token });
             console.log(data);

            await storageAuthTokenSave({
              token: data.token,
              refresh_token: data.refresh_token,
            });

            api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

            failedQueue.forEach((request) => request.onSuccess(data.token));
            failedQueue = [];

            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return api(originalRequest);
          } catch (refreshError) {
            failedQueue.forEach((request) => request.onFailure(error));
            failedQueue = [];

            signOut();
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        signOut();
      }

      if (response?.data) {
        return Promise.reject(new AppError(response.data.message));
      }

      return Promise.reject(error);
    }
  );

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};

export { api };
