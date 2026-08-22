import { API_ENDPOINTS } from '../config/api.config';
import {
  DashboardStats,
  LoginResponse,
  TwoFactorSetupResponse,
  TwoFactorStatus,
  User,
  UserPayload,
} from '../types/api.types';
import { api } from './api';

export interface LoginPayload {
  username: string;
  password: string;
  otp_token?: string;
}

export const authApi = {
  login: async (data: LoginPayload): Promise<LoginResponse> => (await api.post<LoginResponse>(API_ENDPOINTS.LOGIN, data)).data,
  logout: async (): Promise<void> => { await api.post(API_ENDPOINTS.LOGOUT); },
};

export const securityApi = {
  status: async (): Promise<TwoFactorStatus> => (await api.get<TwoFactorStatus>(API_ENDPOINTS.TWO_FACTOR_STATUS)).data,
  setup: async (): Promise<TwoFactorSetupResponse> => (await api.post<TwoFactorSetupResponse>(API_ENDPOINTS.TWO_FACTOR_SETUP)).data,
  confirm: async (otp_token: string): Promise<TwoFactorStatus> =>
    (await api.post<TwoFactorStatus>(API_ENDPOINTS.TWO_FACTOR_CONFIRM, { otp_token })).data,
  disable: async (): Promise<TwoFactorStatus> => (await api.post<TwoFactorStatus>(API_ENDPOINTS.TWO_FACTOR_DISABLE)).data,
};

export const dashboardApi = {
  stats: async (): Promise<DashboardStats> => (await api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD)).data,
};

export const usersApi = {
  list: async (): Promise<User[]> => (await api.get<User[]>(API_ENDPOINTS.USERS)).data,
  create: async (payload: UserPayload): Promise<User> => (await api.post<User>(API_ENDPOINTS.USERS, payload)).data,
  update: async (id: number, payload: Partial<UserPayload>): Promise<User> =>
    (await api.patch<User>(API_ENDPOINTS.USER_DETAIL(id), payload)).data,
  remove: async (id: number): Promise<void> => { await api.delete(API_ENDPOINTS.USER_DETAIL(id)); },
};
