import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/reset-password/${token}`,
        { newPassword: password }
      );

      setMessage(res.data.message || "Password updated!");

      // optional redirect after 2 sec
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired link");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Updating..." : "Reset Password"}
        </button>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default ResetPassword;

// 🎨 Styles
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f4",
  },
  form: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 0 15px rgba(0,0,0,0.1)",
    width: "320px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  success: {
    color: "green",
    marginTop: "10px",
  },
  error: {
    color: "red",
    marginTop: "10px",
  },
};