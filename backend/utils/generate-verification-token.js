export function generateVerificationToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateVerificationTokenExpiresAt() {
  return Date.now() + 15 * 60 * 1000; // 15 min
}