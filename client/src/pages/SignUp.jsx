import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signUp } from "../lib/auth-client.js";

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setIsPending(true);

    try {
      const { error } = await signUp.email({
        email,
        password,
        name: email.split("@")[0] || "User", // Auto-fills Better Auth's required name field
      });

      if (error) {
        setErrorMessage(error.message || "Registration failed.");
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Please check your connection.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Sign up
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative h-fit">
            <input
              className="w-full rounded-md border border-gray-300 px-3 pb-1 pt-7 text-sm focus:border-black focus:outline-none"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="absolute left-3 top-2 text-[12px]">EMAIL</label>
          </div>

          <div className="relative h-fit">
            <input
              className="w-full rounded-md border border-gray-300 px-3 pb-1 pt-7 text-sm focus:border-black focus:outline-none"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <label className="absolute left-3 top-2 text-[12px]">
              PASSWORD
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-black py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isPending ? "Registering..." : "Register"}
          </button>

          <p className="text-center text-xs text-gray-600">
            Have an account?{" "}
            <Link className="text-blue-400 hover:text-blue-600" to="/signin">
              Sign in
            </Link>
          </p>

          {errorMessage && (
            <p className="text-center text-sm text-red-500">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
}
