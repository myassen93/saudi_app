export type Gender = 'male' | 'female' | ''

export interface LoginResponse {
  token: string
  username: string
  gender: Gender
}

export interface OtpRequiredResponse {
  otp_required: true
}

export interface TwoFactorStatus {
  enabled: boolean
}

export interface TwoFactorSetupResponse {
  qrDataUri: string
  secret: string
}

export interface User {
  id: number
  username: string
  gender: Gender
  is_staff: boolean
  is_active: boolean
  date_joined: string
}

export interface UserPayload {
  username: string
  password?: string
  gender?: Gender
  is_staff?: boolean
  is_active?: boolean
}

export interface GenderCount {
  gender: Gender
  label: string
  count: number
}

export interface DashboardStats {
  total_users: number
  gender_counts: GenderCount[]
}
