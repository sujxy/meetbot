import User from "../models/user.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import qs from "querystring";

export const handleGoogleLogin = async (req, res) => {
  const { code } = req.body;
  try {
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const { access_token, refresh_token, expires_in } = tokenRes.data;

    // Get user info
    const userInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    const { email, name, picture, sub } = userInfo.data;

    // Calculate expiry time
    const expiryTime = Date.now() + expires_in * 1000;

    // Find or create user, update tokens and expiry
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        picture,
        googleId: sub,
        googleAccessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiry: expiryTime,
      });
    } else {
      user.googleAccessToken = access_token;
      if (refresh_token) user.refreshToken = refresh_token;
      user.tokenExpiry = expiryTime;
      await user.save();
    }

    // Issue JWT for your app
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      user: { email, name, picture, googleId: sub },
      token,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Google auth failed" });
  }
};

export const refreshLoggedInUser = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};
