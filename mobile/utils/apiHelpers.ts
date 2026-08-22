// Adapted from trophyApp/utils/apiHelpers.ts (same author's established
// error-parsing convention), trimmed to the pieces this app needs.

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/** Parse a DRF error response into a single friendly message + status. */
export const parseApiError = (error: any): ApiError => {
  if (error.response) {
    const { data, status } = error.response;

    if (data && typeof data === 'object') {
      // Prefer a single "detail" string (e.g. 2FA confirm/disable errors).
      if (typeof data.detail === 'string') return { message: data.detail, status };

      // non_field_errors takes priority over other field errors.
      if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
        return { message: data.non_field_errors[0], errors: data, status };
      }

      // Any other field-level array error, e.g. { username: ["This field is required."] }
      const rootFieldMsg = (Object.values(data) as any[]).flat().find((v) => typeof v === 'string');
      if (rootFieldMsg) return { message: rootFieldMsg, errors: data, status };
    }

    return { message: `HTTP ${status} Error`, status };
  }

  if (error.request) {
    const isTimeout =
      error.code === 'ECONNABORTED' || (typeof error.message === 'string' && error.message.includes('timeout'));
    return {
      message: isTimeout ? 'Network error. Request timed out.' : 'Network error. Please check your connection.',
    };
  }

  return { message: error.message || 'An unknown error occurred' };
};

/** Flattened, user-facing error message — same "field: message" join style as saudi_app_react. */
export const getErrorMessage = (error: any): string => {
  const apiError = parseApiError(error);
  if (apiError.errors) {
    const parts = Object.entries(apiError.errors).map(([key, val]) => {
      const msg = Array.isArray(val) ? val.join(' ') : String(val);
      return key === 'non_field_errors' ? msg : `${key}: ${msg}`;
    });
    return parts.join(' ') || apiError.message;
  }
  return apiError.message;
};
