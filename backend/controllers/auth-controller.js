import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  generateVerificationToken,
  generateVerificationTokenExpiresAt,
} from "../utils/generate-verification-token.js";
import { generateTokenSetCookie } from "../utils/generate-token-cookie.js";
import { UAParser } from "ua-parser-js";
import { sendMail } from "../config/google-mailer.js";


export async function checkAuth(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ error: "User not found" });
    return res
      .status(200)
      .json({ message: "User found", user });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message });
  }
}

export async function signup(req, res) {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        message: "Email, password and name are required",
      });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(409).json({ message: "Email already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = generateVerificationTokenExpiresAt();

    const createdUser = await User.create({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt,
      authMeta: {
        login: {
          at: null,
          ipAddress: null,
          browser: null,
          os: null,
          device: null
        },
        passwordChangedAt: null
      }
    });

    if (!createdUser) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Don't block signup response on external SMTP/provider availability.
    sendMail({
      to: createdUser.email,
      subject: "Verify your email",
      text: `Your verification code is ${verificationToken}`,
    });

    return res.status(201).json({
      message: "User created successfully, Please verify your email.",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function login(req, res) {
  const userAgent = req.headers["user-agent"];
  const parser = new UAParser(userAgent);
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const browser = parser.getBrowser().name;
  const os = parser.getOS().name;
  const device = parser.getDevice().type || "desktop";
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ error: "Email and password are required" });

    // we put Invalid credentials for both email and password for security reasons
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in" });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(400).json({ error: "Invalid credentials" });

    user.authMeta.login.at = new Date();
    user.authMeta.login.ipAddress = ipAddress;
    user.authMeta.login.browser = browser;
    user.authMeta.login.os = os;
    user.authMeta.login.device = device;
    await user.save();

    // jwt
    generateTokenSetCookie(res, user._id);

    return res.status(200).json({
      message: "User Logged in successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        authMeta: user.authMeta,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export function logout(req, res) {
  res.clearCookie("token");
  res
    .status(200)
    .json({ message: "Logged out successfully" });
}

export async function resendVerificationEmail(req, res) {
  try {
    const resetCooldown = parseInt(process.env.VERIFICATION_RESEND_COOLDOWN_SECONDS || 60);

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    let remainingSeconds = 0;

    if(user.verificationResendAvailableAt) {
      const availableAt = user.verificationResendAvailableAt.getTime(); // milliseconds
      remainingSeconds = Math.max(
        0,
        Math.ceil((availableAt - Date.now()) / 1000),
      );
    }

    if(remainingSeconds > 0) { // 429 Too many requests
      return res.status(429).json({ message: `You can request a new verification code in ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}.` });
    }

    const verificationToken = generateVerificationToken();
    const verificationTokenExpiresAt = generateVerificationTokenExpiresAt();

    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = verificationTokenExpiresAt;
    user.verificationResendAvailableAt = new Date(Date.now() + resetCooldown * 1000);
    await user.save();

    sendMail({
      to: user.email,
      subject: "Verify your email",
      text: `Your verification code is ${verificationToken}`,
    });
    return res
      .status(200)
      .json({ message: "Verification code resent successfully. It may take up to a minute to arrive." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function verificationEmail(req, res) {
  const userAgent = req.headers["user-agent"];
  const parser = new UAParser(userAgent);
  const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const browser = parser.getBrowser().name;
  const os = parser.getOS().name;
  const device = parser.getDevice().type || "desktop";
  try {
    const { code, email } = req.body;
    if (!code || !email)
      return res.status(400).json({ message: "Required fields are missing" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Please Signup first" });

    if (user.isVerified)
      return res.status(410).json({ message: "Email already verified" });

    if (!user.verificationToken || !user.verificationTokenExpiresAt) {
      return res.status(400).json({ message: "No active verification token" });
    }

    if (String(user.verificationToken) !== String(code))
      return res.status(400).json({ message: "Invalid verification code" });

    if (Date.now() > new Date(user.verificationTokenExpiresAt).getTime()) {
      return res.status(400).json({ message: "Token expired" });
    }

    user.isVerified = true;
    user.verificationTokenExpiresAt = undefined;
    user.verificationToken = undefined;
    user.authMeta.login.at = new Date();
    user.authMeta.login.ipAddress = ipAddress;
    user.authMeta.login.browser = browser;
    user.authMeta.login.os = os;
    user.authMeta.login.device = device;
    user.authMeta.emailVerifiedAt = new Date();

    await user.save();

    // jwt
    generateTokenSetCookie(res, user._id);

    return res.status(200).json({
      message: "The email has been verified successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        authMeta: user.authMeta,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      // Generate reset token and hash it for security
      const resetPasswordToken = crypto.randomUUID();
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetPasswordToken)
        .digest("hex");
      // Update user token
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpiresAt = Date.now() + 10 * 60 * 1000; // expires in 10 min
      await user.save();

      // Send email to user resetPasswordToken not the hashed
      // Send the raw token to the user in the link
      // When user comes back with raw token, you hash it and compare to DB
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;
      sendMail({
        to: user.email,
        subject: "Reset your password",
        text: `You requested a password reset. Use this link to reset your password:\n${resetUrl} (expires in 10 minutes).\nIf you didn't request this, ignore this email.`,
      });
    }

    return res
      .status(200)
      .json({ message: "If an account exists, a reset link has been sent. Check your inbox and spam folder." });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message });
  }
}

export async function resetPassword(req, res) {
  try {
    const token = req.params.token;
    const { password } = req.body;
    if (!password)
      return res
        .status(400)
        .json({ error: "Password required" });
    if (!token)
      return res
        .status(400)
        .json({ error: "Token required" });

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiresAt: {
        $gt: Date.now(), // find the user if thier token not expires by check gt: grater than
      },
    });

    if (!user)
      return res
        .status(400)
        .json({ error: "Invalid or expired reset password token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.authMeta.passwordChangedAt = new Date()
    await user.save();

    return res
      .status(200)
      .json({ message: "Password reset successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message });
  }
}
