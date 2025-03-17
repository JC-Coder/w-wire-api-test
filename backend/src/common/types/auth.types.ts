export interface ITokenPayload {
  sub: string; // User ID
  username: string; // Username
  nonce: string; // Unique nonce for this token
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

export interface ILoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
  };
}
