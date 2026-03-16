import React, { useState } from "react";
import api from "../Services/api"; // adjust path if needed

function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/register", formData);
      setSuccess("Account created successfully! Redirecting...");
      console.log("Registered:", response.data);

      // Optional: redirect after success
      setTimeout(() => window.location.href = "/login", 1500);
    } catch (err) {
      const message =
        err.response?.data?.message || "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-white text-3xl font-bold tracking-tight">
              Create Account
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">
              Join us and start your journey
            </p>
          </div>

          {/* Success / Error messages */}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-900/40 border border-green-700 text-green-400 text-sm text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 
                         rounded-lg text-white placeholder-zinc-500
                         focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400
                         transition duration-150"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 
                         rounded-lg text-white placeholder-zinc-500
                         focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400
                         transition duration-150"
                placeholder="name@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 
                           rounded-lg text-white placeholder-zinc-500
                           focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400
                           transition duration-150"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">Minimum 8 characters</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white text-black font-medium
                       rounded-lg hover:bg-zinc-200 focus:outline-none focus:ring-2 
                       focus:ring-offset-2 focus:ring-offset-black focus:ring-white
                       transition duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-zinc-500 text-sm">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-white hover:text-zinc-300 font-medium transition"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

       
      </div>
    </div>
  );
}

export default SignupPage;