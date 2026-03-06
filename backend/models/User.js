import { model, Schema } from "mongoose"

const AuthMetaSchema = new Schema({
  login: {
    at: Date,
    ipAddress: String,
    userAgent: String,
    browser: String,
    os: String,
    device: String
  },
  passwordChangedAt: Date,
  emailVerifiedAt: Date
})

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: String,
  name: {
    type: String,
    required: true
  },
  picture: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  verificationResendAvailableAt: Date,
  authMeta: AuthMetaSchema,
  phone: String,
  location: String,
  birthDate: Date,
  bio: String
}, { timestamps: true })

const User = model("User", UserSchema);

export default User;