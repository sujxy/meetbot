import express from "express";
import { attachGoogleAccessToken } from "../middlewares/tokenManager.js";
import {
  fetchMeetingSumamry,
  generateSummary,
  regenerateSummary,
} from "../controllers/summaryController.js";
import { attachModelInstance } from "../middlewares/modelManager.js";

const summaryRouter = express.Router();

summaryRouter.post(
  "/generate",
  attachGoogleAccessToken,
  attachModelInstance,
  generateSummary
);
summaryRouter.post(
  "/regenerate",
  attachGoogleAccessToken,
  attachModelInstance,
  regenerateSummary
);
summaryRouter.get("/", fetchMeetingSumamry);

export default summaryRouter;
