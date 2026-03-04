import { Lock, Mail } from "lucide-react";
import { AuthCard } from "../components/auth/auth-card";
import InputField from "../components/shared/input-field";
import GradientButton from "../components/gradient-button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../store/auth-store";
import { useEffect } from "react";
import { loginSchema } from "../lib/validation/user-schema";
import { z } from "zod";
import { FeedbackAlert } from "../components/shared/feedback-alert";

export default function Login() {
  const { login, error, message, isLoading, clearAuthFeedback } = useAuth();
  const [inputErrors, setInputErrors] = useState({
    email: undefined,
    password: undefined
  });
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    clearAuthFeedback();
  }, [clearAuthFeedback]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setInput((prev) => {
      return { ...prev, [name]: value };
    });
    setInputErrors((prev) => {
      return { ...prev, [name]: undefined }
    })
  }

  function extractFieldErrors(error) {
    const flattenError = z.flattenError(error).fieldErrors;
    return {
      email: flattenError.email?.[0],
      password: flattenError.password?.[0]
    }
    
  }

  async function handleLogin(e) {
    e.preventDefault();
    const validatedInput = loginSchema.safeParse(input);
    if(!validatedInput.success) {
      const errors = extractFieldErrors(validatedInput.error)
      setInputErrors(errors);
      return;
    }
    try {
      await login(validatedInput.data.email, validatedInput.data.password);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleLogin} className="space-y-5">
        {error && <FeedbackAlert type="error" message={error} />}
        {message && <FeedbackAlert type="success" message={message} />}
        <InputField
          type="email"
          name="email"
          Icon={Mail}
          placeholder="example@email.com"
          value={input.email}
          onChange={handleInputChange}
          setError={inputErrors.email}
          autoComplete="email"
          required
        />
        <InputField
          type="password"
          name="password"
          Icon={Lock}
          placeholder="Password"
          value={input.password}
          onChange={handleInputChange}
          setError={inputErrors.password}
          autoComplete="current-password"
          required
        />

        <GradientButton
          type="submit"
          onClick={handleLogin}
          isLoading={isLoading}
          disabled={isLoading}
        >
            Sign in
        </GradientButton>
      </form>
      <div className="mt-6 space-y-4 text-center text-sm">
        <Link
          to="/forgot-password"
          className="block text-muted-foreground hover:text-primary transition-colors"
        >
          Forgot your password?
        </Link>
        <div className="flex items-center justify-center gap-1">
          <span className="text-muted-foreground">
            Don&apos;t have an account?
          </span>
          <Link
            to="/register"
            className="font-semibold text-primary hover:text-secondary transition-colors"
          >
            Sign up
          </Link>
        </div>
        <Link
          to="/"
          className="block text-muted-foreground hover:text-primary transition-colors"
        >
          Back to home
        </Link>
      </div>
    </AuthCard>
  );
}
