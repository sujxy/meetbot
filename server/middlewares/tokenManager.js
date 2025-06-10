import User from "../models/user.js";
import { refreshAccessToken } from "../utils/utils.js";
import jwt from "jsonwebtoken";

export const attachGoogleAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ message: "User not found" });

    // Check if token is expired
    if (
      !user.googleAccessToken ||
      !user.tokenExpiry ||
      user.tokenExpiry < Date.now()
    ) {
      // Refresh access token
      if (!user.refreshToken)
        return res.status(401).json({ message: "No refresh token" });
      const newAccessToken = await refreshAccessToken(user.refreshToken);

      user.googleAccessToken = newAccessToken;
      user.tokenExpiry = Date.now() + 3600 * 1000;
      await user.save();
    }

    req.googleAccessToken = user.googleAccessToken;
    req.user = user;
    next();
  } catch (err) {
    console.log("Error attaching Google access token:", err);
    return res.status(401).json({ message: err.message });
  }
};
