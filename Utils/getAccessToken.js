const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TOKEN_FILE = path.join(__dirname, 'token.json');

async function getTokenFromFile() {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
  return JSON.parse(raw);
}

function isTokenValid(expiresAt) {
  return expiresAt - 30000 > Date.now(); // 30s buffer
}

async function refreshToken(oldRefreshToken) {
  const { data } = await axios.post('https://api.helpscout.net/v2/oauth2/token', {
    grant_type: 'refresh_token',
    refresh_token: oldRefreshToken,
    client_id: process.env.HELPSCOUT_CLIENT_ID,
    client_secret: process.env.HELPSCOUT_CLIENT_SECRET
  });

  const tokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000
  };

  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokenData, null, 2));
  return tokenData;
}

async function getValidAccessToken() {
  const tokenData = await getTokenFromFile();

  if (tokenData && isTokenValid(tokenData.expires_at)) {
    return tokenData.access_token;
  }

  if (!tokenData?.refresh_token) {
    throw new Error("Refresh token missing. Re-authentication required.");
  }

  const newToken = await refreshToken(tokenData.refresh_token);
  return newToken.access_token;
}

module.exports = { getValidAccessToken };
