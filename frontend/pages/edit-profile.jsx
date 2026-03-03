'use client';

import { useState } from 'react';
import { ArrowLeft, User, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import InputField from '../components/shared/input-field';
import GradientButton from '../components/gradient-button';
import { FeedbackAlert } from '../components/shared/feedback-alert';


export default function EditProfile() {
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    dateOfBirth: '1990-05-15',
    bio: 'Full-stack developer and design enthusiast',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
      <div className="w-full max-w-2xl px-4">
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
                <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
                <p className="mt-1 text-muted-foreground">Update your personal information</p>
              </div>
            </div>
          </div>

          {/* Success Alert */}
          {showSuccess && (
            <FeedbackAlert
              type="success"
              title="Profile Updated"
              message="Your changes have been saved successfully."
            />
          )}

          {/* Form Card */}
          <div className="rounded-xl border border-border/40 bg-card p-6 backdrop-blur-md">
            <div className="space-y-6">
              {/* Name Section */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Name</h2>
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
                <h2 className="text-lg font-semibold text-foreground mb-4">Contact</h2>
                <div className="space-y-4">
                  <InputField
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    Icon={Mail}
                  />
                  <InputField
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    Icon={Phone}
                  />
                </div>
              </div>

              {/* Location Section */}
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
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
                <h2 className="text-lg font-semibold text-foreground mb-4">Date of Birth</h2>
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
                <h2 className="text-lg font-semibold text-foreground mb-4">Bio</h2>
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-lg border border-border/40 bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:bg-input"
                />
                <p className="mt-2 text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link to="/dashboard" className="flex-1">
                  <button className="w-full h-12 rounded-lg border border-border/40 text-foreground hover:bg-muted/30 transition-all font-semibold">
                    Cancel
                  </button>
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <GradientButton disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </GradientButton>
                </button>
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
