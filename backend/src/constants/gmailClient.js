const { google } = require("googleapis");
const { createOAuthClient } = require("./googleClient");

async function getGmailClient(user) {
  const oAuth2Client = createOAuthClient();

  oAuth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  // Auto refresh handling
  oAuth2Client.on("tokens", (tokens) => {
    if (tokens.refresh_token) {
      console.log("New refresh token:", tokens.refresh_token);
    }
    if (tokens.access_token) {
      console.log("New access token:", tokens.access_token);
      // TODO: save updated access_token in DB
    }
  });

  return google.gmail({ version: "v1", auth: oAuth2Client });
}

module.exports = { getGmailClient };