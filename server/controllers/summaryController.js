import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import Summary from "../models/summary.js";
import Transcript from "../models/transcript.js";
import Event from "../models/events.js";
import Meeting from "../models/meeting.js";
import fs from "fs";
import { extractLLMResponse, indexTranscript } from "../utils/utils.js";

export const regenerateSummary = async (req, res) => {
  try {
    const { meetId } = req.body;
    const model = req.model;
    const transcript = await Transcript.findOne({ meeting_id: meetId });
    if (!transcript) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16).replace("T", " ");

    const SummaryPrompt = fs
      .readFileSync("./prompts/prompts.txt", "utf8")
      .toString();

    const meetingTranscripts = transcript.content?.join(" ");

    const messages = [
      new SystemMessage(SummaryPrompt),
      new HumanMessage(
        `CURRENT DATE AND TIME: ${currentDateTime}
    
    Analyze this meeting transcript and follow these steps strictly:
    - This is to regenerate the summary so no need to identify any function calls.
    - Aim to generate a more elaborate summary in the mentioned format.
    
    Transcript: ${meetingTranscripts}`
      ),
    ];
    const llmResponse = await model.invoke(messages);

    const rawSummary = llmResponse.content;
    const extractedContent = extractLLMResponse(rawSummary);

    console.log("Extracted Content:", extractedContent);

    const updatedSummary = await Summary.findOneAndUpdate(
      { meeting_id: meetId },
      {
        transcript_id: transcript._id,
        content: extractedContent.summary,
      },
      { new: true, upsert: true }
    );

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetId,
      {
        title: extractedContent.title,
        keypoints: extractedContent.keypoints,
        tags: extractedContent.tags,
        isSummarized: true,
      },
      { new: true }
    );

    if (!updatedMeeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found/updated !" });
    }

    res.json({
      success: true,
      meetId: meetId,
      updatedSummary: updatedSummary.content || "",
    });
  } catch (error) {
    console.error("Error during summarization:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const generateSummary = async (req, res) => {
  try {
    const { meetId, duration } = req.body;
    const model = req.model;
    const transcript = await Transcript.findOne({ meeting_id: meetId });
    if (!transcript) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16).replace("T", " ");

    const SummaryPrompt = fs
      .readFileSync("./prompts/prompts.txt", "utf8")
      .toString();

    const meetingTranscripts = transcript.content?.join(" ");

    const messages = [
      new SystemMessage(SummaryPrompt),
      new HumanMessage(
        `CURRENT DATE AND TIME: ${currentDateTime}
    
    Analyze this meeting transcript and follow these steps strictly:
    - Identify any events or meetings mentioned in the transcript and output a <function>...</function> block for each, using the current date/time to resolve references like "today", "tomorrow", etc.
    - Only after all function calls are identified, generate the meeting summary in the required HTML format.
    
    Transcript: ${meetingTranscripts}`
      ),
    ];
    const llmResponse = await model.invoke(messages);

    const rawSummary = llmResponse.content;
    const extractedContent = extractLLMResponse(rawSummary);
    console.log("Extracted Content:", extractedContent);
    if (extractedContent.functions.length > 0) {
      await Event.insertMany(
        extractedContent.functions.map((func) => {
          if (func.name == "createCalendarEvent") {
            return {
              meeting_id: meetId,
              title: func.args.title,
              description: func.args.description,
              date: func.args.date,
              startTime: func.args.startTime,
              endTime: func.args.endTime,
              author: "AI",
            };
          }
        })
      );
    }

    await indexTranscript(transcript);
    const updatedSummary = await Summary.findOneAndUpdate(
      { meeting_id: meetId },
      {
        transcript_id: transcript._id,
        content: extractedContent.summary,
      },
      { new: true, upsert: true }
    );

    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetId,
      {
        title: extractedContent.title,
        keypoints: extractedContent.keypoints,
        duration: duration,
        tags: extractedContent.tags,
        isSummarized: true,
      },
      { new: true }
    );

    if (!updatedMeeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found/updated !" });
    }

    res.json({
      success: true,
      hasIdentifiedEvents: extractedContent.functions.length > 0,
      meetId: meetId,
      updatedMeeting: updatedMeeting,
    });
  } catch (error) {
    console.error("Error during summarization:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchMeetingSumamry = async (req, res) => {
  try {
    const { meetId } = req.query;

    // Fetch meeting info from Meeting
    const meeting = await Meeting.findById(meetId);
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    if (meeting.isSummarized === false) {
      return res.status(200).json({
        success: true,
        summary: [],
        IdentifiedEvents: [],
      });
    }

    const summary = await Summary.findOne({ meeting_id: meetId });
    const meetingSummaryEvents = await Event.find({ meeting_id: meetId });

    res.status(200).json({
      success: true,
      summary: summary ? summary.content : "",
      IdentifiedEvents: meetingSummaryEvents,
    });
  } catch (error) {
    console.error("Error fetching meeting summary:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
