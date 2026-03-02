import { create } from "zustand";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

const REQUEST_TIMEOUT_MS = Number(import.meta.env.VITE_API_REQUEST_TIMEOUT_MS || 15000);

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const useAuth = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: false,
  message: null,

  clearAuthFeedback: () => {
    set({ message: null, error: null })
  },
  checkAuth: async() => {
    set({ isCheckingAuth: true, isAuthenticated: false, error: null});
    try {
      const res = await fetch(`${API_URL}/check-auth`, {
        credentials: "include", // critical for cookie-based auth across frontend/backend origins
        // we need it:
        // when browser must accept Set-Cookie from backend response like /verify-email, /login
        // browser must send existing cookie to backend like /check-auth, /logout or any protected routes
      });
      const data = await res.json()
      if(res.ok) {
        set({ user: data.user, isAuthenticated: true});
        return;
      }
      set({ user: null })
    } catch (error) {
      set({ user: null })
      console.log(error);
    } finally {
      set({ isCheckingAuth: false })
    }
  },
  signup: async (email, password, name) => {
    set({ isLoading: true, error: null, message: null });
    try {
      const res = await fetchWithTimeout(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if(res.ok) {
        set({
          message: data.message,
        });
      } else {
        const errorMessage = data?.message || "Error signing up";
        set({
          error: errorMessage,
        });
        // for the frontend error to skip navigation to verify email
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.name === "AbortError"
        ? "Signup request timed out. Check server logs for SMTP/DB connectivity on Render."
        : (error.message || "Error signing up");
        console.log(errorMessage);
      set({ error: errorMessage })
      // for the frontend error to skip navigation to verify email
        throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
  resendVerificationEmail: async (email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      if(!email) {
        const noEmailError = "No verification request found. Please start the signup process."; 
        set({ error: noEmailError})
        throw new Error(noEmailError)
      };
      const res = await fetch(`${API_URL}/resend-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        set({ message: data.message });
      } else {
        const errorMessage = data?.message || "Unable to resend verification email";
        set({ error: errorMessage });
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error.message || "Unable to resend verification email";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },
  verifyEmail: async (code, email) => {
    set({ isLoading: true, error: null, message: null });
    try {
      if(!email) {
        const noEmailError = "No verification request found. Please start the signup process."; 
        set({ error: noEmailError})
        throw new Error(noEmailError)
      };    
      const res = await fetch(`${API_URL}/verify-email`, {
        credentials: "include", // critical for cookie-based auth across frontend/backend origins
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code, email }),
        credentials: "include", // critical for cookie-based auth across frontend/backend origins
        // we need it:
        // when browser must accept Set-Cookie from backend response like /verify-email, /login
        // browser must send existing cookie to backend like /check-auth, /logout or any protected routes
      });
      const data = await res.json();
      if(res.ok) {
        set({  isAuthenticated: true, message: data.message, user: data.user });
      } else if (res.status === 410) {
        set({ isAuthenticated: true, message: data.message, error: null });
      }
      else {
        set({ error: data.message, isAuthenticated: false });
        throw new Error(data.message);
      }
      return data
    } catch (error) {
        set({ error: error.message, isAuthenticated: false });
        throw new Error(error.message);
    } finally {
      set({ isLoading: false })
    }
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null, message: null })
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // critical for cookie-based auth across frontend/backend origins
        // we need it:
        // when browser must accept Set-Cookie from backend response like /verify-email, /login
        // browser must send existing cookie to backend like /check-auth, /logout or any protected routes
        body: JSON.stringify({
          email,
          password
        })
      });
      const data = await res.json();
      if(res.ok) {
        set({ user: data.user, message: data.message, isAuthenticated: true, error: null })
      } else {
        const loginError = data.error;
        set({ error: loginError })
        throw new Error(loginError);
      }
    } catch (error) {
      set({ error: error.message })
      throw new Error(error.message);
    } finally {
      set({ isLoading: false })
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null, message: null })
    try {
      const res = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include", // critical for cookie-based auth across frontend/backend origins
        // we need it:
        // when browser must accept Set-Cookie from backend response like /verify-email, /login
        // browser must send existing cookie to backend like /check-auth, /logout or any protected routes
      });
      const data = await res.json();
      if(res.ok) {
        set({ user: null, message: data.message, isAuthenticated: false, error: null })
      } else {
        const logoutError = data.error;
        set({ error: logoutError })
        throw new Error(logoutError);
      }
    } catch (error) {
      set({ error: error.message })
      throw new Error(error.message);
    } finally {
      set({ isLoading: false })
    }
  },
  forgotPassword: async (email) => {
    set({ isLoading: true, error: null, message: null })
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email
        })
      });
      const data = await res.json();
      if(res.ok) {
        set({ message: data.message });
        return;
      }
      throw new Error(data.error);
    } catch (error) {
      set({ error: error.message })
      throw error;
    } finally {
      set({ isLoading: false })
    }
  },
  resetPassword: async(token, password) => {
    set({ isLoading: true, error: null, message: null })
    try {
      const res = await fetch(`${API_URL}/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password
        })
      });
      const data = await res.json();
      if(res.ok) {
        set({ message: data.message });
        return;
      }
      throw new Error(data.error);
    } catch (error) {
      set({ error: error.message });
      throw error
    } finally {
      set({ isLoading: false })
    }
  }
}));
