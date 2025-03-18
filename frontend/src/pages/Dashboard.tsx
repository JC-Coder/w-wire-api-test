import { useState } from "react";
import { useGetTransactionsQuery } from "../store/api/currencyApi";
import { logout } from "../utils/auth";
import CurrencyConverter from "../components/CurrencyConverter";


const Dashboard = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: transactionsData, isLoading, error: fetchError, refetch } = 
    useGetTransactionsQuery({ page, limit });

  const handleLogout = () => {
    logout();
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

        <CurrencyConverter onConversionSuccess={() => refetch()} />

        {fetchError && (
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
            {fetchError as string}
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
          ) : transactionsData?.data?.data.length === 0 ? (
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
                  {transactionsData?.data?.data.map((transaction) => (
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
                {Array.from(
                  { length: transactionsData?.data?.meta?.totalPages || 0 },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    style={{
                      padding: "0.5rem 1rem",
                      background:
                        page === pageNum
                          ? "rgba(97, 218, 251, 0.1)"
                          : "transparent",
                      border: "1px solid rgba(97, 218, 251, 0.2)",
                      borderRadius: "6px",
                      color: page === pageNum ? "#61dafb" : "#8b8d91",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

