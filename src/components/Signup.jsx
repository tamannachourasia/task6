// src/components/Signup.jsx
import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        uid: user.uid,
     
      });
      setError(""); // Clear error on successful signup
      navigate("/todolist");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
        <div>
    <h1 className="my-4" >TodoList</h1>
  </div>
      <h2  className="mt-10 text-xl " >Sign Up</h2>
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
      <div className=" flex ml-32 mt-8">
      <button   className="m-1  " onClick={handleSignup}>Sign Up</button>
      <a className="m-1" href="/login"><button>login</button></a></div>
    </div>
  );
};

export default Signup;
