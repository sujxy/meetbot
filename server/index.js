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
        console.log(data.results[0].transcript);
        const transcriptChunk = data.results[0].alternatives[0].transcript;
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
    const { meetId } = req.query;

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

    const summaryText = summaryResponse.choices[0].message.content;

    const newSummary = new Summary({
      meetingId: meetId,
      transcript_id: transcript._id,
      content: summaryText,
    });
    await newSummary.save();

    const extractedContent = summaryText.replace(/<\/?summary>/g, "");

    res.json({
      success: true,
      meetId: meetId,
      summary: extractedContent,
    });
  } catch (error) {
    console.error("Error during summarization:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/view", async (req, res) => {
  const { meetId } = req.query;

  const summary = await Summary.findOne({ meetingId: meetId });

  res.send(summary.content);
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
