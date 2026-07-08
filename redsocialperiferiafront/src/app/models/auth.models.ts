export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  username: string;
  alias: string;
}

export interface UserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  alias: string;
  email: string;
}
