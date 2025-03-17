export interface IExchangeRateResponse {
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}

export interface IOpenExchangeResponse {
  disclaimer?: string;
  license?: string;
  timestamp: number;
  base: string;
  rates: Record<string, number>;
}
