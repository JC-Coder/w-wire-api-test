import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

interface CurrencyConverterProps {
  onConversionSuccess: () => void;
}

interface ErrorResponse {
  message: string;
  success: boolean;
}

const CurrencyConverter = ({ onConversionSuccess }: CurrencyConverterProps) => {
  const [amount, setAmount] = useState<string>("");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currencies, setCurrencies] = useState<string[]>([]);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/exchange-rates");
      if (response.data.success) {
        const data: ExchangeRates = response.data.data;
        setCurrencies(Object.keys(data.rates));
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(
        error.response?.data?.message || "Failed to fetch exchange rates"
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3000/api/convert",
        {
          amount: parseFloat(amount),
          fromCurrency,
          toCurrency,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setAmount("");
        onConversionSuccess();
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      setError(
        error.response?.data?.message || "Conversion failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(30, 32, 37, 0.95)",
        padding: "2rem",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        marginBottom: "2rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#61dafb",
          marginBottom: "1.5rem",
        }}
      >
        Currency Converter
      </h2>

      {error && (
        <div
          style={{
            background: "rgba(255, 87, 87, 0.1)",
            color: "#ff5757",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid rgba(255, 87, 87, 0.2)",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#8b8d91",
                fontSize: "0.9rem",
              }}
            >
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="any"
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "1rem",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#8b8d91",
                fontSize: "0.9rem",
              }}
            >
              From
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "1rem",
              }}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#8b8d91",
                fontSize: "0.9rem",
              }}
            >
              To
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "1rem",
              }}
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "1rem",
            background: "linear-gradient(135deg, #61dafb 0%, #4fa8e0 100%)",
            color: "#13151a",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: isLoading ? "not-allowed" : "pointer",
            opacity: isLoading ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? "Converting..." : "Convert"}
        </button>
      </form>
    </div>
  );
};

export default CurrencyConverter;