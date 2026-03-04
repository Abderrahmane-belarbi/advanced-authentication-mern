import { Link } from "react-router-dom";
import { FeedbackAlert } from "../components/shared/feedback-alert";
import InputField from "../components/shared/input-field";
import GradientButton from "../components/gradient-button";
import { useState } from "react";
import { AuthCard } from "../components/auth/auth-card";
import { Mail } from "lucide-react";
import { useAuth } from "../store/auth-store";

export default function ForgotPassword() {
  const { isLoading, error, forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      console.log(error.message);
    }
  };

  if (submitted) {
      return (
          <AuthCard
            title="Check Your Email"
            subtitle="We've sent you a password reset link"
          >
            <div className="space-y-6">
              <FeedbackAlert
                type="success"
                message="If an account exists, a reset link has been sent. Check your inbox and spam folder."
              />
  
              <div className="text-center text-sm space-y-3">
                <p className="text-muted-foreground">
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                    }}
                    className="text-primary hover:text-secondary transition-colors font-semibold"
                  >
                    Try again
                  </button>
                </p>
                <Link
                  to="/login"
                  className="block text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </AuthCard>
      );
    }
  
    return (
        <AuthCard
          title="Reset Password"
          subtitle="Enter your email to receive a reset link"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <FeedbackAlert type="error" message={error} />}  
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <InputField
                id="email"
                Icon={Mail}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
  
            <GradientButton type="submit" isLoading={isLoading}>
              Send Reset Link
            </GradientButton>
          </form>
  
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        </AuthCard>
    );
}