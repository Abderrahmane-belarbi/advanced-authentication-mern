import { google } from 'googleapis';

app.get("/google", (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.MODE === "development"
      ? process.env.LOCAL_GOOGLE_REDIRECT_URI
      : process.env.PUBLIC_GOOGLE_REDIRECT_URI
  );

  const scopes = ['https://www.googleapis.com/auth/gmail.send'];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // ensures refresh token is returned
  });

  res.redirect(url); // send user to Google login
});

// Handle the redirect/callback
app.get("/google/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send("No code returned from Google");

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.MODE === "development"
      ? process.env.LOCAL_GOOGLE_REDIRECT_URI
      : process.env.PUBLIC_GOOGLE_REDIRECT_URI
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    // tokens contain access_token and refresh_token
    console.log("Tokens:", tokens);

    // Here you can save refresh_token to your DB or env variable
    res.send("Authorization successful! You can close this tab.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error exchanging code for tokens");
  }
});