export interface ITokenPayload {
  sub: string;
  username: string;
  nonce: string;
  iat: number;
  exp: number;
}

export interface ILoginResponse {
  accessToken: string;
  user: {
    id: string;
    username: string;
  };
}
