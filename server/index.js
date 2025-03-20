import express, { urlencoded } from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import Transcript from "./models/transcript.js";
import multer from "multer";
import speech from "@google-cloud/speech";
import { Groq } from "groq-sdk";
import Summary from "./models/summary.js";
import fs from "fs";
import path from "path";
import Meeting from "./models/meeting.js";
import { extractLLMResponse } from "./utils/utils.js";

const PORT = 8000;

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

dotenv.config();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(morgan("common"));

const upload = multer({ dest: "uploads/" });
const speechClient = new speech.SpeechClient();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

io.on("connection", (socket) => {
  console.log("Client connected");
  let meetingId = null;

  const recognizeStream = speechClient
    .streamingRecognize({
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 44100,
        languageCode: "en-US",
        interimResults: true,
      },
    })
    .on("data", async (data) => {
      if (data.results[0]?.alternatives[0]) {
        const transcriptChunk = data.results[0].alternatives[0].transcript;
        console.log(transcriptChunk);
        socket.emit("transcription", transcriptChunk);
        if (meetingId) {
          await Transcript.findOneAndUpdate(
            { meeting_id: meetingId },
            {
              $setOnInsert: { meeting_id: meetingId },
              $push: { content: transcriptChunk },
              $set: { timestamp: new Date() },
            },
            { upsert: true }
          );
        }
      }
    });

  // Handle incoming audio data from frontend
  socket.on("audio_chunk", ({ meetId, message }) => {
    meetingId = meetId;
    recognizeStream.write(Buffer.from(message));
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    recognizeStream.end();
  });
});

app.post("/transcribe", upload.single("audioFile"), async (req, res) => {
  try {
    const { meetId } = req.body;

    const storedTranscript = await Transcript.findOne({
      meeting_id: req.body.meetId,
    });

    if (storedTranscript) {
      res.json({
        success: true,
        meetId: meetId,
        transcript: storedTranscript.content,
      });
      return;
    }

    const audioPath = req.file.path;
    const audioBytes = readFileSync(audioPath).toString("base64");

    const config = {
      encoding: "MP3",
      languageCode: "en-US",
      sampleRateHertz: 16000,
    };
    const audio = {
      content: audioBytes,
    };
    const request = {
      config,
      audio,
    };

    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    const newTranscript = new Transcript({
      meeting_id: meetId,
      content: transcription,
    });

    await newTranscript.save();

    res.json({
      success: true,
      meetId: meetId,
      transcript: transcription,
    });
  } catch (error) {
    console.error("Error during transcription or saving to DB:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/summarize", async (req, res) => {
  try {
    const { meetId, duration } = req.query;

    const transcript = await Transcript.findOne({ meeting_id: meetId });
    if (!transcript) {
      return res.status(404).json({ error: "Transcript not found" });
    }

    const SummaryPrompt = fs
      .readFileSync("./prompts/prompts.txt", "utf8")
      .toString();

    const meetingTranscripts = transcript.content?.join(" ");

    const summaryResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SummaryPrompt,
        },
        {
          role: "user",
          content: `Generate Minutes of Meeting from the following meeting transcript:\n${meetingTranscripts}`,
        },
      ],
      model: "mixtral-8x7b-32768",
    });

    const rawSummary = summaryResponse.choices[0].message.content;
    const extractedContent = extractLLMResponse(rawSummary);

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
      summary: extractedContent.summary,
    });
  } catch (error) {
    console.error("Error during summarization:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/meeting/new", async (req, res) => {
  try {
    const newMeeting = new Meeting({ title: "New-meeting" });
    await newMeeting.save();
    res.status(200).json({
      success: true,
      meetId: newMeeting._id,
    });
  } catch (error) {
    console.log("error creating meeting : ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/summary", async (req, res) => {
  const { meetId } = req.query;

  const summary = await Summary.findOne({ meeting_id: meetId });

  res.status(200).json({ success: true, summary: summary.content });
});

app.post("/meeting/delete/:id", async (req, res) => {
  try {
    const meetingId = req.params.id;
    console.log("deleting : ", meetingId);

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      return res
        .status(404)
        .json({ success: false, message: "Meeting not found" });
    }

    await Transcript.deleteOne({ meeting_id: meetingId });
    await Summary.deleteOne({ meeting_id: meetingId });
    await Meeting.findByIdAndDelete(meetingId);

    res.json({
      success: true,
      message: "Meeting and associated data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/meeting/bulk", async (req, res) => {
  try {
    const allMeetings = await Meeting.find({});
    if (allMeetings.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "Meetings not found" });
    }

    res.json({
      success: true,
      data: allMeetings,
    });
  } catch (error) {
    console.error("Error geting meeting:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/meeting/:meetId", async (req, res) => {
  try {
    const meetingData = await Meeting.findOne({
      _id: req.params.meetId,
    });

    res.status(200).json({
      success: true,
      data: meetingData,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/", (req, res) => {
  res.send("hello");
});

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`listening on  http://localhost:${PORT}`);
    });
  })
  .catch(() => {
    console.log(`error connecting`);
  });
