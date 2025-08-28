'use client';

import { useState, useEffect } from "react";
import { useCheckUserExists } from "../lib/userValidationHook";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter()

  const { userExists, checking } = useCheckUserExists(email);

 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password || (!userExists && password !== confirmPassword)) {
      setMessage("Please fill all required fields correctly.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = userExists ? "/api/authentication" : "/api/create-user";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(userExists ? "Login successful!" : "User created & logged in!");
router.push("/admin-dashboard")
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md p-8 rounded-2xl shadow-lg" style={{ background: "var(--surface)" }}>
        <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: "var(--primary)" }}>
          MovieTracker
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold" style={{ color: "var(--text-primary)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              required
              style={{ background: "var(--overlay)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold" style={{ color: "var(--text-primary)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              required
              style={{ background: "var(--overlay)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Confirm Password only if new user */}
          {!checking && !userExists && (
            <div className="flex flex-col">
              <label className="mb-1 font-semibold" style={{ color: "var(--text-primary)" }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                required
                style={{ background: "var(--overlay)", color: "var(--text-primary)" }}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || checking}
            className="p-3 mt-4 rounded-lg font-semibold text-white"
            style={{ background: "var(--primary)" }}
          >
            {loading
              ? "Please wait..."
              : userExists
              ? "Login"
              : "Register & Login"}
          </button>
        </form>

        {/* Status Messages */}
        {message && (
          <p className="mt-4 text-center font-medium" style={{ color: "var(--primary)" }}>
            {message}
          </p>
        )}

        {checking && (
          <p className="mt-2 text-center text-gray-500">Checking email...</p>
        )}
      </div>
    </div>
  );
}
