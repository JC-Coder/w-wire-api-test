import { baseApi } from "./baseApi";

interface LoginRequest {
  username: string;
  password: string;
}

interface User {
  id: string;
  username: string;
}

interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
  message: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const { useLoginMutation } = authApi;
