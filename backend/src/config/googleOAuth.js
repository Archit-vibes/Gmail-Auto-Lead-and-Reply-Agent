// Google OAuth config

const { google } = require('googleapis');

const oauth2client = new google.auth.Oauth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
)