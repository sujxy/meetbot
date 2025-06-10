import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import mongoose from "mongoose";
import Transcript from "./models/transcript.js";
import multer from "multer";
import speech from "@google-cloud/speech";
import authRoutes from "./routes/authRoutes.js";
import meetingRouter from "./routes/meetingRoutes.js";
import summaryRouter from "./routes/summaryRoutes.js";
import userRouter from "./routes/userRoutes.js";

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

io.on("connection", (socket) => {
  console.log("Client connected");
  let meetingId = null;
  let recognizeStream = null;

  function startStream() {
    recognizeStream = speechClient
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
      })
      .on("error", (err) => {
        console.error("Speech stream error:", err);

        if (recognizeStream) {
          recognizeStream.end();
        }
        startStream();
      })
      .on("end", () => {
        startStream();
      });
  }

  startStream();

  socket.on("audio_chunk", ({ meetId, message }) => {
    meetingId = meetId;
    if (!recognizeStream.writableEnded) {
      recognizeStream.write(Buffer.from(message));
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
    if (recognizeStream) recognizeStream.end();
  });
});

app.use("/meeting", meetingRouter);
app.use("/auth", authRoutes);
app.use("/summary", summaryRouter);
app.use("/user", userRouter);

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
  .catch((e) => {
    console.log(`error connecting : ${e}`);
  });

//client id 446953567556-k9179dbk9rmutlar9e44bj9rg2p9arek.apps.googleusercontent.com
