import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { loginUser } from "../api/auth";
import type { ApiError } from "../types";
import { AxiosError } from "axios";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await loginUser(
        formData.get("email") as string,
        formData.get("password") as string,
      );
      setUser(data.user);
      navigate("/");
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-1 text-center text-2xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Sign in to your account
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition-colors focus:border-green-500 focus:ring-2 focus:ring-green-100"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-green-600 hover:text-green-700"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
