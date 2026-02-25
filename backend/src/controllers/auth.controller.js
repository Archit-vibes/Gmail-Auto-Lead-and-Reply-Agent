
// Auth controller

const express = require('express');
const prisma = require('../config/prisma');
const axios = require('axios');
const env = require('dotenv').config();

//------Config------

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

//------Controllers------

async function callGoogleAuth(req, res) {
    

    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        include_granted_scopes: 'true',
        access_type: 'offline',     // needed for refresh_token
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    res.redirect(authUrl);
}




async function callbackHandler(req , res){
    
    const { code } = req.query;

    if (!code) {
    return res.status(400).send('No code received');
  }

  try {
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    const tokens = tokenResponse.data;

    res.json(tokens); // shows access_token, refresh_token, id_token

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Token exchange failed');
  }
};


module.exports = {
  callGoogleAuth,
  callbackHandler,
};
