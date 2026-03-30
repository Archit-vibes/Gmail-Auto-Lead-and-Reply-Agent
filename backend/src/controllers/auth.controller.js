
// Auth controller

const express = require('express');
const prisma = require('../config/prisma');
const axios = require('axios');
const env = require('dotenv').config();
const oauth2Client = require('../config/googleOAuth');

//------Config------

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

//------Controllers------

async function callGoogleAuth(req, res) {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      "openid",
      "email",
      "profile",
      "https://mail.google.com/",
      "https://www.googleapis.com/auth/calendar"
    ],
  });

  res.redirect(authUrl);
}




async function callbackHandler(req, res) {

  const { code } = req.query;

  if (!code) {
    return res.status(400).send('No code received');
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Verify the user
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.CLIENT_ID
    });

    const payload = ticket.getPayload();
    console.log(payload);

    console.log("Payload extracted successfully. Starting Prisma Upsert...");
    
    // Store tokens in DB
    const user = await prisma.user.upsert({
      where: { email: payload.email },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
      },

      create: {
        googleID: payload.sub,
        email: payload.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || "",
      }
    });

    console.log("Prisma Upsert Success! Redirecting user ID:", user.id);
    res.redirect("http://localhost:5173/dashboard?userId=" + user.id);


  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Token exchange failed');
  }
};


module.exports = {
  callGoogleAuth,
  callbackHandler,
};
