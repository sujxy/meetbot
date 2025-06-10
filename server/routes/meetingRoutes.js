import express from "express";
import {
  createNewMeeting,
  deleteMeeting,
  fetchBulkMeetings,
  fetchSingleMeeting,
  getChatResponse,
  getMeetingChat,
  searchMeetings,
} from "../controllers/meetingControllers.js";
import { attachGoogleAccessToken } from "../middlewares/tokenManager.js";
import { attachModelInstance } from "../middlewares/modelManager.js";
const meetingRouter = express.Router();

meetingRouter.get("/search-meetings", attachGoogleAccessToken, searchMeetings);
meetingRouter.get("/bulk", attachGoogleAccessToken, fetchBulkMeetings);
meetingRouter.get("/:meetId", fetchSingleMeeting);
meetingRouter.get("/:meetId/chat", getMeetingChat);
meetingRouter.post(
  "/:meetId/chat",
  attachGoogleAccessToken,
  attachModelInstance,
  getChatResponse
);
meetingRouter.post("/new", attachGoogleAccessToken, createNewMeeting);
meetingRouter.post("/delete/:id", deleteMeeting);

export default meetingRouter;
