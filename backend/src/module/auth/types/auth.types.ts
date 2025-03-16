export interface TokenPayload {
  sub: string;
  username: string;
  nonce: string;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
  };
}
