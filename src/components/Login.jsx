// src/components/Login.jsx
import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(""); // Clear error on successful login
      navigate("/todolist");
    } catch (error) {
      setError(error.message);
    }
  };

  return (

    <div>
      <h2  className="mt-10 text-xl ">Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
         className="my-4 text-zinc-900  mx-6 py-1 rounded-md px-2 "
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
         className="my-4 text-zinc-900  mx-6 py-1 rounded-md px-2 "
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button  className="mx-6"  onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
