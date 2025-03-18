import { baseApi } from "./baseApi";

interface ExchangeRatesResponse {
  success: boolean;
  data: {
    timestamp: number;
    base: string;
    rates: Record<string, number>;
  };
  message: string;
}

interface ConversionRequest {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

interface ConversionResponse {
  success: boolean;
  data: {
    amount: number;
    rate: number;
    result: number;
  };
  message: string;
}

interface Transaction {
  id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  result: number;
  createdAt: string;
}

interface TransactionsResponse {
  success: boolean;
  data: {
    data: Transaction[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  message: string;
}

export const currencyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExchangeRates: builder.query<ExchangeRatesResponse, void>({
      query: () => "/exchange-rates",
    }),
    convertCurrency: builder.mutation<ConversionResponse, ConversionRequest>({
      query: (conversion) => ({
        url: "/convert",
        method: "POST",
        body: conversion,
      }),
      invalidatesTags: ["Transactions"],
    }),
    getTransactions: builder.query<
      TransactionsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) =>
        `/user/transactions?page=${page}&limit=${limit}`,
      providesTags: ["Transactions"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetExchangeRatesQuery,
  useConvertCurrencyMutation,
  useGetTransactionsQuery,
} = currencyApi;
