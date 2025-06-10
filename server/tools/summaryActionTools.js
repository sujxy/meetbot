import { tool } from "@langchain/core/tools";
import axios from "axios";
import { date, z } from "zod";
import { randomUUID } from "crypto";

/**
 * Note that the descriptions here are crucial, as they will be passed along
 * to the model along with the class name.
 */
const createCalendarEventToolSchema = z.object({
  title: z.string().describe("The title of the event"),
  description: z.string().describe("A description of the event"),
  date: date().describe("The date of the event in YYYY-MM-DD format"),
  startTime: z
    .string()
    .describe("The start time of the event in HH:MM format (24h) "),
  endTime: z
    .string()
    .describe("The end time of the event in HH:MM format (24h) "),
});

export const getTodayDateTool = tool(
  async () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    // Return only date for clarity
    return `Today's date is ${yyyy}-${mm}-${dd} `;
  },
  {
    name: "getTodayDate",
    description:
      "Use this first to resolve any date references like 'today', 'tomorrow', etc.",
    schema: z.object({}),
  }
);

export const createCalendarEventTool = tool(
  async ({ title, description, date, startTime, endTime }) => {
    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return "Error: Invalid date or time format";
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
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      };

      const response = await axios.post(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
        event,
        {
          headers: {
            Authorization: `Bearer ${""}`,
            "Content-Type": "application/json",
          },
        }
      );

      return `Successfully created event "${title}" for ${date} from ${startTime} to ${endTime}`;
    } catch (err) {
      console.error("Calendar API error:", err?.response?.data || err.message);
      return `Failed to create event: ${
        err?.response?.data?.error?.message || err.message
      }`;
    }
  },
  {
    name: "createCalendarEvent",
    description:
      "Creates a calendar event with Google Meet link. Use after resolving dates with getTodayDate.",
    schema: createCalendarEventToolSchema,
  }
);
