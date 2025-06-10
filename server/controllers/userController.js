import axios from "axios";
import { randomUUID } from "crypto";
import Event from "../models/events.js";
import User from "../models/user.js";

export const fetchUserEvents = async (req, res) => {
  try {
    const accessToken = req.googleAccessToken;

    if (!accessToken) {
      return res
        .status(400)
        .json({ success: false, message: "Access token is required" });
    }

    const now = new Date();
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const timeMin = startDay.toISOString();
    const timeMax = endDay.toISOString();

    const calendarEvents = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          timeMin: timeMin,
          timeMax: timeMax,
          singleEvents: true,
          orderBy: "startTime",
        },
      }
    );

    res.status(200).json({
      success: true,
      events: calendarEvents.data.items,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUserCalendarEvent = async (req, res) => {
  try {
    const accessToken = req.googleAccessToken;
    const { eventId } = req.body;

    const eventData = await Event.findById(eventId);
    if (!eventData) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
    const { title, description, date, startTime, endTime } = eventData;

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Error: Invalid date or time format",
      });
    }

    const requestId = randomUUID();
    const event = {
      summary: title,
      description: description || "",
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: "UTC",
      },
      conferenceData: {
        createRequest: {
          requestId: requestId,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await axios.post(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      event,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    eventData.addedToCalendar = true;
    await eventData.save();

    return res.status(200).json({
      success: true,
      htmlLink: response.data.htmlLink,
      message: `Successfully created event "${title}" for ${date} from ${startTime} to ${endTime}`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to create event: ${
        err?.response?.data?.error?.message || err.message
      }`,
    });
  }
};

export const fetchMeetingEvents = async (req, res) => {
  const { meetId } = req.query;

  if (!meetId) {
    return res
      .status(400)
      .json({ success: false, message: "Meeting ID is required" });
  }

  try {
    const events = await Event.find({ meeting_id: meetId });

    if (!events || events.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No events found for this meeting" });
    }

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Error fetching meeting events:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const setUserPreferences = async (req, res) => {
  try {
    const { _id } = req.user;
    const { modelPreference } = req.body;

    if (!modelPreference) {
      return res.status(400).json({
        success: false,
        message: "Model preference is required",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { modelPreference },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser.modelPreference,
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user preferences",
    });
  }
};
export const getUserPreferences = async (req, res) => {
  try {
    const { _id, modelPreference } = req.user;

    return res.status(200).json({
      success: true,
      data: modelPreference,
    });
  } catch (error) {
    console.error("Error getting user preferences:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user preferences",
    });
  }
};
