// Mirrors saudi_app_react/src/api/types.ts field-for-field so the mobile
// client speaks the exact same wire contract as the web dashboard.

export type Gender = 'male' | 'female' | '';

export interface LoginResponse {
  token: string;
  username: string;
  gender: Gender;
}

export interface OtpRequiredResponse {
  otp_required: true;
}

export interface TwoFactorStatus {
  enabled: boolean;
}

// Raw wire response from POST /auth/2fa/setup/
export interface TwoFactorSetupResponse {
  qr_code: string; // data:image/png;base64,...
  secret: string;
}

export interface User {
  id: number;
  username: string;
  gender: Gender;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface UserPayload {
  username: string;
  password?: string;
  gender?: Gender;
  is_staff?: boolean;
  is_active?: boolean;
}

export interface GenderCount {
  gender: Gender;
  label: string;
  count: number;
}

export interface DashboardStats {
  total_users: number;
  gender_counts: GenderCount[];
}
