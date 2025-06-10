import express from "express";
import { attachGoogleAccessToken } from "../middlewares/tokenManager.js";
import {
  createUserCalendarEvent,
  fetchMeetingEvents,
  fetchUserEvents,
  getUserPreferences,
  setUserPreferences,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/events", attachGoogleAccessToken, fetchUserEvents);
userRouter.post(
  "/create-event",
  attachGoogleAccessToken,
  createUserCalendarEvent
);
userRouter.get("/meeting-events", attachGoogleAccessToken, fetchMeetingEvents);
userRouter.post("/preferences", attachGoogleAccessToken, setUserPreferences);
userRouter.get("/preferences", attachGoogleAccessToken, getUserPreferences);

export default userRouter;
