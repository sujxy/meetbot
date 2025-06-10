import express from "express";
import {
  handleGoogleLogin,
  refreshLoggedInUser,
} from "../controllers/authControllers.js";
import User from "../models/user.js";

const router = express.Router();

router.post("/google", handleGoogleLogin);
router.get("/me", refreshLoggedInUser);

export default router;
