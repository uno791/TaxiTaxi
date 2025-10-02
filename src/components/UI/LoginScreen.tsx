import { useState } from "react";
import { useMeta } from "../../context/MetaContext";
import {
  findUser,
  createUser,
  findUserByUsername,
  saveCurrentUser,
} from "../../utils/storage";

export default function LoginScreen() {
  const { setCurrentUser, setAppStage } = useMeta();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleLogin = () => {
    const user = findUser(username, password);
    if (user) {
      setCurrentUser(user);
      saveCurrentUser(user); // 🔹 persist login
      setAppStage("entrance");
    } else {
      setError("Invalid username or password");
    }
  };

  const handleRegister = () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    const existingUser = findUserByUsername(username);
    if (existingUser) {
      setError("Username already taken, please choose another");
      return;
    }

    const user = createUser(username, password);
    setCurrentUser(user);
    saveCurrentUser(user); // 🔹 persist new user login
    setAppStage("entrance");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1e1e1e, #333)",
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#2c2c2c",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          minWidth: "300px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>
          {isRegister ? "Create Account" : "TaxiTaxi Login"}
        </h1>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "12px",
            borderRadius: "6px",
            border: "1px solid #555",
            backgroundColor: "#1a1a1a",
            color: "white",
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          style={{
            padding: "10px",
            width: "100%",
            marginBottom: "16px",
            borderRadius: "6px",
            border: "1px solid #555",
            backgroundColor: "#1a1a1a",
            color: "white",
          }}
        />
        <button
          onClick={isRegister ? handleRegister : handleLogin}
          style={{
            padding: "10px 20px",
            width: "100%",
            marginBottom: "10px",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "#ffcc00",
            color: "#000",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {isRegister ? "Register" : "Login"}
        </button>
        <p
          style={{ fontSize: "14px", marginTop: "8px", cursor: "pointer" }}
          onClick={() => {
            setError("");
            setIsRegister(!isRegister);
          }}
        >
          {isRegister
            ? "Already have an account? Login"
            : "Don’t have an account? Create one"}
        </p>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </div>
    </div>
  );
}
