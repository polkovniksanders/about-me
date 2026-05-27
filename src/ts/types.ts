// Shared types — imported by both frontend modules and api/send-email.ts
// This creates a compile-time contract between client and server

export type FormState = 'idle' | 'loading' | 'success' | 'error';

export type FieldName = 'name' | 'phone' | 'email' | 'comment';

export type ValidationResult = string | null; // null = valid, string = error message

export interface ContactFormData {
  name: string;
  phone: string;
  email: string;
  comment: string;
  honeypot: string;       // always empty for real users
  _formLoadTime: string;  // timestamp for timing-based bot check
}

export interface ApiSuccessResponse {
  success: true;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  field?: FieldName;
}

export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;
