import { Calendar, LogOut, Mail, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionCard } from "../components/shared/section-card";
import { useAuth } from "../store/auth-store";
import { formatDate } from "../lib/utils/format-date";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, logout, clearAuthFeedback } = useAuth();

  async function handleLogout() {
    await logout();
  }

  useEffect(() => {
    clearAuthFeedback();
  }, [clearAuthFeedback])
  

  return (
    <div className="w-full max-w-2xl px-4 py-12">
      <div className="animate-[fade-in_0.5s_ease-out] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome back to your account
            </p>
          </div>
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Home
          </Link>
        </div>

        {/* Profile Section */}
        <SectionCard
          title="Profile Information"
          subtitle="Manage your personal details"
          icon={<Shield className="h-6 w-6 text-primary" />}
        >
          <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">Full Name</label>
                  <p className="mt-1 font-semibold text-foreground">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <p className="mt-1 font-semibold text-foreground">{user.email}</p>
                </div>
                { user?.phone && <div>
                  <label className="text-sm text-muted-foreground">Phone Number</label>
                  <p className="mt-1 font-semibold text-foreground">{user.phone}</p>
                </div>}
                { user?.location &&<div>
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <p className="mt-1 font-semibold text-foreground">{user.location}</p>
                </div>}
                { user?.birthDate && <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </label>
                  <p className="mt-1 font-semibold text-foreground">{user.birthDate?.split("T")[0]}</p>
                </div>}
              </div>

              {/* Bio Section */}
              { user.bio && <div className="pt-4 border-t border-border/40">
                <label className="text-sm text-muted-foreground block mb-2">Bio</label>
                <p className="text-foreground leading-relaxed">
                  {user.bio}
                </p>
              </div>}

              <Link to="/edit-profile">
                <button className="text-primary hover:text-secondary transition-colors text-sm font-semibold">
                  Edit Profile →
                </button>
              </Link>
            </div>
        </SectionCard>

        {/* Account Activity Section */}
        <SectionCard
          title="Account Activity"
          subtitle="Recent login and security events"
          icon={<Calendar className="h-6 w-6 text-secondary" />}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between rounded-lg border border-border/40 bg-muted/30 p-4">
              <div>
                <p className="font-medium text-foreground">Sign In</p>
                <p className="text-sm text-muted-foreground">
                  From {user.authMeta.login.browser} on {user.authMeta.login.os}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(user.authMeta.login.at)}
              </span>
            </div>
            <div className="flex items-start justify-between rounded-lg border border-border/40 bg-muted/30 p-4">
              <div>
                <p className="font-medium text-foreground">Password Changed</p>
                <p className="text-sm text-muted-foreground">
                  Account security updated
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{user.authMeta.passwordChangedAt ? formatDate(user.authMeta.passwordChangedAt) : "Never"}</span>
            </div>
            <div className="flex items-start justify-between rounded-lg border border-border/40 bg-muted/30 p-4">
              <div>
                <p className="font-medium text-foreground">Email Verified</p>
                <p className="text-sm text-muted-foreground">
                  Email address confirmed
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{user.authMeta.emailVerifiedAt ? formatDate(user.authMeta.emailVerifiedAt) : "Never"}</span>
            </div>
          </div>
        </SectionCard>

        {/* Security Section */}
        {/*<SectionCard
          title="Security Settings"
          subtitle="Manage your account security"
          icon={<MapPin className="h-6 w-6 text-accent" />}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 p-4">
              <div>
                <p className="font-medium text-foreground">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <button className="text-primary hover:text-secondary transition-colors text-sm font-semibold">
                Enable
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/30 p-4">
              <div>
                <p className="font-medium text-foreground">Active Sessions</p>
                <p className="text-sm text-muted-foreground">
                  Currently signed in on 1 device
                </p>
              </div>
              <button className="text-primary hover:text-secondary transition-colors text-sm font-semibold">
                View
              </button>
            </div>
          </div>
        </SectionCard>*/}

        {/* Logout Button */}
        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            disabled={false}
            className="flex-1 h-12 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            {false ? "Logging out..." : "Sign Out"}
          </button>
        </div>
      </div>
    </div>
  );
}
