import { createApi, fetchBaseQuery, FetchArgs, BaseQueryApi } from "@reduxjs/toolkit/query/react";
import { logout } from "../../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

const baseQueryWithReauth = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: { shout?: boolean } = {}
) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    logout();
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: ["Transactions"],
});
