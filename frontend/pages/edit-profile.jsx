"use client";

import { useState } from "react";
import { ArrowLeft, User, Mail, MapPin, Phone, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import InputField from "../components/shared/input-field";
import GradientButton from "../components/gradient-button";
import { FeedbackAlert } from "../components/shared/feedback-alert";
import { useAuth } from "../store/auth-store";

export default function EditProfile() {
  const { user, error, message, updateProfile, isLoading } = useAuth()
  if(!user) return null;

  const nameParts = user?.name?.split(" ") || [];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const [formData, setFormData] = useState({
    firstName,
    lastName,
    email: user.email,
    phone: "",
    location: "",
    dateOfBirth: "",
    bio: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const input = {
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        location: formData.location,
        birthDate: formData.dateOfBirth,
        bio: formData.bio,
      }
      await updateProfile(input)
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full max-w-2xl px-4 py-12">
      <div className="animate-[fade-in_0.5s_ease-out] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Edit Profile
              </h1>
              <p className="mt-1 text-muted-foreground">
                Update your personal information
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {message && (
          <FeedbackAlert
            type="success"
            title="Profile Updated"
            message={message}
          />
        )}

        {/* Form Card */}
        <div className="rounded-xl border border-border/40 bg-card p-6 backdrop-blur-md">
          <div className="space-y-4">
            {/* Name Section */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Name
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <InputField
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  Icon={User}
                />
                <InputField
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  Icon={User}
                />
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Contact
              </h2>
              <div className="space-y-2">
                <InputField
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  Icon={Mail}
                />
                <InputField
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  Icon={Phone}
                />
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Location
              </h2>
              <InputField
                name="location"
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={handleChange}
                Icon={MapPin}
              />
            </div>

            {/* Date of Birth Section */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Date of Birth
              </h2>
              <InputField
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                Icon={Calendar}
              />
            </div>

            {/* Bio Section */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Bio
              </h2>
              <textarea
                name="bio"
                placeholder="Tell us about yourself"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-border/40 bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-input"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link to="/dashboard" className="flex-1">
                <button className="w-full h-12 rounded-lg border border-border/40 text-foreground hover:bg-muted/30 transition-all font-semibold">
                  Cancel
                </button>
              </Link>
              <div className="flex-1">
                <GradientButton onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>

        {/* Information Alert */}
        <FeedbackAlert
          type="info"
          title="Email Changes"
          message="To change your email address, please verify it first via a confirmation link sent to your inbox."
        />
      </div>
    </div>
  );
}
