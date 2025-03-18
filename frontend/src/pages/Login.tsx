import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../store/api/authApi";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login({ username, password }).unwrap();
      localStorage.setItem("token", response.data.accessToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error('Login error:', err);
      setError(
        "Login failed. Please try again."
      );
    }
  };

  return (
    <div
      className="login-container"
      style={{
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #13151a 0%, #1e2128 100%)",
        color: "#ffffff",
        position: "fixed",
        top: 0,
        left: 0,
        overflow: "auto",
      }}
    >
      <div
        className="login-card"
        style={{
          background: "rgba(30, 32, 37, 0.95)",
          padding: "3rem",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          width: "100%",
          maxWidth: "480px",
          margin: "auto",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "2.5rem",
            color: "#61dafb",
            fontSize: "2.5rem",
            fontWeight: "600",
            letterSpacing: "-0.5px",
          }}
        >
          W-Wire
          <span
            style={{
              display: "block",
              fontSize: "1rem",
              color: "#8b8d91",
              fontWeight: "400",
              marginTop: "0.5rem",
            }}
          >
            Sign in to your account
          </span>
        </h1>

        {error && (
          <div
            style={{
              background: "rgba(255, 87, 87, 0.1)",
              color: "#ff5757",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              border: "1px solid rgba(255, 87, 87, 0.2)",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
                color: "#8b8d91",
                fontWeight: "500",
              }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "1rem",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#61dafb";
                e.target.style.boxShadow = "0 0 0 2px rgba(97, 218, 251, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.target.style.boxShadow = "none";
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
                color: "#8b8d91",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "white",
                fontSize: "1rem",
                transition: "all 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#61dafb";
                e.target.style.boxShadow = "0 0 0 2px rgba(97, 218, 251, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.target.style.boxShadow = "none";
              }}
              required
            />
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
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(97, 218, 251, 0.2)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {isLoading ? (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(19, 21, 26, 0.3)",
                    borderTopColor: "#13151a",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
