import express from "express";
import { checkAuth, forgotPassword, login, logout, resendVerificationEmail, resetPassword, signup, verificationEmail } from "../controllers/auth-controller.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth)

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verificationEmail);
router.post("/resend-verification-email", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


export default router;