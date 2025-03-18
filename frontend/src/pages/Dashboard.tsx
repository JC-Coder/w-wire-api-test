import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CurrencyConverter from "../components/CurrencyConverter";

interface Transaction {
  id: string;
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  result: number;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const navigate = useNavigate();

  const fetchTransactions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/user/transactions?page=${meta.page}&limit=${meta.limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setTransactions(response.data.data.data);
        setMeta(response.data.data.meta);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError("Failed to fetch transactions");
    } finally {
      setIsLoading(false);
    }
  }, [meta.page, meta.limit, navigate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(amount);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
        background: "linear-gradient(135deg, #13151a 0%, #1e2128 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          padding: "2rem",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "600",
              color: "#61dafb",
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            style={{
              padding: "0.5rem 1rem",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "8px",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Logout
          </button>
        </div>

        <CurrencyConverter onConversionSuccess={fetchTransactions} />

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

        <div
          style={{
            background: "rgba(30, 32, 37, 0.95)",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            overflowX: "auto",
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
            Transaction History
          </h2>

          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              <div
                style={{
                  width: "2rem",
                  height: "2rem",
                  border: "2px solid rgba(97, 218, 251, 0.3)",
                  borderTopColor: "#61dafb",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : transactions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "#8b8d91",
              }}
            >
              No transactions found
            </div>
          ) : (
            <>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "600px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <th
                      style={{
                        textAlign: "left",
                        padding: "1rem",
                        color: "#8b8d91",
                        fontWeight: "500",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "1rem",
                        color: "#8b8d91",
                        fontWeight: "500",
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "1rem",
                        color: "#8b8d91",
                        fontWeight: "500",
                      }}
                    >
                      From
                    </th>
                    <th
                      style={{
                        textAlign: "center",
                        padding: "1rem",
                        color: "#8b8d91",
                        fontWeight: "500",
                      }}
                    >
                      To
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "1rem",
                        color: "#8b8d91",
                        fontWeight: "500",
                      }}
                    >
                      Rate
                    </th>
                    <th
                      style={{
                        textAlign: "right",
                        padding: "1rem",
                        color: "#8b8d91",
                        fontWeight: "500",
                      }}
                    >
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <td
                        style={{
                          padding: "1rem",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                        }}
                      >
                        {transaction.fromCurrency}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                        }}
                      >
                        {transaction.toCurrency}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                        }}
                      >
                        {formatCurrency(transaction.rate)}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "right",
                          color: "#61dafb",
                        }}
                      >
                        {formatCurrency(transaction.result)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginTop: "1.5rem",
                }}
              >
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() =>
                        setMeta((prev) => ({ ...prev, page }))
                      }
                      style={{
                        padding: "0.5rem 1rem",
                        background:
                          meta.page === page
                            ? "rgba(97, 218, 251, 0.1)"
                            : "transparent",
                        border: "1px solid rgba(97, 218, 251, 0.2)",
                        borderRadius: "6px",
                        color: meta.page === page ? "#61dafb" : "#8b8d91",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

