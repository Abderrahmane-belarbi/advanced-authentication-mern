import { Lock, Mail, User } from "lucide-react";
import { AuthCard } from "../components/auth/auth-card";
import InputField from "../components/shared/input-field";
import { useEffect, useState } from "react";
import GradientButton from "../components/gradient-button";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthChecker from "../components/password-strength-checker";
import { useAuth } from "../store/auth-store";
import { registerSchema } from "../lib/validation/user-schema";
import { z } from "zod";
import { SocialLoginButton } from "../components/shared/social-login-button";

export default function Register() {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: undefined,
    name: undefined,
    password: undefined,
    confirmPassword: undefined
  });

  const { signup, clearAuthFeedback, isLoading, error, googleSign } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearAuthFeedback();
  }, [clearAuthFeedback]);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setInput((prev) => {
      return { ...prev, [name]: value };
    });
    setErrors((prev) => {
      return { ...prev, [name]: undefined }
    })
  }

  function toFieldsErrors(error) {
    const flat = z.flattenError(error).fieldErrors;
    return {
      email: flat.email?.[0],
      name: flat.name?.[0],
      password: flat.password?.[0],
      confirmPassword: flat.confirmPassword?.[0],
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const validatedInput = registerSchema.safeParse(input);
    if(!validatedInput.success) {
      const zodErrors = toFieldsErrors(validatedInput.error);
      setErrors(zodErrors)
      return;
    }
    
    try {
      await signup(
        validatedInput.data.email,
        validatedInput.data.password,
        validatedInput.data.name,
      );
      navigate("/verify-email", { state: { email: input.email }});
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AuthCard title="Create Account" subtitle="Join us to get started">
      <form onSubmit={handleRegister} className="space-y-5">
        <InputField
          type="text"
          name="name"
          setError={errors.name}
          Icon={User}
          placeholder="Full name"
          value={input.name}
          onChange={handleInputChange}
          autoComplete="name"
          autoCapitalize="words"
          required
        />
        <InputField
          type="email"
          name="email"
          setError={errors.email}
          Icon={Mail}
          placeholder="example@email.com"
          value={input.email}
          onChange={handleInputChange}
          autoComplete="email"
          required
        />
        <InputField
          type="password"
          name="password"
          setError={errors.password}
          Icon={Lock}
          placeholder="Register password"
          value={input.password}
          onChange={handleInputChange}
          autoComplete="new-password"
          required
        />
        <InputField
          type="password"
          name="confirmPassword"
          setError={errors.confirmPassword}
          Icon={Lock}
          placeholder="Confirm password"
          value={input.confirmPassword}
          onChange={handleInputChange}
          autoComplete="new-password"
          required
        />
        {error && (
          <p
            className="text-red-500 text-sm"
            role="alert"
          >
            {error}
          </p>
        )}
        <PasswordStrengthChecker password={input.password} />

        <GradientButton
          className="text-sm"
          isLoading={isLoading}
          onClick={handleRegister}
          type="submit"
        >
          Create Account
        </GradientButton>
        <div className="flex items-center gap-1">
          <span className="h-px w-full bg-muted-foreground/20"/>
          <span className="w-fit shrink-0 text-xs uppercase text-muted-foreground/60">Or continue with</span>
          <span className="h-px w-full bg-muted-foreground/20"/>
        </div>
        <SocialLoginButton isLoading={isLoading} type="button" provider='google' onClick={googleSign} />
      </form>
      <div className="mt-6 space-y-4 text-center text-sm">
        <div className="text-center text-sm">
          <span className="text-muted-foreground">
            Already have an account?
          </span>{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:text-secondary transition-colors"
            type="submit"
          >
            Sign in
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
